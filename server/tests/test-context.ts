/* eslint-disable @typescript-eslint/no-explicit-any */
import http from 'http';
import net from 'net';
import nock from 'nock';

import {app} from 'app/app';
import {dbManager} from 'app/lib/db-manager';
import {DbTable} from '$db-entity/tables';

export class TestContext {
    protected server?: http.Server;
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
        await this.stopServer();
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

        const connection = await dbManager.getConnection();

        await connection.query(tables.map((table) => `TRUNCATE TABLE ${table} CASCADE;`).join('\n'));
    }

    protected async startServer() {
        const server = http.createServer(app);

        await new Promise((resolve) => server.listen(resolve));

        const port = (server.address() as net.AddressInfo).port;

        this.server = server;
        this.url = `http://localhost:${port}`;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.url!;
    }

    protected async stopServer() {
        if (!this.server) {
            return;
        }

        await new Promise<void>((resolve, reject) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.server!.close((error: any) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        this.server = undefined;
    }
}
