import { map } from 'rxjs/operators';
import { gql } from 'apollo-angular';
import { NgModule } from '@angular/core';
import { SharedModule, addActionBarItem, OnClickContext } from '@vendure/admin-ui/core';
import { Customer, Address } from '@vendure/common/lib/generated-types';

const _searchCustomers = async (ctx: OnClickContext) => {
  return ctx.dataService
    .query<any, any>(
      gql`
        query GetCustomerList($options: CustomerListOptions) {
          customers(options: $options) {
            items {
              id
              createdAt
              firstName
              lastName
              emailAddress
              phoneNumber
              addresses {
                streetLine1
                city
                province
                postalCode
                defaultShippingAddress
              }
              orders {
                totalItems
              }
              user {
                id
                verified
                lastLogin
              }
            }
          }
        }
      `,
      {
        options: {
          sort: {
            id: 'ASC',
          },
        },
      },
    )
    .single$.pipe(map(result => result.customers?.items || []))
    .toPromise();
};

const _getHeaderColumn = (): string[] => {
  return [
    'Nombre',
    'Apellido',
    'Email',
    'Teléfono',
    'Email fué Verificado',
    'Cantidad de pedidos',
    'Fecha creación',
    'Última entrada',
    'Dirección principal',
    'Ciudad',
    'Provincia',
    'Código postal',
  ];
};

const _getDefaultAddress = (customer: Customer): Address | undefined => {
  return customer.addresses?.find(a => a.defaultShippingAddress);
};

const _to2DPlainArray = (records: Array<Customer>): string[][] => {
  return records.reduce((tmp, customer) => {
    const address = _getDefaultAddress(customer);

    tmp.push([
      customer?.firstName || '',
      customer?.lastName || '',
      customer?.emailAddress || '',
      customer?.phoneNumber || '',
      customer?.user?.verified ? 'si' : '',
      customer?.orders?.totalItems || '0',
      customer?.createdAt || '',
      customer?.user?.lastLogin || '',
      address?.streetLine1 || '',
      address?.city || '',
      address?.province || '',
      address?.postalCode || '',
    ]);
    return tmp;
  }, [] as string[][]);
};

const _prepareToClipbard = async (customers: Array<Customer>) => {
  const rows = _to2DPlainArray(customers);
  rows.unshift(_getHeaderColumn());
  const rowsTxt = rows.map(lines => lines.join('\t')).join('\n');

  return navigator.clipboard.writeText(rowsTxt);
};

const doExportToClipbard = async (e: MouseEvent, ctx: OnClickContext) => {
  if (!navigator.clipboard) {
    ctx.notificationService.error('El portapapeles no está disponible');
    return;
  }

  const target = e.currentTarget as HTMLElement;
  const innerOriginal = target.innerHTML;
  target.innerHTML = '<span class="spinner spinner-inline"></span>';

  try {
    const customers = await _searchCustomers(ctx);
    await _prepareToClipbard(customers);
    ctx.notificationService.success('Consumidores copiados');
  } catch (e) {
    ctx.notificationService.error('No se pudo copiar los consumidores');
  } finally {
    target.innerHTML = innerOriginal;
  }
};

@NgModule({
  imports: [SharedModule],
  declarations: [],
  providers: [
    addActionBarItem({
      id: 'copy-customers',
      label: 'Copiar al portapapeles',
      locationId: 'customer-list',
      buttonStyle: 'outline',
      icon: 'clipboard',
      onClick: doExportToClipbard,
    }),
  ],
  exports: [],
})
export class CustomersExportUiExtensionModule {}
