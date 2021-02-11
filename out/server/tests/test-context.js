"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestContext = void 0;
const execa_1 = __importDefault(require("execa"));
const path_1 = __importDefault(require("path"));
const nock_1 = __importDefault(require("nock"));
const get_port_1 = __importDefault(require("get-port"));
const db_manager_1 = require("../app/lib/db-manager");
const tables_1 = require("../db-entity/tables");
class TestContext {
    async getServerAddress() {
        if (this.url) {
            return this.url;
        }
        return this.startServer();
    }
    async beforeAll() {
        nock_1.default.disableNetConnect();
        nock_1.default.enableNetConnect(/localhost/);
        await this.clearDb();
    }
    async afterAll() {
        this.stopServer();
        nock_1.default.enableNetConnect();
    }
    async beforeEach() {
        nock_1.default.cleanAll();
    }
    async afterEach() {
        nock_1.default.cleanAll();
    }
    async clearDb() {
        const tables = [
            tables_1.DbTable.ORDER_POSITION,
            tables_1.DbTable.ORDER,
            tables_1.DbTable.USER,
            tables_1.DbTable.STORAGE,
            tables_1.DbTable.CATALOG_ITEM,
            tables_1.DbTable.CATALOG,
            tables_1.DbTable.BRAND,
            tables_1.DbTable.PET_CATEGORY,
            tables_1.DbTable.GOOD_CATEGORY
        ];
        await db_manager_1.dbManager.getConnection().query(tables.map((table) => `TRUNCATE TABLE ${table} CASCADE;`).join('\n'));
    }
    async startServer() {
        const port = String(await get_port_1.default());
        const server = execa_1.default('node', [path_1.default.resolve('./out/server/app/app.js')], {
            cwd: path_1.default.resolve(),
            env: {
                ENVIRONMENT: 'tests',
                NODEJS_PORT: port
            }
        });
        this.server = server;
        this.url = `http://localhost:${port}`;
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.url;
    }
    stopServer() {
        if (!this.server) {
            return;
        }
        this.server.kill('SIGTERM');
        this.server = undefined;
    }
}
exports.TestContext = TestContext;
//# sourceMappingURL=test-context.js.map