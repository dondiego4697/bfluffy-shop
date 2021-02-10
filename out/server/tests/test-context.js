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
    }
    async afterAll() {
        this.stopServer();
        nock_1.default.enableNetConnect();
    }
    async beforeEach() { }
    async afterEach() {
        nock_1.default.cleanAll();
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