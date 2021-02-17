import dotenv from 'dotenv';

dotenv.config();

import {dbManager} from 'app/lib/db-manager';

(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const connection = await dbManager.getConnection();

    await connection.query(`
        DROP SCHEMA IF EXISTS public CASCADE;
        CREATE SCHEMA public;
    `);
})();
