import {toFinite} from 'lodash';
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, AfterLoad, JoinColumn} from 'typeorm';
import {GoodCategory, PetCategory, Brand} from '$db/entity/index';

@Entity()
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

    @Column({name: 'public_id'})
    publicId: string;

    @Column({name: 'group_id'})
    groupId: string;

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

    @Column({nullable: true, name: 'display_name'})
    displayName: string;

    @Column({nullable: true})
    description: string;

    @Column()
    rating: number;

    @Column({name: 'manufacturer_country'})
    manufacturerCountry: string;

    @Column({nullable: true, type: 'simple-array', name: 'photo_urls'})
    photoUrls: string[];

    @Column({name: 'created_at'})
    createdAt: Date;

    @Column({name: 'updated_at'})
    updatedAt: Date;
}
