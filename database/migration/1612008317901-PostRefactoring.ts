import {MigrationInterface, QueryRunner} from 'typeorm';

export class PostRefactoring1612008317901 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE OR REPLACE FUNCTION updated_at_column_f()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = now();
                    RETURN NEW;
                END;
                $$ language 'plpgsql';

            CREATE TABLE good_type (
                id SERIAL NOT NULL,
                code TEXT NOT NULL,
                display_name TEXT NOT NULL,

                CONSTRAINT pk_good_type PRIMARY KEY (id),
                CONSTRAINT uq_good_type_code UNIQUE (code)
            );

            CREATE TABLE brand (
                id SERIAL NOT NULL,
                code TEXT NOT NULL,
                display_name TEXT NOT NULL,

                CONSTRAINT pk_brand PRIMARY KEY (id),
                CONSTRAINT uq_brand_code UNIQUE (code)
            );

            CREATE TABLE "pet_category" (
                id SERIAL NOT NULL,
                code TEXT NOT NULL,
                display_name TEXT NOT NULL,

                CONSTRAINT pk_pet_category PRIMARY KEY (id),
                CONSTRAINT uq_pet_category_code UNIQUE (code)
            );

            CREATE TABLE catalog (
                id BIGSERIAL NOT NULL,

                good_type_id INTEGER NOT NULL,
                brand_id INTEGER NOT NULL,
                pet_category_id INTEGER NOT NULL,

                display_name TEXT,
                description TEXT,
                rating REAL DEFAULT 0,
                photo_url TEXT,

                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

                CONSTRAINT pk_catalog PRIMARY KEY (id),
                CONSTRAINT fk_catalog_good_type_id_good_type FOREIGN KEY(good_type_id) REFERENCES good_type (id),
                CONSTRAINT fk_catalog_brand_id_brand FOREIGN KEY(brand_id) REFERENCES brand (id),
                CONSTRAINT fk_catalog_pet_category_id_pet_category FOREIGN KEY(pet_category_id) REFERENCES pet_category (id)
            );

            CREATE TRIGGER
                update_catalog_updated_at_trigger
            BEFORE UPDATE ON
                catalog
            FOR EACH ROW EXECUTE PROCEDURE
                updated_at_column_f();

            CREATE TABLE catalog_item (
                id BIGSERIAL NOT NULL,

                catalog_id BIGINT NOT NULL,

                weight REAL NOT NULL,
                public_id UUID NOT NULL DEFAULT uuid_generate_v1(),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

                CONSTRAINT pk_catalog_item PRIMARY KEY (id),
                CONSTRAINT fk_catalog_item_catalog_id_catalog FOREIGN KEY(catalog_id) REFERENCES catalog (id),
                CONSTRAINT uq_catalog_item_public_id UNIQUE (public_id)
            );

            CREATE TABLE storage (
                id BIGSERIAL NOT NULL,

                catalog_item_id BIGINT NOT NULL,

                cost NUMERIC(9, 2) NOT NULL,
                quantity INTEGER NOT NULL,

                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

                CONSTRAINT pk_storage PRIMARY KEY (id),
                CONSTRAINT fk_storage_catalog_item_id_catalog_item FOREIGN KEY(catalog_item_id) REFERENCES catalog_item (id)
            );

            CREATE TRIGGER
                update_storage_updated_at_trigger
            BEFORE UPDATE ON
                storage
            FOR EACH ROW EXECUTE PROCEDURE
                updated_at_column_f();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER update_storage_updated_at_trigger ON storage;
            DROP TRIGGER update_catalog_updated_at_trigger ON catalog;

            DROP TABLE storage;
            DROP TABLE catalog_item;
            DROP TABLE catalog;

            DROP TABLE pet_category;
            DROP TABLE brand;
            DROP TABLE good_type;

            DROP FUNCTION updated_at_column_f;
        `);
    }

}
