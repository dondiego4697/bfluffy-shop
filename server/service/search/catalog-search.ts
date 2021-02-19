/* eslint-disable @typescript-eslint/no-explicit-any */
import pMap from 'p-map';
import {CronJob} from 'cron';
import got, {Got} from 'got';
import {dbManager} from 'app/lib/db-manager';
import {Catalog, Storage} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';
import {logger} from '$logger/logger';
import {config} from 'app/config';

interface SearchItem {
    brand: string;
    good: string;
    pet: string;
    weightKg?: string;
    exist?: boolean;
    searchMeta:
        | {
              brandCode: string;
              goodCategoryCode: string;
              petCategoryCode: string;
          }
        | {
              publicId: string;
          };
}

export class CatalogSearchProvider {
    protected logGroup = 'elastic_provider';
    protected indexName = 'catalog';
    protected client: Got;
    protected cronJob: CronJob;

    protected petCatagoryDict: Record<string, string> = {
        cats: 'кошек',
        kitten: 'котят',
        dogs: 'собак',
        puppy: 'щенков'
    };

    constructor() {
        if (!config['search.enable']) {
            return;
        }

        this.client = got.extend({
            prefixUrl: config['search.host'],
            responseType: 'json',
            throwHttpErrors: false,
            hooks: {
                beforeRequest: [
                    (options) => {
                        logger.info('request', {
                            group: this.logGroup,
                            url: options.url,
                            body: options.json,
                            method: options.method
                        });
                    }
                ],
                beforeError: [
                    (error) => {
                        logger.error('error', {
                            group: this.logGroup,
                            url: error.request?.requestUrl,
                            error: error.message,
                            statusCode: error.response?.statusCode,
                            body: error.response?.body
                        });

                        return error;
                    }
                ],
                afterResponse: [
                    (response) => {
                        logger.info('response', {
                            group: this.logGroup,
                            url: response.request.requestUrl,
                            statusCode: response.statusCode,
                            body: response.body,
                            method: response.method
                        });

                        return response;
                    }
                ]
            }
        });

        this.cronJob = new CronJob({
            cronTime: '*/50 * * * *',
            onTick: () => this.restoreCatalog(),
            runOnInit: true
        });
    }

    protected static formWeight(kg: number) {
        if (kg < 1) {
            return `${kg * 1000} г.`;
        }

        return `${kg} кг.`;
    }

    protected async getCurrentCatalog() {
        const connection = await dbManager.getConnection();

        const [storageList, catalogList] = await Promise.all([
            connection
                .getRepository(Storage)
                .createQueryBuilder(DbTable.STORAGE)
                .innerJoinAndSelect(`${DbTable.STORAGE}.catalogItem`, DbTable.CATALOG_ITEM)
                .where(`${DbTable.STORAGE}.quantity > 0`)
                .getMany(),
            connection
                .getRepository(Catalog)
                .createQueryBuilder(DbTable.CATALOG)
                .innerJoinAndSelect(`${DbTable.CATALOG}.brand`, DbTable.BRAND)
                .innerJoinAndSelect(`${DbTable.CATALOG}.petCategory`, DbTable.PET_CATEGORY)
                .innerJoinAndSelect(`${DbTable.CATALOG}.goodCategory`, DbTable.GOOD_CATEGORY)
                .leftJoinAndSelect(`${DbTable.CATALOG}.catalogItems`, DbTable.CATALOG_ITEM)
                .getMany()
        ]);

        return {
            catalogList,
            existedCatalogItems: new Set(storageList.map(({catalogItem}) => catalogItem.publicId))
        };
    }

