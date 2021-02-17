import * as express from 'express';
import * as Joi from '@hapi/joi';
import ratelimiter from 'express-rate-limit';
import {bodyValidate} from 'app/middleware/validate';
import {sendCode} from 'app/api/v1/routers/sms/send-code';
import {verifyCode} from 'app/api/v1/routers/sms/verify-code';

const sendCodeSchema = Joi.object({
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
            windowMs: 24 * 60 * 60 * 1000, // 1d
            max: 10 // Максимум 10 запросов за 1d на IP
        })
    )
    .post('/send_code', bodyValidate(sendCodeSchema), sendCode)
    .post('/verify_code', bodyValidate(verifySchema), verifyCode);
