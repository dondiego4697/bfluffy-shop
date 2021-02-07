import Boom from '@hapi/boom';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {Catalog, DbTable} from '$db/entity/index';
import {requestCache} from 'app/lib/request-cache';

export const getCatalogItem = wrap<Request, Response>(async (req, res) => {
    const cache = requestCache.get(req);

    if (cache) {
        return res.json(cache);
    }

    const {public_id: publicId} = req.params;

    const connection = dbManager.getConnection();

    const catalogItem = await connection
        .createQueryBuilder()
        .select(DbTable.CATALOG)
        .from(Catalog, DbTable.CATALOG)
        .where(`${DbTable.CATALOG}.public_id = :id`, {id: publicId})
        .getOne();

    if (!catalogItem) {
        throw Boom.notFound();
    }

    const catalogItems = await connection
        .getRepository(Catalog)
        .createQueryBuilder(DbTable.CATALOG)
        .innerJoinAndSelect(`${DbTable.CATALOG}.brand`, DbTable.BRAND)
        .innerJoinAndSelect(`${DbTable.CATALOG}.petCategory`, DbTable.PET_CATEGORY)
        .innerJoinAndSelect(`${DbTable.CATALOG}.goodCategory`, DbTable.GOOD_CATEGORY)
        .where(`${DbTable.CATALOG}.groupId = :id`, {id: catalogItem.groupId})
        .getMany();

    if (catalogItems.length === 0) {
        throw Boom.notFound();
    }

    const data = catalogItems.map((item) => ({
        publicId: item.publicId,
        displayName: item.displayName,
        description: item.description,
        rating: item.rating,
        manufacturerCountry: item.manufacturerCountry,
        photoUrls: item.photoUrls || [],
        brand: {
            code: item.brand.code,
            name: item.brand.displayName
        },
        pet: {
            code: item.petCategory.code,
            name: item.petCategory.displayName
        },
        good: {
            code: item.goodCategory.code,
            name: item.goodCategory.displayName
        }
    }));

    requestCache.set(req, data);
    res.json(data);
});
