import dotenv from 'dotenv';

dotenv.config();

import Boom from '@hapi/boom';
import assert from 'assert';
import path from 'path';
import bodyParser from 'body-parser';
import express from 'express';
import cookieParser from 'cookie-parser';
import {renderHTML} from 'app/middlewares/render-html';
import {router as staticRouter} from 'app/middlewares/static';
import {ping} from 'app/middlewares/ping';
import {csrf} from 'app/middlewares/csrf';
import {helmet} from 'app/middlewares/helmet';
import {cors} from 'app/middlewares/cors';
import {requestId} from 'app/middlewares/request-id';
import {logger as loggerMiddleware} from 'app/middlewares/logger';

const bodyParserJson = bodyParser.json({
    limit: '5mb',
    strict: false
});

export const app = express()
    .set('views', path.resolve('resources/views'))
    .set('view engine', 'pug')
    .enable('trust proxy')
    .disable('x-powered-by')
    .options('*', cors)
    .use(loggerMiddleware)
    .use(requestId)
    .use(helmet)
    .use(cookieParser())
    .use(bodyParserJson)
    .get('/ping', ping)
    .use(staticRouter)
    .use('/api', [csrf])
    .get('/*', renderHTML)
    .use((_req, _res, next) => next(Boom.notFound('endpoint not found')))
    // eslint-disable-next-line
    .use((error: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
        if (error.isBoom) {
            sendError(res, error);
        } else {
            req.logger.error(`unknown error: ${error.message}`);
            sendError(res, Boom.internal());
        }
    });

function sendError(res: express.Response, error: Boom.Boom): void {
    res.status(error.output.statusCode).json(error.output.payload);
}

if (!module.parent) {
    const port = process.env.NODEJS_PORT || 8080;

    assert(port, 'no port provided for the application to listen to');

    app.listen(port, () => console.log(`application started on port ${port}`));
}
