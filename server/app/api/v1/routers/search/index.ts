import * as express from 'express';
import * as Joi from '@hapi/joi';
import {bodyValidate, queryValidate} from 'app/middleware/validate';
import {base} from 'api-v1/routers/search/base';
import {fullText} from 'api-v1/routers/search/full-text';

const baseSchema = Joi.object({
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

const fullTextSchema = Joi.object({
    text: Joi.string().required()
});

export const router = express.Router()
    .post('/base', bodyValidate(baseSchema), base)
    .get('/full_text', queryValidate(fullTextSchema), fullText);
