import { MigrationInterface, QueryRunner } from 'typeorm';

export class flagIsAMember1660047249187 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "customFieldsIsagroupmember" boolean DEFAULT false`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "customFieldsIsagroupmember"`, undefined);
  }
}
