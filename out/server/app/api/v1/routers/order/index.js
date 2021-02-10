"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express = __importStar(require("express"));
const Joi = __importStar(require("@hapi/joi"));
const csrf_1 = require("../../../../middleware/csrf");
const validate_1 = require("../../../../middleware/validate");
const create_order_1 = require("./create-order");
const check_cart_1 = require("./check-cart");
const get_order_1 = require("./get-order");
const cancel_order_1 = require("./cancel-order");
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
exports.router = express
    .Router()
    .get('/:public_id', get_order_1.getOrder)
    .post('/check_cart', validate_1.bodyValidate(checkCartSchema, { allowUnknown: true }), check_cart_1.checkCart)
    .use(csrf_1.csrf)
    .post('/create', validate_1.bodyValidate(createOrderSchema, { allowUnknown: true }), create_order_1.createOrder)
    .delete('/:public_id', cancel_order_1.cancelOrder);
//# sourceMappingURL=index.js.map