"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbManager = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("../config");
const entities_1 = require("../../db-entity/entities");
class DbManager {
    constructor() {
        this.isActive = false;
        this.init();
    }
    async init() {
        // TODO master/replice
        await typeorm_1.createConnection({
            type: 'postgres',
            replication: {
                master: {
                    host: config_1.config.db.hosts[0],
                    port: config_1.config.db.port,
                    username: config_1.config.db.username,
                    password: config_1.config.db.password,
                    database: config_1.config.db.database
                },
                slaves: config_1.config.db.hosts.slice(1).map((host) => ({
                    host,
                    port: config_1.config.db.port,
                    username: config_1.config.db.username,
                    password: config_1.config.db.password,
                    database: config_1.config.db.database
                }))
            },
            entities: [entities_1.Brand, entities_1.Catalog, entities_1.CatalogItem, entities_1.GoodCategory, entities_1.OrderPosition, entities_1.Order, entities_1.PetCategory, entities_1.Storage, entities_1.User],
            logging: config_1.config['logger.db.level'],
            maxQueryExecutionTime: 5000,
            extra: {
                connectionLimit: 500
            }
        });
        this.isActive = true;
    }
    getConnection() {
        return typeorm_1.getConnection();
    }
}
exports.dbManager = new DbManager();
//# sourceMappingURL=db-manager.js.map