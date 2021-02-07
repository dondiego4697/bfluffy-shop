import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {DbTable, Brand, GoodCategory, PetCategory} from '$db/entity/index';
import {requestCache} from 'app/lib/request-cache';

export const getDictionary = wrap<Request, Response>(async (req, res) => {
    const cache = requestCache.get(req);

    if (cache) {
        return res.json(cache);
    }

    const connection = dbManager.getConnection();

    const [brands, goodCategories, petCategories] = await Promise.all([
        connection.createQueryBuilder().select(DbTable.BRAND).from(Brand, DbTable.BRAND).getMany(),
        connection
            .createQueryBuilder()
            .select(DbTable.GOOD_CATEGORY)
            .from(GoodCategory, DbTable.GOOD_CATEGORY)
            .getMany(),
        connection.createQueryBuilder().select(DbTable.PET_CATEGORY).from(PetCategory, DbTable.PET_CATEGORY).getMany()
    ]);

    const data = {
        brands: brands.map(({code, displayName}) => ({code, displayName})),
        goodCategories: goodCategories.map(({code, displayName}) => ({code, displayName})),
        petCategories: petCategories.map(({code, displayName}) => ({code, displayName}))
    };

    requestCache.set(req, data);
    res.json(data);
});
