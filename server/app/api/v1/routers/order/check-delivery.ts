import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {requestCache} from 'app/lib/request-cache';
import {DbTable} from '$db-entity/tables';
import {DeliveryArea} from '$db-entity/entities';

interface Body {
    lat: number;
    lon: number;
}

export const checkDelivery = wrap<Request, Response>(async (req, res) => {
    const cache = requestCache.get(req);

    if (cache) {
        return res.json(cache);
    }

    const {lat, lon} = req.body as Body;

    const connection = await dbManager.getConnection();
    const areas = await connection
        .getRepository(DeliveryArea)
        .createQueryBuilder(DbTable.DELIVERY_AREA)
        .where(`ST_Contains(${DbTable.DELIVERY_AREA}.location, ST_PointFromText('POINT(${lon} ${lat})', 4326))`)
        .andWhere(`${DbTable.DELIVERY_AREA}.enable IS TRUE`)
        .getMany();

    const data = {
        isInAvailableArea: areas.length > 0
    };

    requestCache.set(req, data, 30); // 30 s
    res.json(data);
});
