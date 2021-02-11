import {toFinite} from 'lodash';
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, AfterLoad, JoinColumn, OneToMany} from 'typeorm';
import {GoodCategory, PetCategory, Brand, CatalogItem} from '$db-entity/entities';
import {DbTable} from '$db-entity/tables';

@Entity({name: DbTable.CATALOG})
export class Catalog {
    @AfterLoad()
    _convertNumerics() {
        this.id = toFinite(this.id);
        this.goodCategoryId = toFinite(this.goodCategoryId);
        this.petCategoryId = toFinite(this.petCategoryId);
        this.brandId = toFinite(this.brandId);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'good_category_id'})
    goodCategoryId: number;

    @ManyToOne(() => GoodCategory, (goodCategory) => goodCategory.catalog)
    @JoinColumn({name: 'good_category_id', referencedColumnName: 'id'})
    goodCategory: GoodCategory;

    @Column({name: 'pet_category_id'})
    petCategoryId: number;

    @ManyToOne(() => PetCategory, (petCategory) => petCategory.catalog)
    @JoinColumn({name: 'pet_category_id', referencedColumnName: 'id'})
    petCategory: PetCategory;

    @Column({name: 'brand_id'})
    brandId: number;

    @ManyToOne(() => Brand, (brand) => brand.catalog)
    @JoinColumn({name: 'brand_id', referencedColumnName: 'id'})
    brand: Brand;

    @OneToMany(() => CatalogItem, (catalogItem) => catalogItem.catalog)
    catalogItems: CatalogItem[];

    @Column({name: 'display_name'})
    displayName: string;

    @Column({nullable: true})
    description?: string;

    @Column()
    rating: number;

    @Column({nullable: true, name: 'manufacturer_country'})
    manufacturerCountry?: string;

    @Column({name: 'created_at'})
    createdAt: Date;

    @Column({name: 'updated_at'})
    updatedAt: Date;
}
