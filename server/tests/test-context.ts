import execa from 'execa';
import path from 'path';
import nock from 'nock';
import getPort from 'get-port';

import {dbManager} from 'app/lib/db-manager';
import {DbTable} from '$db-entity/tables';

export class TestContext {
    protected server?: execa.ExecaChildProcess;
    protected url?: string;

    public async getServerAddress() {
        if (this.url) {
            return this.url;
        }

        return this.startServer();
    }

    public async beforeAll() {
        nock.disableNetConnect();
        nock.enableNetConnect(/localhost/);

        await this.clearDb();
    }

    public async afterAll() {
        this.stopServer();
        nock.enableNetConnect();
    }

    public async beforeEach() {
        nock.cleanAll();
    }

    public async afterEach() {
        nock.cleanAll();
    }

    protected async clearDb() {
        const tables = [
            DbTable.ORDER_POSITION,
            DbTable.ORDER,
            DbTable.USER,
            DbTable.STORAGE,
            DbTable.CATALOG_ITEM,
            DbTable.CATALOG,
            DbTable.BRAND,
            DbTable.PET_CATEGORY,
            DbTable.GOOD_CATEGORY
        ];

        await dbManager.getConnection().query(tables.map((table) => `TRUNCATE TABLE ${table} CASCADE;`).join('\n'));
    }

    protected async startServer() {
        const port = String(await getPort());

        const server = execa('node', [path.resolve('./out/server/app/app.js')], {
            cwd: path.resolve(),
            env: {
                ENVIRONMENT: 'tests',
                NODEJS_PORT: port
            }
        });

        this.server = server;
        this.url = `http://localhost:${port}`;

        await new Promise((resolve) => setTimeout(resolve, 1500));

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.url!;
    }

    protected stopServer() {
        if (!this.server) {
            return;
        }

        this.server.kill('SIGTERM');
        this.server = undefined;
    }
}
