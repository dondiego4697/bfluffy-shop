import {createConnection, getConnection} from 'typeorm';
import {config} from 'app/config';
import {
    Brand,
    Catalog,
    CatalogItem,
    GoodCategory,
    OrderPosition,
    Order,
    PetCategory,
    Storage,
    User
} from '$db-entity/entities';

class DbManager {
    public isActive = false;

    constructor() {
        this.init();
    }

    protected async init() {
        // TODO master/replice
        await createConnection({
            type: 'postgres',
            replication: {
                master: {
                    host: config.db.hosts[0],
                    port: config.db.port,
                    username: config.db.username,
                    password: config.db.password,
                    database: config.db.database
                },
                slaves: config.db.hosts.slice(1).map((host) => ({
                    host,
                    port: config.db.port,
                    username: config.db.username,
                    password: config.db.password,
                    database: config.db.database
                }))
            },
            entities: [Brand, Catalog, CatalogItem, GoodCategory, OrderPosition, Order, PetCategory, Storage, User],
            logging: config['logger.db.level'],
            maxQueryExecutionTime: 5000,
            extra: {
                connectionLimit: 500
            }
        });

        this.isActive = true;
    }

    public getConnection() {
        return getConnection();
    }
}

export const dbManager = new DbManager();
