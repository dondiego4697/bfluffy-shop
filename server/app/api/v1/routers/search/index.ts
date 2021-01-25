import * as express from 'express';
import * as Joi from '@hapi/joi';
import {bodyValidate} from 'app/middleware/validate';

const schema = Joi.object({
    category_code: Joi.string().required()
});

export const router = express.Router().post('/', bodyValidate(schema)).get('/suggest');
