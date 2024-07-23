/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class expiredwithdate1652756400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE "order" SET "orderPlacedAt" = CURRENT_DATE WHERE "orderPlacedAt" is null and "state" = 'Expired'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
