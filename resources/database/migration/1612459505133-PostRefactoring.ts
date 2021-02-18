import {MigrationInterface, QueryRunner} from 'typeorm';

export class PostRefactoring1612459505133 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE orders (
                id BIGSERIAL NOT NULL,
                public_id UUID NOT NULL DEFAULT uuid_generate_v1(),

                user_id BIGINT NOT NULL,

                data JSONB NOT NULL DEFAULT '{}'::jsonb,
                
                client_phone TEXT NOT NULL,
                
                delivery_address TEXT NOT NULL,
                delivery_comment TEXT,
                delivery_date TIMESTAMP WITH TIME ZONE NOT NULL,
                
                status TEXT NOT NULL,
                resolution TEXT,
                
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

                CONSTRAINT pk_orders PRIMARY KEY (id),
                CONSTRAINT fk_orders_user_id_users FOREIGN KEY(user_id) REFERENCES users (id)
            );

            CREATE INDEX orders_public_id_idx ON orders USING btree (public_id);
            CREATE INDEX orders_client_phone_idx ON orders USING btree (client_phone);

            CREATE TABLE order_position (
                id BIGSERIAL NOT NULL,

                order_id BIGINT NOT NULL,

                cost NUMERIC(9, 2) NOT NULL,
                quantity INTEGER NOT NULL,

                data JSONB NOT NULL DEFAULT '{}'::jsonb,

                created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

                CONSTRAINT pk_order_position PRIMARY KEY (id),
                CONSTRAINT fk_order_position_order_id_order FOREIGN KEY(order_id) REFERENCES orders (id)
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX orders_public_id_idx;
            DROP INDEX orders_client_phone_idx;

            DROP TABLE order_position;
            DROP TABLE orders;
        `);
    }

}
