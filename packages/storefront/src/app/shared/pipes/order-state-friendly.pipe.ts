/* eslint-disable @typescript-eslint/naming-convention */
import { Pipe, PipeTransform } from '@angular/core';

export type OrderState =
  | 'Created'
  | 'AddingItems'
  | 'ArrangingPayment'
  | 'PaymentAuthorized'
  | 'PaymentSettled'
  | 'WithFulfill'
  | 'Asignado'
  | 'PartiallyShipped'
  | 'Shipped'
  | 'PartiallyDelivered'
  | 'Delivered'
  | 'Modifying'
  | 'ArrangingAdditionalPayment'
  | 'Cancelled'
  | 'Expired';

export type OrderGroupState =
  | 'AddingOrders'
  | 'ConfirmedByOwner'
  | 'AcceptedByChannel'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Closed';

type States = OrderState | OrderGroupState;

const MAP_STATE_ORDER: { [key in States]: string } = {
  // ORDERS
  Created: 'Creado',
  AddingItems: 'Agregando productos',
  ArrangingPayment: 'En proceso de finalización',
  PaymentAuthorized: 'En preparación',
  PaymentSettled: 'En preparación',
  WithFulfill: 'En preparación',
  Asignado: 'En preparación',
  Shipped: 'En camino',
  PartiallyShipped: 'En camino parcial',
  Delivered: 'Entregado',
  PartiallyDelivered: 'Entregado parcial',
  Cancelled: 'Cancelado',
  Expired: 'Vencido',
  Modifying: 'En gestión',
  ArrangingAdditionalPayment: 'En gestión de pagos adicionales',

  // ORDER GROUPS
  AddingOrders: 'Abierto',
  ConfirmedByOwner: 'Confirmado',
  AcceptedByChannel: 'En preparación',
  Closed: 'Cerrado',
};

const MAP_STATE_ORDERGROUP: { [key in States]: string } = {
  // ORDERS
  Created: 'Creado',
  AddingItems: 'Agregando productos',
  ArrangingPayment: 'En proceso de finalización',
  PaymentAuthorized: 'Confirmado',
  PaymentSettled: 'Confirmado',
  WithFulfill: 'En preparación',
  Asignado: 'En preparación',
  Shipped: 'En camino',
  PartiallyShipped: 'En camino parcial',
  Delivered: 'Entregado',
  PartiallyDelivered: 'Entregado parcial',
  Cancelled: 'Cancelado',
  Expired: 'Vencido',
  Modifying: 'En gestión',
  ArrangingAdditionalPayment: 'En gestión de pagos adicionales',

  // ORDER GROUPS
  AddingOrders: 'Abierto',
  ConfirmedByOwner: 'Confirmado',
  AcceptedByChannel: 'En preparación',
  Closed: 'Cerrado',
};

export const orderStateFriendly = (
  value: OrderState,
  mode: 'order' | 'orderGroup',
  stateGroup: OrderGroupState,
): string => {
  // TECHDEB: refactor con nuevo estado de orders en back de "waitingToGroup"
  // ver story #72 en zentao
  if (stateGroup === 'AddingOrders' && (value === 'PaymentAuthorized' || value === 'PaymentSettled')) {
    return mode === 'orderGroup' ? 'Confirmado' : 'espera del grupo';
  }

  const MAP = mode === 'order' ? MAP_STATE_ORDER : MAP_STATE_ORDERGROUP;
  return MAP[value] || value;
};

@Pipe({
  name: 'orderStateFriendly',
})
export class OrderStateFriendlyPipe implements PipeTransform {
  transform(value: OrderState, mode: 'order' | 'orderGroup' = 'order', stateGroup: OrderGroupState): string {
    return orderStateFriendly(value, mode, stateGroup);
  }
}
