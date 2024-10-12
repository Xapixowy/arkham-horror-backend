import { MigrationInterface, QueryRunner } from "typeorm";

export class UPDATECARD1728762624792 implements MigrationInterface {
    name = 'UPDATECARD1728762624792'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "image_path"`);
        await queryRunner.query(`ALTER TABLE "card" ADD "front_image_path" text`);
        await queryRunner.query(`ALTER TABLE "card" ADD "back_image_path" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "back_image_path"`);
        await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "front_image_path"`);
        await queryRunner.query(`ALTER TABLE "card" ADD "image_path" text`);
    }

}
