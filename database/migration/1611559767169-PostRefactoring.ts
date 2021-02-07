import {MigrationInterface, QueryRunner} from 'typeorm';

export class PostRefactoring1611559767169 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                id BIGSERIAL NOT NULL,
                phone TEXT NOT NULL,
                
                last_sms_code INTEGER NOT NULL,
                last_sms_code_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

                created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

                CONSTRAINT pk_users PRIMARY KEY (id),
                CONSTRAINT uq_users_phone UNIQUE (phone)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users";`);
    }

}
