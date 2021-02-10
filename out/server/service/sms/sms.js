"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsProvider = void 0;
const lodash_1 = require("lodash");
const got_1 = __importDefault(require("got"));
const logger_1 = require("../logger/logger");
const GROUP = 'sms_provider';
class SmsProvider {
    constructor() {
        this.client = got_1.default.extend({
            prefixUrl: 'http://host/api/',
            responseType: 'json',
            headers: {},
            retry: {
                limit: 2,
                methods: ['POST', 'GET', 'PUT']
            },
            hooks: {
                beforeRequest: [
                    (options) => {
                        const { url } = options;
                        logger_1.logger.info('before_request', {
                            group: GROUP,
                            url,
                            headers: lodash_1.omit(options.headers, ['authorization'])
                        });
                    }
                ],
                beforeError: [
                    (error) => {
                        var _a, _b, _c, _d;
                        logger_1.logger.error('before_error', {
                            group: GROUP,
                            error: error.message,
                            statusCode: (_a = error.response) === null || _a === void 0 ? void 0 : _a.statusCode,
                            body: (_b = error.response) === null || _b === void 0 ? void 0 : _b.body,
                            url: (_c = error.request) === null || _c === void 0 ? void 0 : _c.requestUrl,
                            headers: (_d = error.response) === null || _d === void 0 ? void 0 : _d.headers
                        });
                        return error;
                    }
                ],
                afterResponse: [
                    (response) => {
                        logger_1.logger.info('after_response', {
                            group: GROUP,
                            statusCode: response.statusCode,
                            url: response.request.requestUrl,
                            headers: response.headers
                        });
                        return response;
                    }
                ]
            }
        });
    }
    async sendSms(phone, text) {
        logger_1.logger.info('send_sms', { phone, text });
    }
}
exports.smsProvider = new SmsProvider();
//# sourceMappingURL=sms.js.map