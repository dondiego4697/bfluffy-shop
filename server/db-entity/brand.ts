import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity()
export class Brand {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: string;

    @Column()
    display_name: string;
}
