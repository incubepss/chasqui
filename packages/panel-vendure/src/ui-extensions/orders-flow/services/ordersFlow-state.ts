import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { DateRange } from '../components/dates-filter/dates-filter.component';

export type VIRTUAL_STATE =
  | 'MODIFICANDO'
  | 'NUEVOS'
  | 'EN_PREPARACION'
  | 'EN_ENTREGA'
  | 'ENTREGADOS'
  | 'FINALIZADOS'
  | 'ACTIVOS';

export const VIRTUAL_STATES_MAP: Record<VIRTUAL_STATE, string[]> = {
  MODIFICANDO: ['Modifying', 'ArrangingAdditionalPayment'],
  NUEVOS: ['ArrangingPayment', 'PaymentAuthorized', 'PaymentSettled'],
  EN_PREPARACION: ['WithFulfill'],
  EN_ENTREGA: ['PartiallyShipped', 'Shipped'],
  ENTREGADOS: ['PartiallyDelivered', 'Delivered'],
  FINALIZADOS: ['Cancelled', 'Expired'],
  ACTIVOS: ['AddingItems'],
};

export const GROUP_STATE_MAP: Record<VIRTUAL_STATE, string[]> = {
  MODIFICANDO: [''],
  NUEVOS: ['ConfirmedByOwner'],
  EN_PREPARACION: ['AcceptedByChannel'],
  EN_ENTREGA: ['Shipped'],
  ENTREGADOS: ['Delivered'],
  FINALIZADOS: ['Cancelled', 'Closed'],
  ACTIVOS: ['AddingOrders'],
};

@Injectable({
  providedIn: 'any',
})
export class OrdersFlowState {
  public filterKeyString = '';
  public currentVirtualState: VIRTUAL_STATE = 'NUEVOS';
  public get currentStatuses() {
    return VIRTUAL_STATES_MAP[this.currentVirtualState];
  }

  public get currentGroupStatuses() {
    return GROUP_STATE_MAP[this.currentVirtualState];
  }

  public take: number | undefined = undefined;

  // puede ser order o ordergroup
  public selectedItemCode: string;

  public dateRange: DateRange;
  public dateFilterState: {
    mode: 'simple' | 'custom';
    label: string;
  } = { mode: 'simple', label: 'Fecha' };

  public printMode = new BehaviorSubject<boolean>(false);
}
