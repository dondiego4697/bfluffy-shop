import * as express from 'express';
import {parse as parseUuid} from 'uuid';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {config} from 'app/config';
import {getTelegramProvider} from '$telegram/provider';
import {dbManager} from 'app/lib/db-manager';
import {User, Order} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';
import {logger} from '$logger/logger';

interface Body {
    message: {
        message_id: number;
        from: {
            id: number;
            is_bot: boolean;
        };
        chat: {
            id: number;
        };
        date: Date;
        text: string;
    };
}

interface StartCmdParams {
    orderId?: string;
    chatId: number;
    userId: number;
}

async function startCmd(params: StartCmdParams) {
    const {orderId, chatId, userId} = params;

    if (orderId) {
        try {
            parseUuid(orderId);
        } catch (error) {
            logger.error(error.message, {orderId, group: 'application'});

            return;
        }

        const connection = await dbManager.getConnection();

        const order = await connection
            .getRepository(Order)
            .createQueryBuilder(DbTable.ORDER)
            .innerJoinAndSelect(`${DbTable.ORDER}.user`, DbTable.USER)
            .where(`${DbTable.ORDER}.public_id = :id`, {id: orderId})
            .getOne();

        if (!order) {
            await sendMessage(
                chatId,
                [
                    `Заказа *${orderId}* не существует :(`,
                    'Пожалуйста обратитесь в поддержку, мы обязательно вам поможем.'
                ].join('\n')
            );

            return;
        }

        if (order.user.telegramUserId && order.user.telegramUserId !== userId) {
            await sendMessage(
                chatId,
                [
                    'Кажется, это не ваш заказ!',
                    'Возможно, вы вошли с другого аккаунта нежели раньше?',
                    'Если так, пожалуйста, сообщите в поддержку, мы обязательно вам поможем.'
                ].join('\n')
            );

            return;
        }

        await connection
            .createQueryBuilder()
            .update(User)
            .set({
                telegramEnable: true,
                telegramChatId: chatId,
                telegramUserId: userId
            })
            .where('id = :id', {id: order.user.id})
            .execute();

        await sendMessage(chatId, 'Подписка на уведомления успешно активирована!');
    } else {
        const connection = await dbManager.getConnection();

        const user = await connection
            .getRepository(User)
            .createQueryBuilder(DbTable.USER)
            .where(`${DbTable.USER}.telegram_user_id = :id`, {id: userId})
            .getOne();

        if (!user) {
            await sendMessage(
                chatId,
                [
                    'К сожалению мы не можем определить кто нам пишет :(',
                    'Такая возможность доступна только, если вы перешли по ссылке со своего заказа!'
                ].join('\n')
            );

            return;
        }

        await connection
            .createQueryBuilder()
            .update(User)
            .set({
                telegramEnable: true
            })
            .where('id = :id', {id: user.id})
            .execute();

        await sendMessage(chatId, 'Подписка на уведомления успешно активирована!');
    }
}

async function helpCmd(chatId: number) {
    const telegramProvider = getTelegramProvider();

    telegramProvider.sendMessage(
        chatId,
        [
            '*Доступные команды:*\n',
            '_/start_ - Включить оповещения о смене статуса заказа.',
            '_/cancel_ - Вам не будут приходить оповещения о смене статуса заказа.',
            '_/status_ - Посмотреть актуальные статусы по активным заказам.'
        ].join('\n')
    );
}

async function cancelCmd(userId: number, chatId: number) {
    const telegramProvider = getTelegramProvider();
    const connection = await dbManager.getConnection();

    await connection
        .createQueryBuilder()
        .update(User)
        .set({
            telegramEnable: false
        })
        .where('telegram_user_id = :id', {id: userId})
        .execute();

    await telegramProvider.sendMessage(chatId, 'Вы успешно отписаны от уведомлений!');
}

async function statusCmd() {
    // TODO Достаем все заказы не cancelled
}

async function sendMessage(chatId: number, message: string) {
    const telegramProvider = getTelegramProvider();

    return telegramProvider.sendMessage(chatId, message);
}

export const router = express.Router().post(
    `/${config['telegram.bot.token']}`,
    wrap<Request, Response>(async (req, res) => {
        const {message} = req.body as Body;

        if (message.from.is_bot) {
            sendMessage(message.chat.id, 'Мы не можем общаться с ботом :(');

            return res.end();
        }

        if (message.text.startsWith('/start')) {
            const orderId = message.text.replace('/start', '').trim();

            startCmd({
                orderId,
                chatId: message.chat.id,
                userId: message.from.id
            });
        }

        if (message.text.startsWith('/help')) {
            helpCmd(message.chat.id);
        }

        if (message.text.startsWith('/cancel')) {
            cancelCmd(message.from.id, message.chat.id);
        }

        if (message.text.startsWith('/status')) {
            statusCmd();
        }

        res.end();
    })
);
