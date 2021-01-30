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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express = __importStar(require("express"));
const Joi = __importStar(require("@hapi/joi"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const validate_1 = require("../../../../middleware/validate");
const sendSchema = Joi.object({
    phone: Joi.number().required()
});
const verifySchema = Joi.object({
    phone: Joi.number().required(),
    code: Joi.number().required()
});
exports.router = express
    .Router()
    .use(express_rate_limit_1.default({
    windowMs: 60 * 60 * 1000,
    max: 10 // Максимум 10 запросов за 1h на IP
}))
    // TODO отправлять смс с кодом только раз в 30 секунд
    .post('/send', validate_1.bodyValidate(sendSchema))
    // TODO при успешной верификации создаем в куках токен на 1h CSRF.generateToken
    .post('/verify', validate_1.bodyValidate(verifySchema));
//# sourceMappingURL=index.js.map