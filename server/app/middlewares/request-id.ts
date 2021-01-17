import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {v4 as uuidv4} from 'uuid';
import {config} from 'app/config';

const REQUEST_ID = config['header.requestId'];

export const requestId = wrap<Request, Response>(async (req, res, next) => {
    const id = req.headers[REQUEST_ID] as string | undefined;

    if (!id) {
        req.requestId = uuidv4();
        res.setHeader(REQUEST_ID, req.requestId);
    }

    req.logger = req.logger.child({requestId: req.requestId});

    next();
});
