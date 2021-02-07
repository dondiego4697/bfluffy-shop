import {toFinite} from 'lodash';
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, AfterLoad} from 'typeorm';
import {Order} from '$db/entity/index';

export interface OrderPositionData {
    storage: {
        id: number;
        cost: number;
        quantity: number;
    };
    catalog: {
        id: number;
        publicId: string;
        displayName?: string;
        description?: string;
        rating?: number;
        manufacturerCountry?: string;
        photoUrls: string[];
        brand: {
            code: string;
            name: string;
        };
        pet: {
            code: string;
            name: string;
        };
        good: {
            code: string;
            name: string;
        };
    };
}

@Entity()
export class OrderPosition {
    @AfterLoad()
    _convertNumerics() {
        this.id = toFinite(this.id);
        this.orderId = toFinite(this.orderId);
        this.cost = toFinite(this.cost);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, (order) => order.orderPositions)
    @JoinColumn({name: 'order_id', referencedColumnName: 'id'})
    order: Order;

    @Column({name: 'order_id'})
    orderId: number;

    @Column()
    cost: number;

    @Column()
    quantity: number;

    @Column({type: 'jsonb'})
    data: OrderPositionData;

    @Column({name: 'created_at'})
    createdAt: Date;
}
