import * as express from 'express';
import {router as orderRouter} from 'app/api/v1/routers/order';
import {router as searchRouter} from 'app/api/v1/routers/search';
import {router as catalogRouter} from 'app/api/v1/routers/catalog';

export const router = express
    .Router()
    .use('/catalog', catalogRouter)
    .use('/search', searchRouter)
    .use('/order', orderRouter);
