import Boom from '@hapi/boom';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {Order} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';

export const getOrder = wrap<Request, Response>(async (req, res) => {
    const {public_id: publicId} = req.params;

    const order = await dbManager
        .getConnection()
        .getRepository(Order)
        .createQueryBuilder(DbTable.ORDER)
        .leftJoinAndSelect(`${DbTable.ORDER}.orderPositions`, DbTable.ORDER_POSITION)
        .where(`${DbTable.ORDER}.public_id = :id`, {id: publicId})
        .getOne();

    if (!order) {
        throw Boom.notFound();
    }

    const result = {
        order: {
            publicId: order.publicId,
            data: order.data,
            clientPhone: order.clientPhone,
            createdAt: order.createdAt,
            status: {
                status: order.status,
                resolution: order.resolution
            },
            delivery: {
                address: order.deliveryAddress,
                comment: order.deliveryComment,
                date: order.deliveryDate
            }
        },
        positions: order.orderPositions.map((position) => {
            const {data} = position;
            const {catalog, catalogItem} = data;

            return {
                cost: position.cost,
                quantity: position.quantity,
                good: catalog.good,
                pet: catalog.pet,
                brand: catalog.brand,
                manufacturerCountry: catalog.manufacturerCountry,
                rating: catalog.rating,
                displayName: catalog.displayName,
                description: catalog.description,
                photoUrls: catalogItem.photoUrls,
                weight: catalogItem.weight
            };
        })
    };

    res.json(result);
});
