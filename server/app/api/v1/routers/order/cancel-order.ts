import Boom from '@hapi/boom';
import pMap from 'p-map';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {DbTable, Order, Storage} from '$db/entity/index';
import {OrderStatus, OrderResolution} from '$db/entity/order';

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
                const {storage} = position.data;

                return manager
                    .createQueryBuilder()
                    .update(Storage)
                    .set({quantity: storage.quantity + position.quantity})
                    .where('id = :id', {id: storage.id})
                    .execute();
            },
            {concurrency: 1}
        );
    });

    res.json({publicId});
});
