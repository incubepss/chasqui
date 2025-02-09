import { Permission } from '@vendure/core';
import { crudCustomSurchargePermission } from '../../customSurcharge/customSurcharge-permission';
import { crudProductorPermission } from './../../productores/productor-permission';

export const tiendaPermissions = [
  Permission.UpdateChannel, // para los customFields de las tiendas
  Permission.CreateCatalog,
  Permission.ReadCatalog,
  Permission.UpdateCatalog,
  Permission.DeleteCatalog,
  Permission.CreateAsset,
  Permission.ReadAsset,
  Permission.UpdateAsset,
  Permission.DeleteAsset,
  Permission.CreateCollection,
  Permission.ReadCollection,
  Permission.UpdateCollection,
  Permission.DeleteCollection,
  Permission.ReadCustomer,
  Permission.CreateFacet,
  Permission.ReadFacet,
  Permission.UpdateFacet,
  Permission.DeleteFacet,
  Permission.CreateOrder,
  Permission.ReadOrder,
  Permission.UpdateOrder,
  Permission.DeleteOrder,
  Permission.CreatePaymentMethod,
  Permission.ReadPaymentMethod,
  Permission.UpdatePaymentMethod,
  Permission.DeletePaymentMethod,
  Permission.CreateProduct,
  Permission.ReadProduct,
  Permission.UpdateProduct,
  Permission.DeleteProduct,
  Permission.CreatePromotion,
  Permission.ReadPromotion,
  Permission.UpdatePromotion,
  Permission.DeletePromotion,
  Permission.CreateShippingMethod,
  Permission.ReadShippingMethod,
  Permission.UpdateShippingMethod,
  Permission.DeleteShippingMethod,
  Permission.CreateTag,
  Permission.ReadTag,
  Permission.UpdateTag,
  Permission.DeleteTag,
  crudCustomSurchargePermission.Create,
  crudCustomSurchargePermission.Read,
  crudCustomSurchargePermission.Update,
  crudCustomSurchargePermission.Delete,
  Permission.CreateProduct,
  Permission.ReadProduct,
  Permission.UpdateProduct,
  Permission.DeleteProduct,
  crudProductorPermission.Create,
  crudProductorPermission.Read,
  crudProductorPermission.Update,
  crudProductorPermission.Delete,
];
