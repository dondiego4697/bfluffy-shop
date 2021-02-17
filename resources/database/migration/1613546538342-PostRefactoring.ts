import {MigrationInterface, QueryRunner} from 'typeorm';

export class PostRefactoring1613546538342 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" ADD COLUMN telegram_chat_id BIGINT;
            ALTER TABLE "users" ADD COLUMN telegram_user_id BIGINT;
            ALTER TABLE "users" ADD COLUMN telegram_enable BOOLEAN NOT NULL DEFAULT FALSE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN telegram_chat_id;
            ALTER TABLE "users" DROP COLUMN telegram_user_id;
            ALTER TABLE "users" DROP COLUMN telegram_enable;
        `);
    }

}
