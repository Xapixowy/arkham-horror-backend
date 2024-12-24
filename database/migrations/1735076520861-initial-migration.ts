import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1735076520861 implements MigrationInterface {
    name = 'InitialMigration1735076520861'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."character_translation_locale_enum" AS ENUM('en', 'pl')`);
        await queryRunner.query(`CREATE TABLE "character_translation" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text NOT NULL, "profession" character varying(64) NOT NULL, "starting_location" character varying(64) NOT NULL, "skills" json NOT NULL, "locale" "public"."character_translation_locale_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "character_id" integer, CONSTRAINT "PK_582e757a31a731a1e04865a4d8c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."card_translation_locale_enum" AS ENUM('en', 'pl')`);
        await queryRunner.query(`CREATE TABLE "card_translation" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text NOT NULL, "locale" "public"."card_translation_locale_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "card_id" integer, CONSTRAINT "PK_515a00b8778e5d33f642c7b3da8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "player_card" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "player_id" integer, "card_id" integer, CONSTRAINT "PK_8b57e74eab8264efdff95dcf213" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."card_type_enum" AS ENUM('location', 'madness', 'wound', 'honorarium', 'blessing', 'curse', 'ally', 'ability', 'common_item', 'unique_item', 'spell')`);
        await queryRunner.query(`CREATE TYPE "public"."card_subtype_enum" AS ENUM('physical_weapon', 'magical_weapon', 'quest', 'task', 'book')`);
        await queryRunner.query(`CREATE TYPE "public"."card_locale_enum" AS ENUM('en', 'pl')`);
        await queryRunner.query(`CREATE TABLE "card" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text NOT NULL, "type" "public"."card_type_enum" NOT NULL, "subtype" "public"."card_subtype_enum", "attribute_modifiers" json, "hand_usage" integer, "front_image_path" text, "back_image_path" text, "locale" "public"."card_locale_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "character_card" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "character_id" integer, "card_id" integer, CONSTRAINT "PK_abf505e63ae02cafd794c685e1c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."character_expansion_enum" AS ENUM('base', 'dunwich_horror')`);
        await queryRunner.query(`CREATE TYPE "public"."character_locale_enum" AS ENUM('en', 'pl')`);
        await queryRunner.query(`CREATE TABLE "character" ("id" SERIAL NOT NULL, "expansion" "public"."character_expansion_enum" NOT NULL, "name" character varying(255) NOT NULL, "description" text NOT NULL, "profession" character varying(64) NOT NULL, "starting_location" character varying(64) NOT NULL, "image_path" text, "sanity" integer NOT NULL, "endurance" integer NOT NULL, "concentration" integer NOT NULL, "attributes" json NOT NULL, "skills" json NOT NULL, "equipment" json NOT NULL, "locale" "public"."character_locale_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6c4aec48c564968be15078b8ae5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."game_session_phase_enum" AS ENUM('1', '2', '3', '4', '5')`);
        await queryRunner.query(`CREATE TABLE "game_session" ("id" SERIAL NOT NULL, "token" character varying(64) NOT NULL, "phase" "public"."game_session_phase_enum" NOT NULL DEFAULT '5', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_58b630233711ccafbb0b2a904fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."player_role_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TABLE "player" ("id" SERIAL NOT NULL, "token" uuid NOT NULL, "role" "public"."player_role_enum" NOT NULL DEFAULT '0', "status" json NOT NULL, "equipment" json NOT NULL, "attributes" json NOT NULL, "statistics" json NOT NULL DEFAULT '{"money_acquired":0,"money_lost":0,"clues_acquired":0,"clues_lost":0,"endurance_acquired":0,"endurance_lost":0,"sanity_acquired":0,"sanity_lost":0,"cards_acquired":0,"cards_lost":0,"phases_played":0,"characters_played":0}', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" integer, "character_id" integer, "game_session_id" integer, CONSTRAINT "UQ_6b6843d7c636cdae511eca06b86" UNIQUE ("token"), CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" text NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT '0', "reset_token" character varying(64), "verification_token" character varying(64), "verified_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "character_translation" ADD CONSTRAINT "FK_28eee4730f7138d7ab0a4da8f7c" FOREIGN KEY ("character_id") REFERENCES "character"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "card_translation" ADD CONSTRAINT "FK_13cd196d3c2588ddc6f6c49ef60" FOREIGN KEY ("card_id") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player_card" ADD CONSTRAINT "FK_c0418c111ab36c1f1011ec47beb" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player_card" ADD CONSTRAINT "FK_1a0ef290511767cbdff4e0ce2f2" FOREIGN KEY ("card_id") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "character_card" ADD CONSTRAINT "FK_18ecfa0e9e0ee620f797b5b82a2" FOREIGN KEY ("character_id") REFERENCES "character"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "character_card" ADD CONSTRAINT "FK_e92b97b72602da1b548eafd9596" FOREIGN KEY ("card_id") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_d04e64fc9b7fd372000c0dfda3f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_accf8835da0343fb78b5a70b9e4" FOREIGN KEY ("character_id") REFERENCES "character"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_87f69832c47a2589bfa47d9393b" FOREIGN KEY ("game_session_id") REFERENCES "game_session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_87f69832c47a2589bfa47d9393b"`);
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_accf8835da0343fb78b5a70b9e4"`);
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_d04e64fc9b7fd372000c0dfda3f"`);
        await queryRunner.query(`ALTER TABLE "character_card" DROP CONSTRAINT "FK_e92b97b72602da1b548eafd9596"`);
        await queryRunner.query(`ALTER TABLE "character_card" DROP CONSTRAINT "FK_18ecfa0e9e0ee620f797b5b82a2"`);
        await queryRunner.query(`ALTER TABLE "player_card" DROP CONSTRAINT "FK_1a0ef290511767cbdff4e0ce2f2"`);
        await queryRunner.query(`ALTER TABLE "player_card" DROP CONSTRAINT "FK_c0418c111ab36c1f1011ec47beb"`);
        await queryRunner.query(`ALTER TABLE "card_translation" DROP CONSTRAINT "FK_13cd196d3c2588ddc6f6c49ef60"`);
        await queryRunner.query(`ALTER TABLE "character_translation" DROP CONSTRAINT "FK_28eee4730f7138d7ab0a4da8f7c"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "player"`);
        await queryRunner.query(`DROP TYPE "public"."player_role_enum"`);
        await queryRunner.query(`DROP TABLE "game_session"`);
        await queryRunner.query(`DROP TYPE "public"."game_session_phase_enum"`);
        await queryRunner.query(`DROP TABLE "character"`);
        await queryRunner.query(`DROP TYPE "public"."character_locale_enum"`);
        await queryRunner.query(`DROP TYPE "public"."character_expansion_enum"`);
        await queryRunner.query(`DROP TABLE "character_card"`);
        await queryRunner.query(`DROP TABLE "card"`);
        await queryRunner.query(`DROP TYPE "public"."card_locale_enum"`);
        await queryRunner.query(`DROP TYPE "public"."card_subtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."card_type_enum"`);
        await queryRunner.query(`DROP TABLE "player_card"`);
        await queryRunner.query(`DROP TABLE "card_translation"`);
        await queryRunner.query(`DROP TYPE "public"."card_translation_locale_enum"`);
        await queryRunner.query(`DROP TABLE "character_translation"`);
        await queryRunner.query(`DROP TYPE "public"."character_translation_locale_enum"`);
    }

}
