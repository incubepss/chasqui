import { MigrationInterface, QueryRunner } from 'typeorm';

export class channelFromAddress1657810320877 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "channel" ADD IF NOT EXISTS "customFieldsFromaddress" character varying(255)`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsFromaddress"`, undefined);
  }
}
