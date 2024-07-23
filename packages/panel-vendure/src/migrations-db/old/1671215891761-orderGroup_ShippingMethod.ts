import { MigrationInterface, QueryRunner } from 'typeorm';

export class orderGroupShippingMethod1671215891761 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "order_group" ADD IF NOT EXISTS "shippingMethodId" integer`,
      undefined,
    );

    await queryRunner.query(
      `update order_group
        SET	"shippingMethodId" = subQuery."shippingMethodId"
        From (select og.id, sl."shippingMethodId" from order_group og inner join shipping_line sl on sl.id = og."shippingLineId") as subQuery
        Where order_group.id = subQuery.id`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE "order_group" ADD CONSTRAINT "FK_eed80578bfccd128250efa176b8" FOREIGN KEY ("shippingMethodId") REFERENCES "shipping_method"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "order_group" DROP CONSTRAINT "FK_eed80578bfccd128250efa176b8"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "order_group" DROP COLUMN "shippingMethodId"`, undefined);
  }
}
