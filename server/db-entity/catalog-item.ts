import {toFinite} from 'lodash';
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, AfterLoad, JoinColumn} from 'typeorm';
import {Catalog} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';

@Entity({name: DbTable.CATALOG_ITEM})
export class CatalogItem {
    @AfterLoad()
    _convertNumerics() {
        this.id = toFinite(this.id);
        this.catalogId = toFinite(this.catalogId);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'public_id'})
    publicId: string;

    @Column({name: 'catalog_id'})
    catalogId: number;

    @ManyToOne(() => Catalog, (catalog) => catalog.catalogItems)
    @JoinColumn({name: 'catalog_id', referencedColumnName: 'id'})
    catalog: Catalog;

    @Column({nullable: true})
    weight?: number;

    @Column({type: 'jsonb', name: 'photo_urls'})
    photoUrls: string[];

    @Column({name: 'created_at'})
    createdAt: Date;

    @Column({name: 'updated_at'})
    updatedAt: Date;
}
