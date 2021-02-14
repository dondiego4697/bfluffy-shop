import {URL} from 'url';
import moment from 'moment';
import pMap from 'p-map';
import {keyBy, omit} from 'lodash';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {config} from 'app/config';
import {dbManager} from 'app/lib/db-manager';
import {OrderStatus} from 'db-entity/order';
import {smsProvider} from '$sms/sms';
import {Order, OrderPosition, Storage} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';
import {ClientError} from '$error/error';

interface Body {
    phone: number;
    delivery: {
        address: string;
        date: Date;
        comment?: string;
    };
    goods: {
        publicId: string;
        quantity: number;
        cost: number;
    }[];
}

export const createOrder = wrap<Request, Response>(async (req, res) => {
    const {phone, delivery, goods} = req.body as Body;

    const orderPublicId = await dbManager.getConnection().transaction(async (manager) => {
        const {manager: orderManager} = manager.getRepository(Order);

        const orderRaw = orderManager.create(Order, {
            data: {}, // TODO sdek
            clientPhone: String(phone),
            deliveryAddress: delivery.address,
            deliveryComment: delivery.comment,
            deliveryDate: delivery.date,
            status: OrderStatus.CREATED
        });

        await orderManager.save(orderRaw);
        const order = await orderManager.findOneOrFail(Order, orderRaw.id);

        const goodsPublicIds = goods.map(({publicId}) => publicId);

        const storageItems = await manager
            .getRepository(Storage)
            .createQueryBuilder(DbTable.STORAGE)
            .leftJoinAndSelect(`${DbTable.STORAGE}.catalogItem`, DbTable.CATALOG_ITEM)
            .leftJoinAndSelect(`${DbTable.CATALOG_ITEM}.catalog`, DbTable.CATALOG)
            .innerJoinAndSelect(`${DbTable.CATALOG}.brand`, DbTable.BRAND)
            .innerJoinAndSelect(`${DbTable.CATALOG}.petCategory`, DbTable.PET_CATEGORY)
            .innerJoinAndSelect(`${DbTable.CATALOG}.goodCategory`, DbTable.GOOD_CATEGORY)
            .where(`${DbTable.CATALOG_ITEM}.publicId IN (:...ids)`, {ids: goodsPublicIds})
            .getMany();

        const storageItemsHash = keyBy(
            storageItems.map((storageItem) => {
                const {catalogItem} = storageItem;
                const {catalog} = catalogItem;

                return {
                    storage: {
                        id: storageItem.id,
                        cost: storageItem.cost,
                        quantity: storageItem.quantity,
                        createdAt: moment(storageItem.createdAt).toISOString(),
                        updatedAt: moment(storageItem.updatedAt).toISOString()
                    },
                    catalog: {
                        id: catalog.id,
                        displayName: catalog.displayName,
                        description: catalog.description,
                        rating: catalog.rating,
                        manufacturerCountry: catalog.manufacturerCountry,
                        brand: {
                            code: catalog.brand.code,
                            name: catalog.brand.displayName
                        },
                        pet: {
                            code: catalog.petCategory.code,
                            name: catalog.petCategory.displayName
                        },
                        good: {
                            code: catalog.goodCategory.code,
                            name: catalog.goodCategory.displayName
                        },
                        createdAt: moment(catalog.createdAt).toISOString(),
                        updatedAt: moment(catalog.updatedAt).toISOString()
                    },
                    catalogItem: {
                        id: catalogItem.id,
                        publicId: catalogItem.publicId,
                        photoUrls: catalogItem.photoUrls,
                        weightKg: catalogItem.weightKg,
                        createdAt: moment(catalogItem.createdAt).toISOString(),
                        updatedAt: moment(catalogItem.updatedAt).toISOString()
                    },
                    catalogItemPublicId: storageItem.catalogItem.publicId
                };
            }),
            'catalogItemPublicId'
        );

        // Проверяем что все позиции найдены
        if (Object.keys(storageItemsHash).length !== goods.length) {
            throw new ClientError('COST_OR_QUANTITY_CHANGED', {meta: {goods, storageItems}});
        }

        // Проверяем, что цена и кол-во подходит
        const isValid = goods.every((good) => {
            const item = storageItemsHash[good.publicId];

            return good.cost === item.storage.cost && good.quantity <= item.storage.quantity;
        });

        if (!isValid) {
            throw new ClientError('COST_OR_QUANTITY_CHANGED', {meta: {goods, storageItems}});
        }

        await pMap(
            goods,
            async (good) => {
                const item = storageItemsHash[good.publicId];
                const {storage} = item;

                return manager
                    .createQueryBuilder()
                    .update(Storage)
                    .set({quantity: storage.quantity - good.quantity})
                    .where('id = :id', {id: storage.id})
                    .execute();
            },
            {concurrency: 2}
        );

        await manager
            .createQueryBuilder()
            .insert()
            .into(OrderPosition)
            .values(
                goods.map((good) => {
                    const item = storageItemsHash[good.publicId];

                    return {
                        orderId: order.id,
                        cost: good.cost,
                        quantity: good.quantity,
                        data: omit(item, 'catalogItemPublicId')
                    };
                })
            )
            .execute();

        return order.publicId;
    });

    const url = new URL(`/order/${orderPublicId}`, config['app.host']);

    smsProvider.sendSms(phone, `Ваш заказ успешно создан: ${url.toString()}`);

    res.json({publicId: orderPublicId});
});
