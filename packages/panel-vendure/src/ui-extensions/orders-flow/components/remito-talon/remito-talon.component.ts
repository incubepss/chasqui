import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Order } from '@vendure/core';
import { getServerLocation } from '@vendure/admin-ui/core';

@Component({
  selector: 'chq-remito-talon',
  templateUrl: './remito-talon.component.html',
  styleUrls: ['./remito-talon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemitoTalonComponent {
  @Input() order: Order;

  get urlToConfirmDelivery(): string {
    if (!this.order?.code) {
      return '';
    }
    const base = getServerLocation();
    return `${base}/panel/orders/${this.order.id}`;
  }

  get typeDelivery(): string {
    const shippingMethod = this.order?.shippingLines?.[0]?.shippingMethod;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let typeDelivery: string = shippingMethod?.customFields?.typeDelivery || '';

    if (typeDelivery === 'shipping') {
      typeDelivery = 'Envio a domicilio';
    } else if (typeDelivery === 'showroom') {
      typeDelivery = 'Punto de entrega';
    }

    return typeDelivery;
  }
}
