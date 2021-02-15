import Boom from '@hapi/boom';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {CSRF} from 'app/lib/csrf';
import {config} from 'app/config';
import {User} from '$db-entity/entities';

interface Body {
    phone: number;
    code: number;
}

export const verifyCode = wrap<Request, Response>(async (req, res) => {
    const {phone, code} = req.body as Body;

    const connection = await dbManager.getConnection();

    const {manager} = connection.getRepository(User);
    const user = await manager.findOne(User, {phone: String(phone)});

    if (!user) {
        throw Boom.notFound();
    }

    if (user.lastSmsCode === code) {
        res.cookie('csrf_token', CSRF.generateToken(), {maxAge: config['csrf.token.ttl']});

        return res.json({});
    }

    throw Boom.badRequest();
});
