import {Request, Response} from 'express';
import {wrap} from 'async-middleware';

export const ping = wrap<Request, Response>(async (_req, res) => {
    res.end();
});
