import { MigrationInterface, QueryRunner } from 'typeorm';

export class incentivoField1663352182843 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "product_variant" ADD IF NOT EXISTS "customFieldsIncentivo" integer DEFAULT '0'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "product_variant" DROP COLUMN "customFieldsIncentivo"`, undefined);
  }
}
