import { MigrationInterface, QueryRunner } from 'typeorm';

export class initDataBase1675094029999 implements MigrationInterface {
  name = 'initDataBase1675094029999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("image" bytea NOT NULL, "imageFormat" text NOT NULL, "friends" text array NOT NULL, "blockedUsers" text array NOT NULL, "channelNames" text array NOT NULL, "name" character varying NOT NULL, "password" character varying NOT NULL DEFAULT '', CONSTRAINT "PK_065d4d8f3b5adb4a08841eae3c8" PRIMARY KEY ("name"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "channel" ("messages" jsonb NOT NULL, "admins" text array NOT NULL, "bannedUsers" text array NOT NULL, "channelName" character varying NOT NULL, "password" character varying NOT NULL DEFAULT '', "type" character varying NOT NULL, "mutedUsers" jsonb NOT NULL, CONSTRAINT "PK_5e14b4df8f849a695c6046fe741" PRIMARY KEY ("channelName"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "game_stat" ("player1" text NOT NULL, "player2" text NOT NULL, "score1" integer NOT NULL, "score2" integer NOT NULL, "gameId" integer NOT NULL, CONSTRAINT "PK_36283b95dd29edc78941153ade1" PRIMARY KEY ("gameId"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "game_stat"`);
    await queryRunner.query(`DROP TABLE "channel"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
