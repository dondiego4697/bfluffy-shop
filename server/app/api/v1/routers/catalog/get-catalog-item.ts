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

    const [firstItem] = catalogItems;

    const data = {
        brand: {
            code: firstItem.brand.code,
            name: firstItem.brand.displayName
        },
        pet: {
            code: firstItem.petCategory.code,
            name: firstItem.petCategory.displayName
        },
        good: {
            code: firstItem.goodCategory.code,
            name: firstItem.goodCategory.displayName
        },
        displayName: firstItem.displayName,
        description: firstItem.description,
        manufacturerCountry: firstItem.manufacturerCountry,
        items: catalogItems.map((item) => ({
            publicId: item.publicId,
            rating: item.rating,
            photoUrls: item.photoUrls || []
        }))
    };

    requestCache.set(req, data);
    res.json(data);
});
