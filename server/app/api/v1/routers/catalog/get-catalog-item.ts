import Boom from '@hapi/boom';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {requestCache} from 'app/lib/request-cache';
import {Catalog, CatalogItem} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';

export const getCatalogItem = wrap<Request, Response>(async (req, res) => {
    const cache = requestCache.get(req);

    if (cache) {
        return res.json(cache);
    }

    const {public_id: publicId} = req.params;

    const connection = dbManager.getConnection();
    const {manager: catalogItemManager} = dbManager.getConnection().getRepository(CatalogItem);

    const catalogItem = await catalogItemManager.findOne(CatalogItem, {publicId});

    if (!catalogItem) {
        throw Boom.notFound();
    }

    const catalog = await connection
        .getRepository(Catalog)
        .createQueryBuilder(DbTable.CATALOG)
        .innerJoinAndSelect(`${DbTable.CATALOG}.brand`, DbTable.BRAND)
        .innerJoinAndSelect(`${DbTable.CATALOG}.petCategory`, DbTable.PET_CATEGORY)
        .innerJoinAndSelect(`${DbTable.CATALOG}.goodCategory`, DbTable.GOOD_CATEGORY)
        .leftJoinAndSelect(`${DbTable.CATALOG}.catalogItems`, DbTable.CATALOG_ITEM)
        .where(`${DbTable.CATALOG}.id = :id`, {id: catalogItem.catalogId})
        .getOne();

    if (!catalog) {
        throw Boom.notFound();
    }

    const data = {
        brand: {
            code: catalog.brand.code,
            name: catalog.brand.displayName
        },
        pet: {
            code: catalog.petCategory.code,
            name: catalog.petCategory.displayName
        },
        good: {
            code: catalog.goodCategory.code,
            name: catalog.goodCategory.displayName
        },
        displayName: catalog.displayName,
        description: catalog.description,
        manufacturerCountry: catalog.manufacturerCountry,
        rating: catalog.rating,
        createdAt: catalog.createdAt,
        updatedAt: catalog.updatedAt,
        items: catalog.catalogItems.map((item) => ({
            publicId: item.publicId,
            weight: item.weight,
            photoUrls: item.photoUrls || [],
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        }))
    };

    requestCache.set(req, data);
    res.json(data);
});
