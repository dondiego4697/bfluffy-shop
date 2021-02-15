import {upperFirst} from 'lodash';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {Catalog} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';

interface Body {
    limit: number;
    offset: number;
    petCode?: string;
    brandCode?: string;
    goodCode?: string;
    cost?: {
        min?: number;
        max?: number;
    };
}

export const base = wrap<Request, Response>(async (req, res) => {
    const body = req.body as Body;

    const connection = await dbManager.getConnection();

    const qb = connection
        .getRepository(Catalog)
        .createQueryBuilder(DbTable.CATALOG)
        .leftJoinAndSelect(`${DbTable.CATALOG}.catalogItems`, DbTable.CATALOG_ITEM)
        .innerJoinAndSelect(`${DbTable.CATALOG_ITEM}.storage`, DbTable.STORAGE)
        .innerJoinAndSelect(`${DbTable.CATALOG}.brand`, DbTable.BRAND)
        .innerJoinAndSelect(`${DbTable.CATALOG}.petCategory`, DbTable.PET_CATEGORY)
        .innerJoinAndSelect(`${DbTable.CATALOG}.goodCategory`, DbTable.GOOD_CATEGORY)
        .where('TRUE');

    if (body.petCode) {
        qb.andWhere(`${DbTable.PET_CATEGORY}.code = :petCode`, {petCode: body.petCode});
    }

    if (body.goodCode) {
        qb.andWhere(`${DbTable.GOOD_CATEGORY}.code = :goodCode`, {goodCode: body.goodCode});
    }

    if (body.brandCode) {
        qb.andWhere(`${DbTable.BRAND}.code = :brandCode`, {brandCode: body.brandCode});
    }

    if (body.cost) {
        if (body.cost.min) {
            qb.andWhere(`${DbTable.STORAGE}.cost >= :minCost`, {minCost: body.cost.min});
        }

        if (body.cost.max) {
            qb.andWhere(`${DbTable.STORAGE}.cost <= :maxCost`, {maxCost: body.cost.max});
        }
    }

    const dataRaw = await qb
        .limit(body.limit)
        .offset(body.offset)
        .orderBy(`${DbTable.STORAGE}.quantity`, 'DESC')
        .getMany();

    const data = dataRaw.map((catalog) => {
        const {catalogItems} = catalog;

        return {
            displayName: catalog.displayName,
            description: catalog.description,
            rating: catalog.rating,
            manufacturerCountry: catalog.manufacturerCountry,
            brand: catalog.brand.displayName,
            pet: upperFirst(catalog.petCategory.displayName),
            good: upperFirst(catalog.goodCategory.displayName),
            items: catalogItems.map((item) => ({
                publicId: item.publicId,
                photoUrls: item.photoUrls,
                weightKg: item.weightKg,
                cost: item.storage.cost,
                quantity: item.storage.quantity
            }))
        };
    });

    res.send(data);
});
