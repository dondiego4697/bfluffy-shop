import * as express from 'express';
import {csrf} from 'app/middleware/csrf';
import {router as orderRouter} from 'app/api/v1/routers/order';
import {router as searchRouter} from 'app/api/v1/routers/search';
import {router as smsRouter} from 'app/api/v1/routers/sms';
import {router as catalogRouter} from 'app/api/v1/routers/catalog';

export const router = express
    .Router()
    // TODO стоит посмотреть эластик search
    .use('/catalog', catalogRouter)
    .use('/search', searchRouter)
    .use('/sms', smsRouter)
    .use(csrf)
    .use('/order', orderRouter);
