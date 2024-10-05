import { MigrationInterface, QueryRunner } from "typeorm";

export class CREATECARD1728146051905 implements MigrationInterface {
    name = 'CREATECARD1728146051905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "card" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text NOT NULL, "type" character varying(64) NOT NULL, "subtype" character varying(64), "statistic_modifiers" json, "hand_usage" integer, "image_path" text, "locale" character varying(2) NOT NULL, CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "card"`);
    }

}
