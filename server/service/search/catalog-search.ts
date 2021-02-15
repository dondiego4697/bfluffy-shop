import algoliasearch, {SearchClient} from 'algoliasearch'
import {dbManager} from 'app/lib/db-manager';
import {Catalog, Storage} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';
import {config} from 'app/config';
import {logger} from '$logger/logger';

interface SearchItem {
    brand: string;
    good: string;
    pet: string;
    weightKg?: string;
    exist?: boolean;
    searchMeta: {
        brandCode: string;
        goodCategoryCode: string;
        petCategoryCode: string;
    } | {
        publicId: string;
    };
}

export class CatalogSearchProvider {
    protected indexName: string = 'catalog';
    protected client: SearchClient;

    protected petCatagoryDict: Record<string, string> = {
        cats: 'кошек',
        kitten: 'котят',
        dogs: 'собак',
        puppy: 'щенков'
    };

    constructor() {
        this.client = algoliasearch(config['algolia.project'], config['algolia.token']);
    }

    protected static formWeight(kg: number) {
        if (kg < 1) {
            return `${kg * 1000} г.`;
        }

        return `${kg} кг.`;
    }

    protected async getCurrentCatalog() {
        const connection = await dbManager.getConnection();

        const [
            storageList,
            catalogList
        ] = await Promise.all([
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
                })
            });
        });

        return result;
    }

    public async restoreCatalog() {
        const documents = await this.getSearchDocuments();
        const index = this.client.initIndex(this.indexName);

        try {
            await index.replaceAllObjects(documents, {
                safe: true,
                autoGenerateObjectIDIfNotExist: true
            });

            await index.setSettings({
                searchableAttributes: ['brand', 'good', 'pet', 'weightKg'],
                ranking: ['desc(exist)']
            });
        } catch (error) {
            logger.error(error, {group: 'algolia'});
        }
    }

    public async search(query: string) {
        const {results: [result]} = await this.client.search<SearchItem>([{
            indexName: this.indexName,
            query
        }]);

        const data = result.hits.map((hit) => ({
            searchMeta: hit.searchMeta,
            highlight: [
                `"${hit._highlightResult?.brand?.value || hit.brand}"`,
                hit._highlightResult?.good?.value || hit.good,
                (hit._highlightResult?.pet?.value || hit.pet).toLowerCase(),
                hit._highlightResult?.weightKg?.value || hit.weightKg,
            ].join(' ')
        }));

        return data;
    }
}

export const catalogSearchProvider = new CatalogSearchProvider();
