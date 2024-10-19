import { MigrationInterface, QueryRunner } from 'typeorm';

export class DELETECASCADEONCARDANDCHARACTERTRANSlATIONS1729352077378
  implements MigrationInterface
{
  name = 'DELETECASCADEONCARDANDCHARACTERTRANSlATIONS1729352077378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "character_translation" DROP CONSTRAINT "FK_6714c574751f5700e1f7cb2fb52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_translation" DROP CONSTRAINT "FK_6a72370f1b4cddc241c52637580"`,
    );
    await queryRunner.query(
      `ALTER TABLE "character_translation" ADD CONSTRAINT "FK_28eee4730f7138d7ab0a4da8f7c" FOREIGN KEY ("character_id") REFERENCES "character"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_translation" ADD CONSTRAINT "FK_13cd196d3c2588ddc6f6c49ef60" FOREIGN KEY ("card_id") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_translation" DROP CONSTRAINT "FK_13cd196d3c2588ddc6f6c49ef60"`,
    );
    await queryRunner.query(
      `ALTER TABLE "character_translation" DROP CONSTRAINT "FK_28eee4730f7138d7ab0a4da8f7c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_translation" ADD CONSTRAINT "FK_6a72370f1b4cddc241c52637580" FOREIGN KEY ("card_id") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "character_translation" ADD CONSTRAINT "FK_6714c574751f5700e1f7cb2fb52" FOREIGN KEY ("character_id") REFERENCES "character"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
