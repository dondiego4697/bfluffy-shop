"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbManager = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("../config");
const index_1 = require("../../db-entity/index");
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
                slaves: [
                    {
                        host: config_1.config.db.hosts[0],
                        port: config_1.config.db.port,
                        username: config_1.config.db.username,
                        password: config_1.config.db.password,
                        database: config_1.config.db.database
                    }
                ]
            },
            entities: [index_1.Brand, index_1.Catalog, index_1.GoodCategory, index_1.OrderPosition, index_1.Order, index_1.PetCategory, index_1.Storage, index_1.User],
            logging: 'all',
            maxQueryExecutionTime: 5000,
            extra: {
                connectionLimit: 100
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