import { MigrationInterface, QueryRunner } from 'typeorm';

export class odoo1709645786896 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "channel" ADD "customFieldsOdoohost" character varying(255)`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "channel" ADD "customFieldsOdoodb" character varying(255)`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "channel" ADD "customFieldsOdoouser" character varying(255)`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "channel" ADD "customFieldsOdoopass" character varying(255)`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsOdoocompanyid" integer`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsOdooparams" text`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsOdoohost"`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsOdoodb"`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsOdoouser"`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsOdoopass"`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsOdoocompanyid"`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsOdooparams"`, undefined);
  }
}
