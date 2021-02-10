import {dbManager} from 'app/lib/db-manager';

(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await dbManager.getConnection().query(`
            DROP SCHEMA IF EXISTS public CASCADE;
            CREATE SCHEMA public;
        `);
})();
