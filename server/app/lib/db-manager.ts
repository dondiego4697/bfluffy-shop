import {createConnection, Connection} from 'typeorm';
import {config} from 'app/config';
import {Brand} from '$db/entity/brand';

// TODO master/replice
class DbManager {
    protected masterConnection: Connection | undefined;
    public isActive = false;

    constructor() {
        this.init();
    }

    protected async init() {
        this.masterConnection = await createConnection({
            type: 'postgres',
            host: config.db.hosts[0],
            port: config.db.port,
            username: config.db.username,
            password: config.db.password,
            database: config.db.database,
            entities: [Brand]
        });

        this.isActive = true;
    }
}

export const dbManager = new DbManager();
