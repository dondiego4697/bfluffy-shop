import {MigrationInterface, QueryRunner} from 'typeorm';

export class PostRefactoring1611559767169 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                id BIGSERIAL NOT NULL,
                phone TEXT NOT NULL,
                
                last_sms_code INTEGER NOT NULL,
                last_sms_code_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

                is_root BOOLEAN NOT NULL DEFAULT FALSE,

                created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

                telegram_chat_id BIGINT,
                telegram_user_id BIGINT,
                telegram_enable BOOLEAN NOT NULL DEFAULT FALSE,

                CONSTRAINT pk_users PRIMARY KEY (id),
                CONSTRAINT uq_users_phone UNIQUE (phone)
            );

            CREATE INDEX users_phone_idx ON users USING btree (phone);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX users_phone_idx;

            DROP INDEX users_telegram_chat_id_idx;
            DROP INDEX users_telegram_user_id_idx;

            DROP TABLE "users";
        `);
    }

}
