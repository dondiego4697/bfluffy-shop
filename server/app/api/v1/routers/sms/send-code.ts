import moment from 'moment';
import {random} from 'lodash';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {dbManager} from 'app/lib/db-manager';
import {DbTable, User} from '$db/entity/index';
import {smsProvider} from '$sms/sms';

interface Body {
    phone: number;
}

const TIMEOUT_IN_SECONDS = 30;

export const sendCode = wrap<Request, Response>(async (req, res) => {
    const {phone} = req.body as Body;
    const code = random(1000, 9999);

    const connection = dbManager.getConnection();

    const user = await connection
        .getRepository(User)
        .createQueryBuilder(DbTable.USER)
        .where(`${DbTable.USER}.phone = :phone`, {phone})
        .getOne();

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
            .returning('*')
            .execute();

        smsProvider.sendSms(phone, `Ваш код: ${code}`);

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

        smsProvider.sendSms(phone, `Ваш код: ${code}`);

        return res.json({left: TIMEOUT_IN_SECONDS});
    }

    return res.json({left: TIMEOUT_IN_SECONDS - diff});
});
