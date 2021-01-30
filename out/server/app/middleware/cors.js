"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cors = void 0;
const config_1 = require("../config");
function cors(req, res) {
    const origin = req.headers.origin || '';
    const allowedOrigins = config_1.config['cors.allowedOrigins'];
    if (Array.isArray(origin) || (allowedOrigins && !allowedOrigins.includes(origin))) {
        throw new Error('unsupported origin in this request');
    }
    res.set({
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'access-control-allow-headers': config_1.config['header.requestId'],
        'access-control-allow-credentials': 'true'
    });
    if (!req.path.includes('/api')) {
        res.setHeader('access-control-max-age', 86400);
    }
    res.send();
}
exports.cors = cors;
//# sourceMappingURL=cors.js.map