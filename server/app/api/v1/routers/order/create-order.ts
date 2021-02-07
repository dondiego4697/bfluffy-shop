import {URL} from 'url';
import Boom from '@hapi/boom';
import {keyBy, omit} from 'lodash';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {config} from 'app/config';
import {dbManager} from 'app/lib/db-manager';
import {OrderStatus} from '$db/entity/order';
import {smsProvider} from '$sms/sms';
import {Order, Storage, OrderPosition, DbTable} from '$db/entity/index';

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
        const order = await manager
            .createQueryBuilder()
            .insert()
            .into(Order)
            .values([
                {
                    data: {}, // TODO sdek
                    clientPhone: String(phone),
                    deliveryAddress: delivery.address,
                    deliveryComment: delivery.comment,
                    deliveryDate: delivery.date,
                    status: OrderStatus.CREATED
                }
            ])
            .returning('*')
            .execute();

        const orderId = order.identifiers[0].id;
        const goodPublicIds = goods.map(({publicId}) => publicId);

        const catalogItemsRaw = await manager
            .getRepository(Storage)
            .createQueryBuilder(DbTable.STORAGE)
            .leftJoinAndSelect(`${DbTable.STORAGE}.catalog`, DbTable.CATALOG)
            .innerJoinAndSelect(`${DbTable.CATALOG}.brand`, DbTable.BRAND)
            .innerJoinAndSelect(`${DbTable.CATALOG}.petCategory`, DbTable.PET_CATEGORY)
            .innerJoinAndSelect(`${DbTable.CATALOG}.goodCategory`, DbTable.GOOD_CATEGORY)
            .where(`${DbTable.CATALOG}.publicId IN (:...ids)`, {ids: goodPublicIds})
            .getMany();

        const catalogItems = catalogItemsRaw.map((item) => ({
            storage: omit(item, 'catalog'),
            catalog: item.catalog,
            catalogPublicId: item.catalog.publicId
        }));

        if (catalogItems.length !== goods.length) {
            req.logger.error('unknown good ids exist', {goods, catalogItems});
            throw Boom.badRequest();
        }

        const catalogItemsHash = keyBy(catalogItems, 'catalogPublicId');

        await manager
            .createQueryBuilder()
            .insert()
            .into(OrderPosition)
            .values(
                goods.map((good) => {
                    const item = catalogItemsHash[good.publicId];
                    const {storage, catalog} = item;

                    return {
                        orderId,
                        cost: good.cost,
                        quantity: good.quantity,
                        data: {
                            storage: {
                                id: storage.id,
                                cost: storage.cost,
                                quantity: storage.quantity
                            },
                            catalog: {
                                id: catalog.id,
                                publicId: catalog.publicId,
                                displayName: catalog.displayName,
                                description: catalog.description,
                                rating: catalog.rating,
                                manufacturerCountry: catalog.manufacturerCountry,
                                photoUrls: catalog.photoUrls || [],
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
                                }
                            }
                        }
                    };
                })
            )
            .execute();

        return order.raw[0].public_id;
    });

    const url = new URL(`/order/${orderPublicId}`, config['app.host']);

    smsProvider.sendSms(phone, `Ваш заказ успешно создан: ${url.toString()}`);

    res.json({id: orderPublicId});
});
