import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {requestCache} from 'app/lib/request-cache';
import {DeliveryArea} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';

export const getDeliveryAreas = wrap<Request, Response>(async (req, res) => {
    const cache = requestCache.get(req);

    if (cache) {
        return res.json(cache);
    }

    const connection = await dbManager.getConnection();
    const areas = await connection
        .createQueryBuilder()
        .select(DbTable.DELIVERY_AREA)
        .from(DeliveryArea, DbTable.DELIVERY_AREA)
        .where(`${DbTable.DELIVERY_AREA}.enable IS TRUE`)
        .getMany();

    const data = areas.map((area) => ({
        city: area.city,
        district: area.district,
        enable: area.enable,
        location: area.location
    }));

    requestCache.set(req, data);
    res.json(data);
});
