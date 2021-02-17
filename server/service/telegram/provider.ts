import got, {Got} from 'got';
import {logger} from '$logger/logger';
import {config} from 'app/config';

interface SendMessageOptions {
    parseMode?: 'Markdown' | 'HTML';
    disableWebPagePreview?: boolean;
    disableNotification?: boolean;
}

export class TelegramProvider {
    protected logGroup = 'telegram_provider';
    protected client: Got;

    constructor() {
        this.client = got.extend({
            prefixUrl: `${config['telegram.host']}/bot${config['telegram.bot.token']}`,
            responseType: 'json',
            retry: 0,
            hooks: {
                beforeRequest: [
                    (options) => {
                        logger.info('before_request', {
                            group: this.logGroup,
                            url: TelegramProvider.hideToken(options.url.toString()),
                            headers: options.headers,
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
                            url: TelegramProvider.hideToken(error.request?.requestUrl),
                            headers: error.response?.headers
                        });
                        return error;
                    }
                ],
                afterResponse: [
                    (response) => {
                        logger.info('after_response', {
                            group: this.logGroup,
                            statusCode: response.statusCode,
                            url: TelegramProvider.hideToken(response.request.requestUrl),
                            headers: response.headers,
                            body: response.body,
                            method: response.method
                        });
                        return response;
                    }
                ]
            }
        });
    }

    protected static hideToken(url?: string) {
        if (!url) {
            return;
        }
    
        return decodeURIComponent(decodeURI(url)).split(config['telegram.bot.token']).join('<token>');
    }

    public async setWebhook() {
        await this.client.get('setWebhook', {
            searchParams: {
                url: `${config['app.host']}/bot/telegram/${config['telegram.bot.token']}`
            }
        })
    }

    public async sendMessage(
        chatId: number,
        text: string,
        options: SendMessageOptions = {
            disableNotification: false,
            disableWebPagePreview: true,
            parseMode: 'Markdown'
        }
    ) {
        await this.client.get('sendMessage', {
            searchParams: {
                chat_id: chatId,
                text,
                parse_mode: options.parseMode,
                disable_web_page_preview: options.disableWebPagePreview,
                disable_notification: options.disableNotification
            }
        });
    }
}

let telegramProvider: TelegramProvider;

export function getTelegramProvider() {
    if (telegramProvider) {
        return telegramProvider;
    }

    telegramProvider = new TelegramProvider();
    return telegramProvider;
}