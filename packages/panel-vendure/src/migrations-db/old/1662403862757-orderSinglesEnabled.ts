import { MigrationInterface, QueryRunner } from 'typeorm';

export class orderSinglesEnabled1662403862757 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "channel" ADD IF NOT EXISTS "customFieldsOrdersinglesenabled" boolean DEFAULT true`,
      undefined,
    );
    await queryRunner.query(`UPDATE "channel" SET "customFieldsOrdersinglesenabled" = true`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsOrdersinglesenabled"`, undefined);
  }
}
