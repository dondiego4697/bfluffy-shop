import * as Boom from '@hapi/boom';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {CSRF} from 'app/lib/csrf';
import {config} from 'app/config';

export const csrf = wrap<Request, Response>(async (req, res, next) => {
    if (!config['csrf.enable']) {
        return next();
    }

    if (CSRF.isTokenValid(req)) {
        res.cookie('csrf_token', CSRF.generateToken(), {maxAge: config['csrf.token.ttl']});

        return next();
    }

    res.clearCookie('csrf_token');
    throw Boom.forbidden('invalid csrf');
});
