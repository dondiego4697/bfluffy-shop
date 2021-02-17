import * as express from 'express';
import {config} from 'app/config';
import {getTelegramProvider} from '$telegram/provider';

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
    }
}

export const router = express
    .Router()
    .post(`/${config['telegram.bot.token']}`, (req, res) => {
        const telegramProvider = getTelegramProvider();
        const body = req.body as Body;

        if (body.message.text.startsWith('/start')) {
            const orderId = body.message.text.replace('/start', '').trim();

            if (!orderId) {
                // Если заказ есть, то все ок, шлем сообщение успешное
                // Если заказа нет, то шлем нахер и просим написать в поддержку
            } else {
                // Если человек уже зарегистрирован (определяем chat_id) то просто обновляем telegram_enable=true
                // Если человека нет, то ошибку, что к сожалению вы не делали заказов
            }
        }

        if (body.message.text.startsWith('/help')) {
            telegramProvider.sendMessage(body.message.chat.id, [
                '*Доступные команды:*\n',
                '_/start_ - Включить оповещения о смене статуса заказа.',
                '_/cancel_ - Вам не будут приходить оповещения о смене статуса заказа.',
                '_/status_ - Посмотреть актуальные статусы по активным заказам.'
            ].join('\n'));
        }

        if (body.message.text.startsWith('/cancel')) {
            // telegram_enable=false
        }

        if (body.message.text.startsWith('/status')) {
            // Достаем все заказы не cancelled
        }
        
        res.end();
    })
