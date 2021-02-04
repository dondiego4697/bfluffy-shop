import * as express from 'express';
import * as Joi from '@hapi/joi';
import ratelimiter from 'express-rate-limit';
import {bodyValidate} from 'app/middleware/validate';

const sendSchema = Joi.object({
    phone: Joi.number().required()
});

const verifySchema = Joi.object({
    phone: Joi.number().required(),
    code: Joi.number().required()
});

export const router = express
    .Router()
    .use(
        ratelimiter({
            windowMs: 60 * 60 * 1000, // 1h
            max: 10 // Максимум 10 запросов за 1h на IP
        })
    )
    // TODO отправлять смс с кодом только раз в 30 секунд
    // Проверяем по базе последнее высланное смс и если не ок, то возвращаем сколько осталось
    .post('/send', bodyValidate(sendSchema))
    // TODO при успешной верификации создаем в куках токен на 1h CSRF.generateToken
    .post('/verify', bodyValidate(verifySchema));
