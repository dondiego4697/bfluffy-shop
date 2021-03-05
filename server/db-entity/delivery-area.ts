import {Polygon} from 'geojson';
import {toFinite} from 'lodash';
import {Column, Entity, AfterLoad, PrimaryGeneratedColumn} from 'typeorm';
import {DbTable} from '$db-entity/tables';

@Entity({name: DbTable.DELIVERY_AREA})
export class DeliveryArea {
    @AfterLoad()
    _convertNumerics() {
        this.id = toFinite(this.id);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    city: string;

    @Column()
    district: string;

    @Column({type: 'geometry'})
    location: Polygon;

    @Column()
    enable: boolean;
}
