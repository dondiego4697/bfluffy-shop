import * as Boom from '@hapi/boom';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {CSRF} from 'app/lib/csrf';

export const csrf = wrap<Request, Response>(async (req, _res, next) => {
    if (CSRF.isTokenValid(req)) {
        return next();
    }

    throw Boom.forbidden('invalid csrf');
});
