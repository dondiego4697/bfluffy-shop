import Boom from '@hapi/boom';
import pMap from 'p-map';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {OrderStatus, OrderResolution} from 'db-entity/order';
import {Order} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';
import {ClientError} from '$error/error';

export const cancelOrder = wrap<Request, Response>(async (req, res) => {
    const {public_id: publicId} = req.params;

    const order = await dbManager
        .getConnection()
        .getRepository(Order)
        .createQueryBuilder(DbTable.ORDER)
        .leftJoinAndSelect(`${DbTable.ORDER}.orderPositions`, DbTable.ORDER_POSITION)
        .where(`${DbTable.ORDER}.publicId = :id`, {id: publicId})
        .getOne();

    if (!order) {
        throw Boom.notFound();
    }

    if (order.status === 'FINISHED') {
        throw new ClientError('ORDER_ALREADY_FINISHED', {meta: {order}});
    }

    await dbManager.getConnection().transaction(async (manager) => {
        await manager
            .createQueryBuilder()
            .update(Order)
            .set({status: OrderStatus.FINISHED, resolution: OrderResolution.CANCELLED})
            .where('id = :id', {id: order.id})
            .execute();

        await pMap(
            order.orderPositions,
            async (position) => {
                const {
                    quantity,
                    data: {storage}
                } = position;

                return manager.query(
                    `
                        UPDATE ${DbTable.STORAGE}
                        SET quantity = quantity + ${quantity}
                        WHERE id = $1
                    `,
                    [storage.id]
                );
            },
            {concurrency: 1}
        );
    });

    res.json({publicId});
});
