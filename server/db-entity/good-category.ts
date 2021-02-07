import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import {Catalog} from '$db/entity/index';

@Entity()
export class GoodCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: string;

    @Column({name: 'display_name'})
    displayName: string;

    @OneToMany(() => Catalog, (catalog) => catalog.goodCategory)
    catalog: Catalog[];
}
