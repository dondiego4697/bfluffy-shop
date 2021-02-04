import * as express from 'express';

export const router = express.Router()
    .get('/item/:public_id');
