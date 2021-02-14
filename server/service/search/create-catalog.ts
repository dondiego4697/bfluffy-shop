import {dbManager} from 'app/lib/db-manager';
import {Catalog} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';

export async function createCatalog() {
    await new Promise((r) => setTimeout(r, 2000));
    const catalog = await dbManager
        .getConnection()
        .getRepository(Catalog)
        .createQueryBuilder(DbTable.CATALOG)
        .innerJoinAndSelect(`${DbTable.CATALOG}.brand`, DbTable.BRAND)
        .innerJoinAndSelect(`${DbTable.CATALOG}.petCategory`, DbTable.PET_CATEGORY)
        .innerJoinAndSelect(`${DbTable.CATALOG}.goodCategory`, DbTable.GOOD_CATEGORY)
        .leftJoinAndSelect(`${DbTable.CATALOG}.catalogItems`, DbTable.CATALOG_ITEM)
        .getMany();

    console.log(123, catalog);
}