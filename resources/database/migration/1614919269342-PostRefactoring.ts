import {MigrationInterface, QueryRunner} from 'typeorm';

export class PostRefactoring1614919269342 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS postgis;

            CREATE TABLE order_status_history (
                id BIGSERIAL NOT NULL,

                order_id BIGINT NOT NULL,

                status TEXT NOT NULL,
                resolution TEXT,
                
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

                CONSTRAINT pk_order_status_history PRIMARY KEY (id),
                CONSTRAINT fk_order_status_history_order_id_orders FOREIGN KEY(order_id) REFERENCES orders (id)
            );

            CREATE TABLE delivery_area (
                id BIGSERIAL NOT NULL,
                
                city TEXT NOT NULL,
                district TEXT NOT NULL,
                location GEOMETRY NOT NULL,
                enable BOOLEAN NOT NULL DEFAULT FALSE,

                CONSTRAINT pk_delivery_area PRIMARY KEY (id),
                CONSTRAINT uq_delivery_area_city_district UNIQUE (city, district)
            );

            CREATE OR REPLACE FUNCTION create_new_order_status()
                RETURNS TRIGGER AS $$
                BEGIN
                    INSERT INTO order_status_history (order_id, status, resolution) VALUES (NEW.id, NEW.status, NEW.resolution);
                    RETURN NEW;
                END;
                $$ language 'plpgsql';

            CREATE TRIGGER
                create_new_order_status_trigger
            BEFORE UPDATE ON
                orders
            FOR EACH ROW
                WHEN (NEW.status <> OLD.status OR NEW.resolution <> OLD.resolution)
            EXECUTE PROCEDURE
                create_new_order_status();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER create_new_order_status_trigger ON orders;

            DROP TABLE order_status_history;
            DROP TABLE delivery_area;

            DROP FUNCTION create_new_order_status;
        `);
    }

}

