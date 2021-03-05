import {toFinite} from 'lodash';
import {Entity, Column, ManyToOne, JoinColumn, AfterLoad, PrimaryGeneratedColumn} from 'typeorm';
import {Order} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';
import {OrderResolution, OrderStatus} from '$db-entity/order';

@Entity({name: DbTable.ORDER_STATUS_HISTORY})
export class OrderStatusHistory {
    @AfterLoad()
    _convertNumerics() {
        this.id = toFinite(this.id);
        this.orderId = toFinite(this.orderId);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, (order) => order.orderStatusesHistory)
    @JoinColumn({name: 'order_id', referencedColumnName: 'id'})
    order: Order;

    @Column({name: 'order_id'})
    orderId: number;

    @Column()
    status: OrderStatus;

    @Column({nullable: true})
    resolution?: OrderResolution;

    @Column({name: 'created_at'})
    createdAt: Date;
}
