import { MigrationInterface, QueryRunner } from 'typeorm';

export class grupos1661800377324 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "order_group" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "alias" character varying(50) NOT NULL DEFAULT '', "code" character varying(30) NOT NULL, "state" character varying(20) NOT NULL, "orderPlacedAt" TIMESTAMP, "active" boolean NOT NULL DEFAULT true, "shippingAddress" text, "billingAddress" text, "id" SERIAL NOT NULL, "customerId" integer, "channelId" integer, "shippingLineId" integer, CONSTRAINT "UQ_11c530da3d5b7003b9f4b76371e" UNIQUE ("code"), CONSTRAINT "REL_bdc2e98c68c66c4fdd217105ca" UNIQUE ("shippingLineId"), CONSTRAINT "PK_f35c5aef0f513f39b3b831e91a2" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "order" ADD IF NOT EXISTS "orderGroupId" integer`, undefined);
    await queryRunner.query(
      `ALTER TABLE "order" ADD IF NOT EXISTS "customFieldsIsorderheadofgroup" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD IF NOT EXISTS "customFieldsIsagroupmember" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_75dce5594c5d2ae1e44f8b094f3" FOREIGN KEY ("orderGroupId") REFERENCES "order_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "order_group" ADD CONSTRAINT "FK_5f49ffcccfe3300783a82c28737" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "order_group" ADD CONSTRAINT "FK_f1d7926db937aa5045c3f610aad" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "order_group" ADD CONSTRAINT "FK_bdc2e98c68c66c4fdd217105ca1" FOREIGN KEY ("shippingLineId") REFERENCES "shipping_line"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "order_group" DROP CONSTRAINT "FK_bdc2e98c68c66c4fdd217105ca1"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "order_group" DROP CONSTRAINT "FK_f1d7926db937aa5045c3f610aad"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "order_group" DROP CONSTRAINT "FK_5f49ffcccfe3300783a82c28737"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_75dce5594c5d2ae1e44f8b094f3"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "customFieldsIsagroupmember"`, undefined);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "customFieldsIsorderheadofgroup"`, undefined);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "orderGroupId"`, undefined);
    await queryRunner.query(`DROP TABLE "order_group"`, undefined);
  }
}
