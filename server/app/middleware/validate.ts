import {RequestHandler} from 'express';
import * as Joi from '@hapi/joi';
import * as Boom from '@hapi/boom';

export function bodyValidate(schema: Joi.Schema, options: Joi.ValidationOptions = {}): RequestHandler {
    return (req, _, next) => {
        const body = validateJoiSchema(schema, req.body, options);

        req.body = body;
        next();
    };
}

export function queryValidat(schema: Joi.Schema, options: Joi.ValidationOptions = {}): RequestHandler {
    return (req, _res, next) => {
        const query = validateJoiSchema(schema, req.query, options);

        req.query = query;
        next();
    };
}

function validateJoiSchema(schema: Joi.Schema, data: unknown, options: Joi.ValidationOptions = {}) {
    const {error, value} = schema.validate(data, options);

    if (error) {
        throw Boom.badRequest(error.details.map(({message}) => message).join(', '));
    }

    return value;
}
