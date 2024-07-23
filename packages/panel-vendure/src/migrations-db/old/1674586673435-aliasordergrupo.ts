import { MigrationInterface, QueryRunner } from 'typeorm';

export class aliasordergrupo1674586673435 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "order" ADD "customFieldsAlias" character varying(255) DEFAULT ''`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "customFieldsAlias"`, undefined);
  }
}
