import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {requestCache} from 'app/lib/request-cache';
import {Brand, GoodCategory, PetCategory} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';

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
        brands: brands.map(({code, displayName}) => ({code, name: displayName})),
        goods: goodCategories.map(({code, displayName}) => ({code, name: displayName})),
        pets: petCategories.map(({code, displayName}) => ({code, name: displayName}))
    };

    requestCache.set(req, data);
    res.json(data);
});
