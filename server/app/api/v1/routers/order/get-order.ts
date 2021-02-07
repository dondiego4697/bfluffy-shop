import Boom from '@hapi/boom';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {DbTable, Order} from '$db/entity/index';

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
        positions: order.orderPositions.map((position) => ({
            cost: position.cost,
            quantity: position.quantity,
            good: position.data.catalog.good,
            pet: position.data.catalog.pet,
            brand: position.data.catalog.brand,
            manufacturerCountry: position.data.catalog.manufacturerCountry,
            photoUrls: position.data.catalog.photoUrls,
            rating: position.data.catalog.rating,
            displayName: position.data.catalog.displayName,
            description: position.data.catalog.description
        }))
    };

    res.json(result);
});
