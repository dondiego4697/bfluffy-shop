import {toFinite} from 'lodash';
import {Entity, PrimaryGeneratedColumn, OneToMany, Column, AfterLoad} from 'typeorm';
import {DbTable} from '$db-entity/tables';
import {Order} from './entities';

@Entity({name: DbTable.USER})
export class User {
    @AfterLoad()
    _convertNumerics() {
        this.id = toFinite(this.id);
    }

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    phone: string;

    @Column({name: 'is_root'})
    isRoot: boolean;

    @Column({name: 'created_at'})
    createdAt: Date;
}
