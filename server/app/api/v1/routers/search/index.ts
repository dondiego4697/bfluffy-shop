import * as express from 'express';
import * as Joi from '@hapi/joi';
import {bodyValidate} from 'app/middleware/validate';
import {base} from 'api-v1/routers/search/base';

const searchSchema = Joi.object({
    limit: Joi.number().default(20),
    offset: Joi.number().default(0),
    petCode: Joi.string(),
    brandCode: Joi.string(),
    goodCode: Joi.string(),
    cost: Joi.object({
        min: Joi.number(),
        max: Joi.number()
    })
});

export const router = express.Router().post('/base', bodyValidate(searchSchema), base).get('/fulltext');
