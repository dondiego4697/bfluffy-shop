import Boom from '@hapi/boom';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {DbTable, User} from '$db/entity/index';
import {CSRF} from 'app/lib/csrf';
import {config} from 'app/config';

interface Body {
    phone: number;
    code: number;
}

export const verifyCode = wrap<Request, Response>(async (req, res) => {
    const {phone, code} = req.body as Body;

    const connection = dbManager.getConnection();

    const user = await connection
        .getRepository(User)
        .createQueryBuilder(DbTable.USER)
        .where(`${DbTable.USER}.phone = :phone`, {phone})
        .getOne();

    if (!user) {
        throw Boom.notFound();
    }

    if (user.lastSmsCode === code) {
        res.cookie('csrf_token', CSRF.generateToken(), {maxAge: config['csrf.token.ttl']});

        return res.json({});
    }

    throw Boom.badRequest();
});
