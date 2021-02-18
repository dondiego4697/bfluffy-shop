import {toFinite} from 'lodash';
import {Entity, PrimaryGeneratedColumn, OneToMany, Column, AfterLoad} from 'typeorm';
import {DbTable} from '$db-entity/tables';
import {Order} from './entities';

@Entity({name: DbTable.USER})
export class User {
    @AfterLoad()
    _convertNumerics() {
        this.id = toFinite(this.id);
        this.telegramChatId = toFinite(this.telegramChatId);
        this.telegramUserId = toFinite(this.telegramUserId);
    }

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    phone: string;

    @Column({name: 'last_sms_code'})
    lastSmsCode: number;

    @Column({name: 'last_sms_code_at'})
    lastSmsCodeAt: Date;

    @Column({name: 'is_root'})
    isRoot: boolean;

    @Column({name: 'telegram_chat_id', nullable: true})
    telegramChatId?: number;

    @Column({name: 'telegram_user_id', nullable: true})
    telegramUserId?: number;

    @Column({name: 'telegram_enable'})
    telegramEnable: boolean;

    @Column({name: 'created_at'})
    createdAt: Date;
}
