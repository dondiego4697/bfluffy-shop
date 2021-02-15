import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';

let lastCheck: undefined | number;

export const ping = wrap<Request, Response>(async (_req, res) => {
    // Каждые 10 секунд
    if (!lastCheck || lastCheck > 10 * 1000) {
        const connection = await dbManager.getConnection();

        await connection.query('SELECT 1');

        lastCheck = Date.now();

        return res.end();
    }

    res.end();
});
