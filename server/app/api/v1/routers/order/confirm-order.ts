import Boom from '@hapi/boom';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {OrderStatus} from 'db-entity/order';
import {Order} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';
import {ClientError} from '$error/error';

export const confirmOrder = wrap<Request, Response>(async (req, res) => {
    const {public_id: publicId} = req.params;

    const connection = await dbManager.getConnection();

    const order = await connection
        .getRepository(Order)
        .createQueryBuilder(DbTable.ORDER)
        .leftJoinAndSelect(`${DbTable.ORDER}.orderPositions`, DbTable.ORDER_POSITION)
        .where(`${DbTable.ORDER}.publicId = :id`, {id: publicId})
        .getOne();

    if (!order) {
        throw Boom.notFound();
    }

    if (order.status !== OrderStatus.CREATED) {
        throw new ClientError('ORDER_NOT_IN_CREATED_STATUS', {meta: {order}});
    }

    await connection
        .createQueryBuilder()
        .update(Order)
        .set({
            status: OrderStatus.CONFIRMED,
            data: {
                ...order.data
                // TODO payment info
            }
        })
        .where('id = :id', {id: order.id})
        .execute();

    res.json({publicId});
});
