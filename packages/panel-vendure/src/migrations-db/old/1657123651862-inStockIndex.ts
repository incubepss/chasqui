import { MigrationInterface, QueryRunner } from 'typeorm';

export class inStockIndex1657123651862 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "search_index_item" ADD IF NOT EXISTS "inStock" boolean NOT NULL DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "search_index_item" ADD IF NOT EXISTS "productInStock" boolean NOT NULL DEFAULT true`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "search_index_item" DROP COLUMN "productInStock"`, undefined);
    await queryRunner.query(`ALTER TABLE "search_index_item" DROP COLUMN "inStock"`, undefined);
  }
}
