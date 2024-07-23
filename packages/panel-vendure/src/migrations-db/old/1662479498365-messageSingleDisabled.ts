import { MigrationInterface, QueryRunner } from 'typeorm';

export class messageSingleDisabled1662479498365 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "channel" ADD IF NOT EXISTS "customFieldsMessageordersinglesdisabled" character varying(255) DEFAULT 'Para poder comprar, comunícate con la tienda.'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsOrdersinglesenabled"`, undefined);
  }
}
