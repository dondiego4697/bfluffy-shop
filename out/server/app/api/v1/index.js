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
const csrf_1 = require("../../middleware/csrf");
const order_1 = require("./routers/order");
const search_1 = require("./routers/search");
const sms_1 = require("./routers/sms");
// 1. Полнотекстовый поиск + suggest
// - категории товара
// - бренд
// - категории животных
// - название корма
// 2. создать заказ
// 2.1 отправить смс с кодом на телефон
// 3. карточка заказа
// 4. Простой поиск по фильтрам
// - категории корма
// - бренд
// - категории животных
// - цена
// 5. список похожих товаров рандомно
exports.router = express
    .Router()
    // TODO сделать middleware которая проверяет rps по ip, ratelimiter по простому если
    .use('/search', search_1.router)
    .use('/sms', sms_1.router)
    .use(csrf_1.csrf)
    .use('/order', order_1.router);
//# sourceMappingURL=index.js.map