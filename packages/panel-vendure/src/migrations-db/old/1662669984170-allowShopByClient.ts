import { MigrationInterface, QueryRunner } from 'typeorm';

export class allowShopByClient1662669984170 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD IF NOT EXISTS "customFieldsCodecustomer" character varying(255)`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD CONSTRAINT "UQ_fb102ce3b198585c907dfc35827" UNIQUE ("customFieldsCodecustomer")`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD IF NOT EXISTS "customFieldsOrdersinglesenabled" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD IF NOT EXISTS "customFieldsOrdergroupenabled" boolean DEFAULT false`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "customFieldsOrdergroupenabled"`, undefined);
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN "customFieldsOrdersinglesenabled"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" DROP CONSTRAINT "UQ_fb102ce3b198585c907dfc35827"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "customFieldsCodecustomer"`, undefined);
  }
}
