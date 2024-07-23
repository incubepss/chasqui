import { MigrationInterface, QueryRunner } from 'typeorm';

export class orderGroupEnabled1662400900516 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "channel" ADD IF NOT EXISTS "customFieldsOrdergroupenabled" boolean DEFAULT false`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsOrdergroupenabled"`, undefined);
  }
}