    protected async getSearchDocuments() {
        const {catalogList, existedCatalogItems} = await this.getCurrentCatalog();

        const result: SearchItem[] = [];

        catalogList.forEach((catalog) => {
            const brand = catalog.brand.displayName;

            const goodRaw = catalog.goodCategory.displayName.toLowerCase();
            const good = goodRaw.slice(0, 1).toUpperCase() + goodRaw.slice(1);

            const petRaw = this.petCatagoryDict[catalog.petCategory.code].toLowerCase();
            const pet = `Для ${petRaw}`;

            result.push({
                brand,
                good,
                pet,
                searchMeta: {
                    brandCode: catalog.brand.code,
                    goodCategoryCode: catalog.goodCategory.code,
                    petCategoryCode: catalog.petCategory.code
                }
            });

            catalog.catalogItems.forEach(({publicId, weightKg}) => {
                result.push({
                    brand,
                    good,
                    pet,
                    weightKg: weightKg ? CatalogSearchProvider.formWeight(weightKg) : undefined,
                    exist: existedCatalogItems.has(publicId),
                    searchMeta: {
                        publicId
                    }
                });
            });
        });

        return result;
    }

    public async restoreCatalog() {
        const documents = await this.getSearchDocuments();

        await this.client.delete(this.indexName);
        await this.client.put(this.indexName, {
            json: {
                settings: {
                    max_ngram_diff: 50,
                    analysis: {
                        tokenizer: {
                            edge_tokenizer: {
                                type: 'ngram',
                                min_gram: 2,
                                max_gram: 50,
                                token_chars: ['letter', 'digit', 'punctuation', 'symbol']
                            }
                        },
                        analyzer: {
                            auto_suggest_analyzer: {
                                type: 'custom',
                                filter: ['lowercase'],
                                tokenizer: 'edge_tokenizer'
                            }
                        }
                    }
                },
                mappings: {
                    properties: {
                        brand: {
                            type: 'text',
                            analyzer: 'auto_suggest_analyzer'
                        },
                        good: {
                            type: 'text',
                            analyzer: 'auto_suggest_analyzer'
                        },
                        pet: {
                            type: 'text',
                            analyzer: 'auto_suggest_analyzer'
                        },
                        weightKg: {
                            type: 'text',
                            analyzer: 'auto_suggest_analyzer'
                        },
                        exist: {
                            type: 'boolean'
                        }
                    }
                }
            }
        });

        await pMap(
            documents,
            async (doc) => {
                await this.client.post(`${this.indexName}/_doc`, {
                    searchParams: {
                        refresh: true
                    },
                    json: {
                        brand: doc.brand,
                        good: doc.good,
                        pet: doc.pet,
                        weightKg: doc.weightKg,
                        exist: doc.exist,
                        searchMeta: doc.searchMeta
                    }
                });
            },
            {concurrency: 10}
        );
    }

    public async search(query: string) {
        const {body} = await this.client.post<any>(`${this.indexName}/_search`, {
            json: {
                size: 6,
                sort: [
                    {
                        exist: 'desc'
                    }
                ],
                query: {
                    bool: {
                        should: [
                            {
                                match: {
                                    good: query
                                }
                            },
                            {
                                match: {
                                    pet: query
                                }
                            },
                            {
                                match: {
                                    brand: query
                                }
                            },
                            {
                                match: {
                                    weightKg: query
                                }
                            }
                        ]
                    }
                },
                highlight: {
                    fields: {
                        weightKg: {},
                        good: {},
                        brand: {},
                        pet: {}
                    }
                }
            }
        });

        const data = body.hits.hits.map((hit: any) => ({
            searchMeta: hit._source.searchMeta,
            highlight: [
                `'${(hit.highlight?.brand && hit.highlight?.brand[0]) || hit._source.brand}'`,
                (hit.highlight?.good && hit.highlight?.good[0]) || hit._source.good,
                ((hit.highlight?.pet && hit.highlight?.pet[0]) || hit._source.pet).toLowerCase(),
                (hit.highlight?.weightKg && hit.highlight?.weightKg[0]) || hit._source.weightKg
            ].join(' ')
        }));

        return data;
    }
}
