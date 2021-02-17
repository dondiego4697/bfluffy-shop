import {omit} from 'lodash';
import got, {Got} from 'got';
import {logger} from '$logger/logger';
import {ClientError} from '$error/error';
import {config} from 'app/config';

export class SmsProvider {
    protected logGroup: 'sms_provider' = 'sms_provider';
    protected sender = config['sms-boom.sender'];
    protected client: Got;

    constructor() {
        this.client = got.extend({
            prefixUrl: config['sms-boom.host'],
            responseType: 'json',
            headers: {
                authorization: `Basic ${config['sms-boom.token']}`
            },
            retry: 0,
            hooks: {
                beforeRequest: [
                    (options) => {
                        logger.info('before_request', {
                            group: this.logGroup,
                            url: options.url,
                            headers: omit(options.headers, ['authorization']),
                            method: options.method,
                            body: options.json
                        });
                    }
                ],
                beforeError: [
                    (error) => {
                        logger.error('before_error', {
                            group: this.logGroup,
                            error: error.message,
                            statusCode: error.response?.statusCode,
                            body: error.response?.body,
                            url: error.request?.requestUrl,
                            headers: omit(error.response?.headers, ['authorization'])
                        });

                        return error;
                    }
                ],
                afterResponse: [
                    (response) => {
                        logger.info('after_response', {
                            group: this.logGroup,
                            statusCode: response.statusCode,
                            url: response.request.requestUrl,
                            headers: omit(response.headers, ['authorization']),
                            body: response.body,
                            method: response.method
                        });

                        return response;
                    }
                ]
            }
        });
    }

    public async send(phone: number, text: string) {
        if (!config['sms-boom.enable']) {
            logger.info('sms was sent', {group: this.logGroup, phone, text});

            return;
        }

        try {
            const {body, statusCode} = await this.client.get('messages/v2/send', {
                searchParams: {
                    phone,
                    text,
                    sender: this.sender
                }
            });

            logger.info('sms was sent', {
                group: this.logGroup,
                phone,
                text,
                statusCode,
                response: body
            });
        } catch (error) {
            throw new ClientError('SMS_SEND_FAILED', {
                message: 'sms did not sent',
                group: this.logGroup,
                meta: {phone, text}
            });
        }
    }
}
