import { MigrationInterface, QueryRunner } from "typeorm";

export class CREATECHARACTER1728421306447 implements MigrationInterface {
    name = 'CREATECHARACTER1728421306447'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "character" ("id" SERIAL NOT NULL, "expansion" character varying(64) NOT NULL, "name" character varying(255) NOT NULL, "description" text NOT NULL, "profession" character varying(64) NOT NULL, "starting_location" character varying(64) NOT NULL, "image_path" text, "sanity" integer NOT NULL, "endurance" integer NOT NULL, "concentration" integer NOT NULL, "statistics" json NOT NULL, "skills" json NOT NULL, "equipment" json NOT NULL, "locale" character varying(2) NOT NULL, CONSTRAINT "PK_6c4aec48c564968be15078b8ae5" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "character"`);
    }

}
