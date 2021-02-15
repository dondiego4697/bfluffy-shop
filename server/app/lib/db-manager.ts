import typeorm, {createConnection} from 'typeorm';
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
    protected connection: typeorm.Connection;
    protected connectionDeffered: Promise<typeorm.Connection>;

    constructor() {
        this.connectionDeffered = createConnection({
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

        this.connectionDeffered.then((connection) => {
            this.connection = connection;
        });
    }

    public async getConnection() {
        await this.connectionDeffered;

        return this.connection;
    }
}

export const dbManager = new DbManager();
