import * as express from 'express';
import * as Joi from '@hapi/joi';
import {bodyValidate} from 'app/middleware/validate';
import {router as telegramRouter} from 'app/api/bot/routers/telegram';

const telegramSchema = Joi.object({
    message: Joi.object({
        message_id: Joi.number().required(),
        from: Joi.object({
            id: Joi.number().required(),
            is_bot: Joi.boolean().required()
        }).required(),
        chat: Joi.object({
            id: Joi.number().required()
        }).required(),
        date: Joi.date().timestamp('unix').required(),
        text: Joi.string().required()
    }).required()
});

export const router = express
    .Router()
    .use('/telegram', bodyValidate(telegramSchema, {allowUnknown: true}), telegramRouter);
