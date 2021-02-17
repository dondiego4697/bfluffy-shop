import * as express from 'express';
import {getCatalogItem} from 'app/api/v1/routers/catalog/get-catalog-item';
import {getDictionary} from 'app/api/v1/routers/catalog/get-dictionary';

export const router = express.Router().get('/dictionary', getDictionary).get('/item/:public_id', getCatalogItem);
