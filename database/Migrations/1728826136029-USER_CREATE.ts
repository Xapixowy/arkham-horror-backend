import { MigrationInterface, QueryRunner } from "typeorm";

export class USERCREATE1728826136029 implements MigrationInterface {
    name = 'USERCREATE1728826136029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" text NOT NULL, "role" integer NOT NULL, "reset_token" character varying(64), "verification_token" character varying(64), "verified_at" TIMESTAMP, "created_at" TIMESTAMP, "updated_at" TIMESTAMP, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
