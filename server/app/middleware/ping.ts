import Boom from '@hapi/boom';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';

export const ping = wrap<Request, Response>(async (_req, res) => {
    if (!dbManager.isActive) {
        throw Boom.serverUnavailable('db is not active');
    }

    res.end();
});
