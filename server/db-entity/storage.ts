import {toFinite} from 'lodash';
import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, AfterLoad} from 'typeorm';
import {Catalog} from '$db/entity/index';

@Entity()
export class Storage {
    @AfterLoad()
    _convertNumerics() {
        this.id = toFinite(this.id);
        this.cost = toFinite(this.cost);
        this.catalogId = toFinite(this.catalogId);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'catalog_id'})
    catalogId: number;

    @OneToOne(() => Catalog)
    @JoinColumn({name: 'catalog_id', referencedColumnName: 'id'})
    catalog: Catalog;

    @Column({type: 'numeric'})
    cost: number;

    @Column()
    quantity: number;

    @Column({name: 'created_at'})
    createdAt: Date;

    @Column({name: 'updated_at'})
    updatedAt: Date;
}
