"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helmet = void 0;
const helmet_1 = __importDefault(require("helmet"));
const crypto_1 = require("crypto");
const csp_1 = require("../csp");
exports.helmet = [
    (req, _res, next) => {
        req.nonce = crypto_1.randomBytes(16).toString('base64');
        next();
    },
    helmet_1.default({
        xssFilter: false,
        contentSecurityPolicy: {
            directives: Object.assign(Object.assign({}, csp_1.directives), { scriptSrc: [
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...((csp_1.directives === null || csp_1.directives === void 0 ? void 0 : csp_1.directives.scriptSrc) ? csp_1.directives.scriptSrc : []),
                    (req) => `'nonce-${req.nonce}'`
                ] })
        }
    })
];
//# sourceMappingURL=helmet.js.map