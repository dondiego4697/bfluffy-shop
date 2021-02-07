import {omit} from 'lodash';
import got, {Got} from 'got';
import {logger} from '$logger/logger';

const GROUP = 'sms_provider';

class SmsProvider {
    protected client: Got;

    constructor() {
        this.client = got.extend({
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
                        const {url} = options;

                        logger.info('before_request', {
                            group: GROUP,
                            url,
                            headers: omit(options.headers, ['authorization'])
                        });
                    }
                ],
                beforeError: [
                    (error) => {
                        logger.error('before_error', {
                            group: GROUP,
                            error: error.message,
                            statusCode: error.response?.statusCode,
                            body: error.response?.body,
                            url: error.request?.requestUrl,
                            headers: error.response?.headers
                        });

                        return error;
                    }
                ],
                afterResponse: [
                    (response) => {
                        logger.info('after_response', {
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

    public async sendSms(phone: number, text: string) {
        logger.info('send_sms', {phone, text});
    }
}

export const smsProvider = new SmsProvider();
