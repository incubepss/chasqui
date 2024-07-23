import { MigrationInterface, QueryRunner } from 'typeorm';

export class limitCRUDClientPermissions1662745262974 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `update role set
        permissions = 'Authenticated,UpdateChannel,CreateCatalog,ReadCatalog,UpdateCatalog,DeleteCatalog,CreateAsset,ReadAsset,UpdateAsset,DeleteAsset,CreateCollection,ReadCollection,UpdateCollection,DeleteCollection,ReadCustomer,CreateFacet,ReadFacet,UpdateFacet,DeleteFacet,CreateOrder,ReadOrder,UpdateOrder,DeleteOrder,CreatePaymentMethod,ReadPaymentMethod,UpdatePaymentMethod,DeletePaymentMethod,CreateProduct,ReadProduct,UpdateProduct,DeleteProduct,CreatePromotion,ReadPromotion,UpdatePromotion,DeletePromotion,CreateShippingMethod,ReadShippingMethod,UpdateShippingMethod,DeleteShippingMethod,CreateTag,ReadTag,UpdateTag,DeleteTag,CreateCustomSurcharge,ReadCustomSurcharge,UpdateCustomSurcharge,DeleteCustomSurcharge,CreateProductor,ReadProductor,UpdateProductor,DeleteProductor'
       where lower(description) like 'admin %' or  lower(description) like '%admin'
       and code <> '__super_admin_role__'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
