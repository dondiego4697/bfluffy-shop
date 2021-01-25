import * as express from 'express';
import {csrf} from 'app/middleware/csrf';
import {router as orderRouter} from 'app/api/v1/routers/order';
import {router as searchRouter} from 'app/api/v1/routers/search';
import {router as smsRouter} from 'app/api/v1/routers/sms';

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

export const router = express
    .Router()
    // TODO сделать middleware которая проверяет rps по ip, ratelimiter по простому если
    .use('/search', searchRouter)
    .use('/sms', smsRouter)
    .use(csrf)
    .use('/order', orderRouter);
