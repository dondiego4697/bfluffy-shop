import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    phone: string;

    @Column({name: 'last_sms_code'})
    lastSmsCode: number;

    @Column({name: 'last_sms_code_at'})
    lastSmsCodeAt: Date;

    @Column({name: 'created_at'})
    createdAt: Date;
}
