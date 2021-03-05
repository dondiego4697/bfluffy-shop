import * as express from 'express';
import * as Joi from '@hapi/joi';
import ratelimiter from 'express-rate-limit';
import {bodyValidate} from 'app/middleware/validate';
import {createOrder} from 'app/api/v1/routers/order/create-order';
import {confirmOrder} from 'app/api/v1/routers/order/confirm-order';
import {checkCart} from 'app/api/v1/routers/order/check-cart';
import {checkDelivery} from 'app/api/v1/routers/order/check-delivery';
import {getOrder} from 'app/api/v1/routers/order/get-order';
import {cancelOrder} from 'app/api/v1/routers/order/cancel-order';

const goodSchema = Joi.object({
    publicId: Joi.string().required(),
    quantity: Joi.number().integer().positive().min(1).required(),
    cost: Joi.number().precision(2).positive().greater(0).required()
});

const createOrderSchema = Joi.object({
    phone: Joi.number().required(),
    delivery: Joi.object({
        address: Joi.string().required(),
        date: Joi.date().timestamp('unix').required(),
        comment: Joi.string()
    }).required(),
    goods: Joi.array().items(goodSchema).min(1).required()
});

const checkCartSchema = Joi.object({
    goods: Joi.array().items(goodSchema).min(1).required()
});

const checkDeliverySchema = Joi.object({
    lat: Joi.number().required(),
    lon: Joi.number().required()
});

const confirmOrderSchema = Joi.object({});

export const router = express
    .Router()
    .get('/:public_id', getOrder)
    .post('/check_cart', bodyValidate(checkCartSchema, {allowUnknown: true}), checkCart)
    .post('/check_delivery', bodyValidate(checkDeliverySchema, {allowUnknown: true}), checkDelivery)
    .post('/:public_id/confirm', bodyValidate(confirmOrderSchema, {allowUnknown: true}), confirmOrder)
    // На данный момент, отмена заказа может произойти только до оплаты
    // Поэтому проверок никаких еще не надо делать
    .delete('/:public_id', cancelOrder)
    .use(
        ratelimiter({
            windowMs: 24 * 60 * 60 * 1000, // 1d
            max: 10 // Максимум 10 запросов за 1d на IP
        })
    )
    .post('/create', bodyValidate(createOrderSchema, {allowUnknown: true}), createOrder);
