import dotenv from 'dotenv';

dotenv.config();

import Boom from '@hapi/boom';
import localtunnel from 'localtunnel';
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
import {router as bot} from 'app/api/bot';
import {ClientError} from '$error/error';
import {config} from 'app/config';
import {getTelegramProvider} from '$telegram/provider';

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
    .use('/bot', bot)
    .get('/*', renderHTML)
    .use((_req, _res, next) => next(Boom.notFound('endpoint not found')))
    // eslint-disable-next-line
    .use((error: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
        if (error.isBoom) {
            sendError(req, res, error);
        } else if (error instanceof ClientError) {
            sendError(req, res, Boom.badRequest(error.clientErrorCode));
        } else {
            sendError(req, res, Boom.boomify(error));
        }
    });

function sendError(req: express.Request, res: express.Response, error: Boom.Boom): void {
    req.logger.error(`error: ${error.message}`);
    res.status(error.output.statusCode).json(error.output.payload);
}

if (!module.parent) {
    const port = Number(process.env.NODEJS_PORT) || 8080;

    assert(port, 'no port provided for the application to listen to');

    const telegramProvider = getTelegramProvider();

    telegramProvider.setWebhook();

    if (config['localtunnel.enable']) {
        localtunnel({port, subdomain: 'petstore'}).then((tunnel) => {
            console.log(`tunnel created ${tunnel.url}`);
        });
    }

    app.listen(port, () => console.log(`application started on port ${port}`));
}
