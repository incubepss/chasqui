import { Input, Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {
  OrderListOptions,
  StateI18nTokenPipe,
  DataService,
  NotificationService,
  ModalService,
} from '@vendure/admin-ui/core';
import { TranslatePipe } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

import { FIND_ORDERS_TO_EXPORT, OrderListFragment } from './button-export.graphql';

@Component({
  selector: 'chq-button-export',
  templateUrl: './button-export.component.html',
  styleUrls: ['./button-export.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonExportComponent {
  @Input() orderListOptions: OrderListOptions;

  loading = false;

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private modalService: ModalService,
    private changeDetector: ChangeDetectorRef,
    private translatePipe: TranslatePipe,
    private stateI18NTokenPipe: StateI18nTokenPipe,
  ) {}

  get records$() {
    return this.dataService
      .query(FIND_ORDERS_TO_EXPORT, {
        options: this.orderListOptions,
      })
      .mapStream((result: any) => {
        return result.orders.items;
      });
  }

  async toClipboard() {
    this.loading = true;
    this.changeDetector.markForCheck();
    const records = await this.records$.pipe(take(1)).toPromise();
    const rows = this.to2DPlainArray(records);
    this.sort2DPlainArray(rows, 7); // sort by metodo de envio
    rows.unshift(this.getHeaderColumn());
    const rowsTxt = rows.map(lines => lines.join('\t')).join('\n');
    this.copyTextToClipboard(rowsTxt);
    this.loading = false;
    this.changeDetector.markForCheck();
  }

  getTypeDelivery(order: any): string {
    let typeDelivery: string = order?.shippingLines?.[0]?.shippingMethod.customFields?.typeDelivery || '';

    if (typeDelivery === 'shipping') {
      typeDelivery = 'Envio a domicilio';
    } else if (typeDelivery === 'showroom') {
      typeDelivery = 'Punto de entrega';
    }

    return typeDelivery;
  }

  getShippingMethod(order): string {
    return order?.shippingLines?.[0]?.shippingMethod?.name || '';
  }

  getAddressDelivery(order: any): string {
    let addressStr = order?.shippingAddress?.streetLine1 || '';
    const typeDelivery: string = order?.shippingLines?.[0]?.shippingMethod.customFields?.typeDelivery || '';

    if (typeDelivery === 'showroom') {
      addressStr = order.shippingLines?.[0].shippingMethod.customFields?.address_or_places;
    }

    return addressStr;
  }

  getComment(order: any): string {
    return order?.payments?.[0]?.metadata?.comments || '';
  }

  getAdicionales(order: any): string {
    const adicionales =
      order?.surcharges
        ?.filter(s => s.priceWithTax > 0)
        .map((s: any) => {
          return `${s.description}: $ ${s.priceWithTax / 100}`;
        }) || [];

    return adicionales.join(', ');
  }

  getAditionalsPaymentState(order: any): string {
    const payments =
      order?.payments?.slice(1)?.map((p: any) => {
        const stateStr = this.translatePipe.transform(this.stateI18NTokenPipe.transform(p.state));
        return `${stateStr} ${p.method} ${p.errorMessage || ''}`;
      }) || [];

    return payments.join(', ');
  }

  getQuantityDescription(order: any): string {
    const countArt = order?.lines?.length || 0;
    const countUni = order?.totalQuantity;

    const part: string[] = [];
    if (countArt === 1) {
      part.push('1 artículo');
    } else {
      part.push(`${countArt} artículos`);
    }

    if (countUni === 1) {
      part.push('1 unidad');
    } else {
      part.push(`${countUni} unidades`);
    }

    return part.join(' / ');
  }

  hasAllPayment(order: any): boolean {
    const sumSettled = order.payments?.reduce((tmp, current) => {
      if (current.state === 'Settled') {
        return tmp + current.amount;
      }
      return tmp;
    }, 0);
    return sumSettled >= order.totalWithTax;
  }

  to2DPlainArray(records: Array<OrderListFragment>): string[][] {
    return records.reduce((tmp, order) => {
      let typeDelivery: string = order.shippingLines?.[0].shippingMethod.customFields?.typeDelivery || '';
      const methodDelivery = order.shippingLines?.[0].shippingMethod.name || '';

      let direccionEnvio = order.shippingAddress?.streetLine1 + ', ' + order.shippingAddress?.city || '';
      let cpEnvio = order.shippingAddress?.postalCode || '';

      if (typeDelivery === 'shipping') {
        typeDelivery = 'Envio';
      } else if (typeDelivery === 'showroom') {
        typeDelivery = 'Punto de entrega';
        direccionEnvio = order.shippingLines?.[0].shippingMethod.customFields?.address_or_places;
        cpEnvio = '';
      }

      tmp.push([
        order.code,
        order.customer?.firstName || '',
        order.customer?.lastName || '',
        order.customer?.emailAddress || '',
        order.customer?.phoneNumber || '',
        order.shippingAddress?.phoneNumber || '',
        typeDelivery,
        methodDelivery,
        direccionEnvio,
        cpEnvio,
        this.getComment(order),
        this.getAdicionales(order),
        order.totalQuantity.toString(),
        (order.totalWithTax / 100).toString(),
        this.translatePipe.transform(this.stateI18NTokenPipe.transform(order.state)),
        this.translatePipe.transform(this.stateI18NTokenPipe.transform(order.payments?.[0]?.state)),
        order.payments?.[0]?.method,
        this.getAditionalsPaymentState(order),
      ]);
      return tmp;
    }, [] as string[][]);
  }

  getHeaderColumn(): string[] {
    return [
      'Nro Pedido',
      'Nombre',
      'Apellido',
      'Email',
      'Teléfono consumidor',
      'Teléfono envio',
      'Tipo envio*',
      'Método de envio*',
      'Dirección',
      'CP',
      'Comentario*',
      'Adicionales*',
      'Cantidad unidades',
      'Total',
      'Estado del pedido',
      'Estado del pago',
      'Método de pago',
      'Pagos adicionales',
    ];
  }

  sort2DPlainArray(rows: string[][], byNumCol: number): void {
    rows.sort((a: string[], b: string[]) => {
      if (a[byNumCol] < b[byNumCol]) {
        return -1;
      } else if (a[byNumCol] > b[byNumCol]) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  private copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      this.notificationService.error('El portapapeles no está disponible');
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => {
        this.notificationService.success('Registros copiados en el portapapeles');
      },
      () => {
        this.notificationService.error('No se pudo copiar los registros');
      },
    );
  }
}
