import Boom from '@hapi/boom';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {DbTable, Order} from '$db/entity/index';
import {OrderStatus, OrderResolution} from '$db/entity/order';

export const cancelOrder = wrap<Request, Response>(async (req, res) => {
    const {public_id: publicId} = req.params;

    const order = await dbManager
        .getConnection()
        .getRepository(Order)
        .createQueryBuilder(DbTable.ORDER)
        .where(`${DbTable.ORDER}.public_id = :id`, {id: publicId})
        .getOne();

    if (!order) {
        throw Boom.notFound();
    }

    await dbManager
        .getConnection()
        .createQueryBuilder()
        .update(Order)
        .set({status: OrderStatus.FINISHED, resolution: OrderResolution.CANCELLED})
        .where('id = :id', {id: order.id})
        .execute();

    res.json({publicId});
});
