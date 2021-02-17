import moment from 'moment';
import {random} from 'lodash';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {SmsProvider} from '$sms/provider';
import {User} from '$db-entity/entities';

interface Body {
    phone: number;
}

const TIMEOUT_IN_SECONDS = 30;

export const sendCode = wrap<Request, Response>(async (req, res) => {
    const {phone} = req.body as Body;
    const code = random(1000, 9999);

    const connection = await dbManager.getConnection();
    const {manager} = connection.getRepository(User);
    const user = await manager.findOne(User, {phone: String(phone)});

    const smsProvider = new SmsProvider();

    if (!user) {
        await connection
            .createQueryBuilder()
            .insert()
            .into(User)
            .values([
                {
                    phone: String(phone),
                    lastSmsCode: code,
                    lastSmsCodeAt: () => 'now()'
                }
            ])
            .execute();

        smsProvider.send(phone, `Ваш код: ${code}`);

        return res.json({left: TIMEOUT_IN_SECONDS});
    }

    const diff = moment().diff(moment(user.lastSmsCodeAt), 'seconds');

    if (diff > TIMEOUT_IN_SECONDS) {
        await connection
            .createQueryBuilder()
            .update(User)
            .set({
                lastSmsCode: code,
                lastSmsCodeAt: () => 'now()'
            })
            .where('id = :id', {id: user.id})
            .execute();

        smsProvider.send(phone, `Ваш код: ${code}`);

        return res.json({left: TIMEOUT_IN_SECONDS});
    }

    return res.json({left: TIMEOUT_IN_SECONDS - diff});
});
