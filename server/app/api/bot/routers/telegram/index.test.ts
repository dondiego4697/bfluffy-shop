/* eslint-disable @typescript-eslint/no-explicit-any, no-async-promise-executor */
import got from 'got';
import moment from 'moment';
import {v4 as uuidv4} from 'uuid';
import {random} from 'lodash';

import {TestContext} from 'tests/test-context';
import {config} from 'app/config';
import {logger} from '$logger/logger';
import {TelegramProvider} from '$telegram/provider';
import {TestFactory} from 'tests/test-factory';

const PATH = `/bot/telegram/${config['telegram.bot.token']}`;

function createRequest(text: string, isBot = false) {
    return {
        message: {
            message_id: random(1, 10000),
            from: {
                id: random(1, 10000),
                is_bot: isBot
            },
            chat: {
                id: random(1, 10000)
            },
            date: moment().format('X'),
            text
        }
    };
}

describe('telegram router', () => {
    const context = new TestContext();
    let url: string;

    beforeAll(async () => {
        url = await context.getServerAddress();
        await context.beforeAll();
    });

    afterAll(async () => {
        await context.afterAll();
    });

    beforeEach(async () => {
        await context.beforeEach();
    });

    it('should check on bot', async () => {
        const request = createRequest('/start', true);
        const data = await new Promise(async (resolve) => {
            TelegramProvider.prototype.sendMessage = jest
                .fn()
                .mockImplementationOnce(async (chatId: number, text: string) => {
                    resolve({chatId, text});
                });

            const {statusCode} = await got.post(`${url}${PATH}`, {
                json: request
            });

            expect(statusCode).toBe(200);
        });

        expect(data).toEqual({
            chatId: request.message.chat.id,
            text: 'Мы не можем общаться с ботом :('
        });
    });

    describe('/start <id>', () => {
        it('should check uuid', async () => {
            const message = await new Promise(async (resolve) => {
                jest.spyOn(logger, 'error').mockImplementationOnce((message: any) => {
                    resolve(message);

                    return {} as any;
                });

                const {statusCode} = await got.post(`${url}${PATH}`, {
                    json: createRequest('/start wrong_uuid')
                });

                expect(statusCode).toBe(200);
            });

            expect(message).toBe('Invalid UUID');
        });

        it('should write error if order does not exist', async () => {
            const orderId = uuidv4();

            const request = createRequest(`/start ${orderId}`);

            const data: any = await new Promise(async (resolve) => {
                TelegramProvider.prototype.sendMessage = jest
                    .fn()
                    .mockImplementationOnce(async (chatId: number, text: string) => {
                        resolve({chatId, text});
                    });

                const {statusCode} = await got.post(`${url}${PATH}`, {
                    json: request
                });

                expect(statusCode).toBe(200);
            });

            expect(data).toEqual({
                chatId: request.message.chat.id,
                text: [
                    `Заказа *${orderId}* не существует :(`,
                    'Пожалуйста обратитесь в поддержку, мы обязательно вам поможем.'
                ].join('\n')
            });
        });

        it('should write error if telegram user id is different', async () => {
            const user = await TestFactory.createUser({telegramUserId: 99999});
            const order = await TestFactory.createOrder({userId: user.id});
            const request = createRequest(`/start ${order.publicId}`);

            const data: any = await new Promise(async (resolve) => {
                TelegramProvider.prototype.sendMessage = jest
                    .fn()
                    .mockImplementationOnce(async (chatId: number, text: string) => {
                        resolve({chatId, text});
                    });

                const {statusCode} = await got.post(`${url}${PATH}`, {
                    json: request
                });

                expect(statusCode).toBe(200);
            });

            expect(data).toEqual({
                chatId: request.message.chat.id,
                text: [
                    'Кажется, это не ваш заказ!',
                    'Возможно, вы вошли с другого аккаунта нежели раньше?',
                    'Если так, пожалуйста, сообщите в поддержку, мы обязательно вам поможем.'
                ].join('\n')
            });
        });

        it('should update user', async () => {
            const order = await TestFactory.createOrder();
            const request = createRequest(`/start ${order.publicId}`);

            const data: any = await new Promise(async (resolve) => {
                TelegramProvider.prototype.sendMessage = jest
                    .fn()
                    .mockImplementationOnce(async (chatId: number, text: string) => {
                        resolve({chatId, text});
                    });

                const {statusCode} = await got.post(`${url}${PATH}`, {
                    json: request
                });

                expect(statusCode).toBe(200);
            });

            expect(data).toEqual({
                chatId: request.message.chat.id,
                text: 'Подписка на уведомления успешно активирована!'
            });

            const users = await TestFactory.getAllUsers();
            const checkUser = users.find((item) => item.id === order.userId);

            expect(checkUser).toMatchObject({
                telegramEnable: true,
                telegramChatId: request.message.chat.id,
                telegramUserId: request.message.from.id
            });
        });
    });

    describe('/start', () => {
        it('should write error if user does not exist', async () => {
            const request = createRequest('/start');
            const data: any = await new Promise(async (resolve) => {
                TelegramProvider.prototype.sendMessage = jest
                    .fn()
                    .mockImplementationOnce(async (chatId: number, text: string) => {
                        resolve({chatId, text});
                    });

                const {statusCode} = await got.post(`${url}${PATH}`, {
                    json: request
                });

                expect(statusCode).toBe(200);
            });

            expect(data).toEqual({
                chatId: request.message.chat.id,
                text: [
                    'К сожалению мы не можем определить кто нам пишет :(',
                    'Такая возможность доступна только, если вы перешли по ссылке со своего заказа!'
                ].join('\n')
            });
        });

        it('should update user', async () => {
            const request = createRequest('/start');
            const user = await TestFactory.createUser({telegramUserId: request.message.from.id});

            const data: any = await new Promise(async (resolve) => {
                TelegramProvider.prototype.sendMessage = jest
                    .fn()
                    .mockImplementationOnce(async (chatId: number, text: string) => {
                        resolve({chatId, text});
                    });

                const {statusCode} = await got.post(`${url}${PATH}`, {
                    json: request
                });

                expect(statusCode).toBe(200);
            });

            expect(data).toEqual({
                chatId: request.message.chat.id,
                text: 'Подписка на уведомления успешно активирована!'
            });

            const users = await TestFactory.getAllUsers();
            const checkUser = users.find((item) => item.id === user.id);

            expect(checkUser).toMatchObject({
                telegramEnable: true
            });
        });
    });

    describe('/help', () => {
        it('should return correct data', async () => {
            const request = createRequest('/help');
            const data: any = await new Promise(async (resolve) => {
                TelegramProvider.prototype.sendMessage = jest
                    .fn()
                    .mockImplementationOnce(async (chatId: number, text: string) => {
                        resolve({chatId, text});
                    });

                const {statusCode} = await got.post(`${url}${PATH}`, {
                    json: request
                });

                expect(statusCode).toBe(200);
            });

            expect(data).toEqual({
                chatId: request.message.chat.id,
                text: [
                    '*Доступные команды:*\n',
                    '_/start_ - Включить оповещения о смене статуса заказа.',
                    '_/cancel_ - Вам не будут приходить оповещения о смене статуса заказа.',
                    '_/status_ - Посмотреть актуальные статусы по активным заказам.'
                ].join('\n')
            });
        });
    });

    describe('/cancel', () => {
        it('should disable user', async () => {
            const request = createRequest('/cancel');
            const user = await TestFactory.createUser({
                telegramUserId: request.message.from.id,
                telegramEnable: true
            });

            const usersBefore = await TestFactory.getAllUsers();
            const checkUserBefore = usersBefore.find((item) => item.id === user.id);

            expect(checkUserBefore).toMatchObject({
                telegramEnable: true
            });

            const data: any = await new Promise(async (resolve) => {
                TelegramProvider.prototype.sendMessage = jest
                    .fn()
                    .mockImplementationOnce(async (chatId: number, text: string) => {
                        resolve({chatId, text});
                    });

                const {statusCode} = await got.post(`${url}${PATH}`, {
                    json: request
                });

                expect(statusCode).toBe(200);
            });

            expect(data).toEqual({
                chatId: request.message.chat.id,
                text: 'Вы успешно отписаны от уведомлений!'
            });

            const usersAfter = await TestFactory.getAllUsers();
            const checkUserAfter = usersAfter.find((item) => item.id === user.id);

            expect(checkUserAfter).toMatchObject({
                telegramEnable: false
            });
        });
    });

    describe('/status', () => {
        it.todo('get status by active orders');
    });
});
