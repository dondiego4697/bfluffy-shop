import dotenv from 'dotenv';

dotenv.config();

import Boom from '@hapi/boom';
import assert from 'assert';
import path from 'path';
import bodyParser from 'body-parser';
import express from 'express';
import cookieParser from 'cookie-parser';
import {renderHTML} from 'app/middleware/render-html';
import {router as staticRouter} from 'app/middleware/static';
import {ping} from 'app/middleware/ping';
import {helmet} from 'app/middleware/helmet';
import {cors} from 'app/middleware/cors';
import {requestId} from 'app/middleware/request-id';
import {logger as loggerMiddleware} from 'app/middleware/logger';
import {router as v1} from 'app/api/v1';

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
    .use('/api/v1', v1)
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
