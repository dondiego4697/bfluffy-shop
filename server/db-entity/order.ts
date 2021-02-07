import {toFinite} from 'lodash';
import {Entity, PrimaryGeneratedColumn, Column, OneToMany, AfterLoad} from 'typeorm';
import {OrderPosition} from '$db/entity/index';

interface Data {
    sdek: string;
}

export enum OrderStatus {
    CREATED = 'CREATED',
    IN_DELIVERY = 'IN_DELIVERY',
    FINISHED = 'FINISHED'
}

export enum OrderResolution {
    SUCCESS = 'SUCCESS',
    CANCELLED = 'CANCELLED',
    ANNULATED = 'ANNULATED'
}

@Entity({name: 'orders'})
export class Order {
    @AfterLoad()
    _convertNumerics() {
        this.id = toFinite(this.id);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => OrderPosition, (position) => position.order)
    orderPositions: OrderPosition[];

    @Column({name: 'public_id'})
    publicId: string;

    @Column({type: 'jsonb'})
    data: Data;

    @Column({name: 'client_phone'})
    clientPhone: string;

    @Column({name: 'delivery_address'})
    deliveryAddress: string;

    @Column({nullable: true, name: 'delivery_comment'})
    deliveryComment: string;

    @Column({name: 'delivery_date'})
    deliveryDate: Date;

    @Column({name: 'created_at'})
    createdAt: Date;

    @Column()
    status: OrderStatus;

    @Column({nullable: true})
    resolution: OrderResolution;
}
