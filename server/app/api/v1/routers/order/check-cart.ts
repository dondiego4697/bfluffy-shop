import {keyBy} from 'lodash';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {requestCache} from 'app/lib/request-cache';
import {Storage} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';

interface Body {
    goods: {
        publicId: string;
        quantity: number;
        cost: number;
    }[];
}

interface Good {
    quantity: number;
    cost: number | null;
}

export const checkCart = wrap<Request, Response>(async (req, res) => {
    const cache = requestCache.get(req);

    if (cache) {
        return res.json(cache);
    }

    const {goods} = req.body as Body;

    const ids = goods.map(({publicId}) => publicId);

    const connection = await dbManager.getConnection();

    const storageItems = await connection
        .getRepository(Storage)
        .createQueryBuilder(DbTable.STORAGE)
        .innerJoinAndSelect(`${DbTable.STORAGE}.catalogItem`, DbTable.CATALOG_ITEM)
        .where(`${DbTable.CATALOG_ITEM}.publicId IN (:...ids)`, {ids})
        .getMany();

    const acutalHash = keyBy(
        storageItems.map((item) => ({
            publicId: item.catalogItem.publicId,
            cost: item.cost,
            quantity: item.quantity
        })),
        'publicId'
    );

    const currentHash = keyBy(
        goods.map((item) => ({
            publicId: item.publicId,
            cost: item.cost,
            quantity: item.quantity
        })),
        'publicId'
    );

    const diff = Object.entries(currentHash).reduce<Record<string, Good>>((res, [id, current]) => {
        const actual = acutalHash[id];

        if (!actual) {
            res[id] = {
                cost: null,
                quantity: 0
            };
        } else if (actual.cost !== current.cost || actual.quantity < current.quantity) {
            res[id] = {
                cost: actual.cost,
                quantity: actual.quantity
            };
        }

        return res;
    }, {});

    requestCache.set(req, diff, 30); // 30 s
    res.json(diff);
});
