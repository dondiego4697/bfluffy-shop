// import pMap from 'p-map';
// import got, {Got} from 'got';
// import {config} from 'app/config';
// import {dbManager} from 'app/lib/db-manager';
// import {Catalog, Storage} from '$db-entity/entities';
// import {DbTable} from '$db-entity/tables';
// import {logger} from '$logger/logger';

// interface SearchItem {
//     title: string;
//     searchMeta: {
//         brandCode?: string;
//         goodCategoryCode?: string;
//         petCategoryCode?: string;
//         catalogItemPublicId?: string;
//     }
// }

// export class CatalogSearchProvider {
//     protected logGroup = 'catalog_search_provider';
//     protected searchIndex = 'catalog';

//     protected petCatagoryDict: Record<string, string> = {
//         cats: 'кошек',
//         kitten: 'котят',
//         dogs: 'собак',
//         puppy: 'щенков'
//     };

//     protected client: Got;

//     constructor() {
//         this.client = got.extend({
//             prefixUrl: `http://localhost:${config['elastic.port']}`,
//             responseType: 'json',
//             throwHttpErrors: false,
//             hooks: {
//                 beforeRequest: [
//                     (options) => {
//                         logger.info('request', {
//                             group: this.logGroup,
//                             url: options.url,
//                             body: options.json,
//                             method: options.method
//                         });
//                     }
//                 ],
//                 beforeError: [
//                     (error) => {
//                         logger.error('error', {
//                             group: this.logGroup,
//                             url: error.request?.requestUrl,
//                             error: error.message,
//                             statusCode: error.response?.statusCode,
//                             body: error.response?.body
//                         });

//                         return error;
//                     }
//                 ],
//                 afterResponse: [
//                     (response) => {
//                         logger.info('response', {
//                             group: this.logGroup,
//                             url: response.request.requestUrl,
//                             statusCode: response.statusCode,
//                             body: response.body,
//                             method: response.method
//                         });

//                         return response;
//                     }
//                 ]
//             }
//         });

//         this.initSearch();
//     }

//     protected static formWeight(kg: number) {
//         if (kg < 1) {
//             return `${kg * 1000} г.`;
//         }

//         return `${kg} кг.`;
//     }

//     protected async getCurrentCatalog() {
//         const connection = await dbManager.getConnection();

//         const [
//             storageList,
//             catalogList
//         ] = await Promise.all([
//             connection
//                 .getRepository(Storage)
//                 .createQueryBuilder(DbTable.STORAGE)
//                 .innerJoinAndSelect(`${DbTable.STORAGE}.catalogItem`, DbTable.CATALOG_ITEM)
//                 .where(`${DbTable.STORAGE}.quantity > 0`)
//                 .getMany(),
//             connection
//                 .getRepository(Catalog)
//                 .createQueryBuilder(DbTable.CATALOG)
//                 .innerJoinAndSelect(`${DbTable.CATALOG}.brand`, DbTable.BRAND)
//                 .innerJoinAndSelect(`${DbTable.CATALOG}.petCategory`, DbTable.PET_CATEGORY)
//                 .innerJoinAndSelect(`${DbTable.CATALOG}.goodCategory`, DbTable.GOOD_CATEGORY)
//                 .leftJoinAndSelect(`${DbTable.CATALOG}.catalogItems`, DbTable.CATALOG_ITEM)
//                 .getMany()
//         ]);

//         return {
//             catalogList,
//             existedCatalogItems: new Set(storageList.map(({catalogItem}) => catalogItem.publicId))
//         };
//     }

//     protected async getSearchDocuments() {
//         // <brand> <good> <pet>
//         // <brand> <good> <pet> <...params>

//         const {catalogList} = await this.getCurrentCatalog();

//         const result: SearchItem[] = [];

//         catalogList.forEach((catalog) => {
//             const brand = catalog.brand.displayName;

//             const goodRaw = catalog.goodCategory.displayName.toLowerCase();
//             const good = goodRaw.slice(0, 1).toUpperCase() + goodRaw.slice(1);

//             const petRaw = this.petCatagoryDict[catalog.petCategory.code].toLowerCase();
//             const pet = `для ${petRaw}`;

//             result.push({
//                 title: [brand, good, pet].join(' '),
//                 searchMeta: {
//                     brandCode: catalog.brand.code,
//                     goodCategoryCode: catalog.goodCategory.code,
//                     petCategoryCode: catalog.petCategory.code
//                 }
//             });

//             catalog.catalogItems.forEach(({publicId, weightKg}) => {
//                 result.push({
//                     title: [
//                         brand, good, pet,
//                         weightKg ? CatalogSearchProvider.formWeight(weightKg) : undefined
//                     ].filter(Boolean).join(' '),
//                     searchMeta: {
//                         brandCode: catalog.brand.code,
//                         goodCategoryCode: catalog.goodCategory.code,
//                         petCategoryCode: catalog.petCategory.code,
//                         catalogItemPublicId: publicId
//                     }
//                 });
//             });
//         });

//         return result;
//     }

//     protected async initSearch() {
//         const searchItems = await this.getSearchDocuments();

//         await this.client.delete(this.searchIndex);
//         await this.client.put(this.searchIndex, {
//             json: {
//                 settings: {
//                     max_ngram_diff: 20,
//                     analysis: {
//                         analyzer: {
//                             substring_search: {
//                                 type: 'custom',
//                                 tokenizer: 'standard',
//                                 filter: ['lowercase', 'substring']
//                             }
//                         },
//                         filter: {
//                             substring: {
//                                 type: 'ngram',
//                                 min_gram: 1,
//                                 max_gram: 15
//                             }
//                         }
//                     }
//                 },
//                 mappings: {
//                     properties: {
//                         title: {
//                             type: 'text',
//                             analyzer: 'substring_search'
//                         }
//                     }
//                 }
//             }
//         });

//         await pMap(searchItems, async (item) => {
//             await this.client.post(`${this.searchIndex}/_doc`, {
//                 searchParams: {
//                     refresh: true
//                 },
//                 json: {
//                     title: item.title,
//                     searchMeta: item.searchMeta
//                 }
//             });
//         }, {concurrency: 10});
//     }
// }
