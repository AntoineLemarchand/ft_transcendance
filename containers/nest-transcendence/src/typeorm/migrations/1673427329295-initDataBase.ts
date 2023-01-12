import { MigrationInterface, QueryRunner } from "typeorm";

export class initDataBase1673427329295 implements MigrationInterface {
    name = 'initDataBase1673427329295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("friends" text array NOT NULL, "blockedUsers" text array NOT NULL, "channelNames" text array NOT NULL, "name" character varying NOT NULL, "password" character varying NOT NULL DEFAULT '', CONSTRAINT "PK_065d4d8f3b5adb4a08841eae3c8" PRIMARY KEY ("name"))`);
        await queryRunner.query(`CREATE TABLE "channel" ("messages" jsonb NOT NULL, "admins" text array NOT NULL, "bannedUsers" text array NOT NULL, "channelName" character varying NOT NULL, "password" character varying NOT NULL DEFAULT '', "type" jsonb NOT NULL, CONSTRAINT "PK_5e14b4df8f849a695c6046fe741" PRIMARY KEY ("channelName"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "channel"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
