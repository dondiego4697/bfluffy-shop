"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_manager_1 = require("../app/lib/db-manager");
(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await db_manager_1.dbManager.getConnection().query(`
            DROP SCHEMA IF EXISTS public CASCADE;
            CREATE SCHEMA public;
        `);
})();
//# sourceMappingURL=test-restore-db.js.map