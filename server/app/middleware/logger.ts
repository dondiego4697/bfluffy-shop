import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {logger as _logger} from '$logger/logger';

export const logger = wrap<Request, Response>(async (req, _res, next) => {
    req.logger = _logger.child({
        hostname: req.hostname,
        originalUrl: req.originalUrl
    });

    next();
});
