import { MigrationInterface, QueryRunner } from 'typeorm';

export class ADDCARDANDCHARACTERTRANSLATIONS1729348855096
  implements MigrationInterface
{
  name = 'ADDCARDANDCHARACTERTRANSLATIONS1729348855096';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "card_translation" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text NOT NULL, "locale" character varying(2) NOT NULL, "card_id" integer, CONSTRAINT "PK_515a00b8778e5d33f642c7b3da8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "character_translation" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text NOT NULL, "profession" character varying(64) NOT NULL, "starting_location" character varying(64) NOT NULL, "locale" character varying(2) NOT NULL, "character_id" integer, CONSTRAINT "PK_582e757a31a731a1e04865a4d8c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_translation" ADD CONSTRAINT "FK_6a72370f1b4cddc241c52637580" FOREIGN KEY ("card_id") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "character_translation" ADD CONSTRAINT "FK_6714c574751f5700e1f7cb2fb52" FOREIGN KEY ("character_id") REFERENCES "character"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "character_translation" DROP CONSTRAINT "FK_6714c574751f5700e1f7cb2fb52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_translation" DROP CONSTRAINT "FK_6a72370f1b4cddc241c52637580"`,
    );
    await queryRunner.query(`DROP TABLE "character_translation"`);
    await queryRunner.query(`DROP TABLE "card_translation"`);
  }
}
