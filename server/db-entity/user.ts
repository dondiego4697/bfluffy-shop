import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';
import {DbTable} from '$db-entity/tables';

@Entity({name: DbTable.USER})
export class User {
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

    @Column({name: 'created_at'})
    createdAt: Date;
}
