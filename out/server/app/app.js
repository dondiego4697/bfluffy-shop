"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const boom_1 = __importDefault(require("@hapi/boom"));
const assert_1 = __importDefault(require("assert"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const render_html_1 = require("./middleware/render-html");
const static_1 = require("./middleware/static");
const ping_1 = require("./middleware/ping");
const helmet_1 = require("./middleware/helmet");
const cors_1 = require("./middleware/cors");
const request_id_1 = require("./middleware/request-id");
const logger_1 = require("./middleware/logger");
const v1_1 = require("./api/v1");
const error_1 = require("../service/error/error");
const bodyParserJson = body_parser_1.default.json({
    limit: '5mb',
    strict: false
});
exports.app = express_1.default()
    .set('views', path_1.default.resolve('resources/views'))
    .set('view engine', 'pug')
    .enable('trust proxy')
    .disable('x-powered-by')
    .options('*', cors_1.cors)
    .use(logger_1.logger)
    .use(request_id_1.requestId)
    .use(helmet_1.helmet)
    .use(cookie_parser_1.default())
    .use(bodyParserJson)
    .get('/ping', ping_1.ping)
    .use(static_1.router)
    .use('/api/v1', v1_1.router)
    .get('/*', render_html_1.renderHTML)
    .use((_req, _res, next) => next(boom_1.default.notFound('endpoint not found')))
    // eslint-disable-next-line
    .use((error, req, res, _next) => {
    if (error.isBoom) {
        sendError(res, error);
    }
    else if (error instanceof error_1.ClientError) {
        sendError(res, boom_1.default.badRequest(error.clientErrorCode));
    }
    else {
        req.logger.error(`unknown error: ${error.message}`);
        sendError(res, boom_1.default.internal());
    }
});
function sendError(res, error) {
    res.status(error.output.statusCode).json(error.output.payload);
}
if (!module.parent) {
    const port = process.env.NODEJS_PORT || 8080;
    assert_1.default(port, 'no port provided for the application to listen to');
    exports.app.listen(port, () => console.log(`application started on port ${port}`));
}
//# sourceMappingURL=app.js.map