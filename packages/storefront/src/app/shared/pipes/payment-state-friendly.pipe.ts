/* eslint-disable @typescript-eslint/naming-convention */
import { Pipe, PipeTransform } from '@angular/core';

const MAP_STATE: { [key: string]: string } = {
  Created: 'Creado',
  Authorized: 'Pago pendiente',
  Settled: 'Pago concretado',
  Shipped: 'Enviado',
  Declined: 'Rechazado',
  Error: 'Error',
  Cancelled: 'Cancelado',
};

export const paymentStateFriendly = (value: string): string => {
  return MAP_STATE[value] || value;
};

@Pipe({
  name: 'paymentStateFriendly',
})
export class PaymentStateFriendlyPipe implements PipeTransform {
  transform(value: string): string {
    return paymentStateFriendly(value);
  }
}
