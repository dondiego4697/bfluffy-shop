import {toFinite} from 'lodash';
import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, AfterLoad} from 'typeorm';
import {CatalogItem} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';

@Entity({name: DbTable.STORAGE})
export class Storage {
    @AfterLoad()
    _convertNumerics() {
        this.id = toFinite(this.id);
        this.cost = toFinite(this.cost);
        this.catalogItemId = toFinite(this.catalogItemId);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'catalog_item_id'})
    catalogItemId: number;

    @OneToOne(() => CatalogItem)
    @JoinColumn({name: 'catalog_item_id', referencedColumnName: 'id'})
    catalogItem: CatalogItem;

    @Column({type: 'numeric'})
    cost: number;

    @Column()
    quantity: number;

    @Column({name: 'created_at'})
    createdAt: Date;

    @Column({name: 'updated_at'})
    updatedAt: Date;
}
