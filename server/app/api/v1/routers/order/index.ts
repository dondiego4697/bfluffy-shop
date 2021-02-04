import * as express from 'express';

export const router = express.Router()
    .get('/:public_id')
    .post('/create')
    .post('/check_cart')
    .post('/cancel');
