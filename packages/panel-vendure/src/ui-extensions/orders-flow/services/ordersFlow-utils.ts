/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ShippingMethod } from '@vendure/core';
import { Order, OrderGroup } from '../generated-types';

import { GROUP_STATE_MAP, VIRTUAL_STATE, VIRTUAL_STATES_MAP } from './ordersFlow-state';

export type CounterByVirtualState = Record<VIRTUAL_STATE, { count: number; sumAmount: number }>;

export const newCounterVirtual = (): CounterByVirtualState => {
  return {
    MODIFICANDO: { count: 0, sumAmount: 0 },
    NUEVOS: { count: 0, sumAmount: 0 },
    EN_PREPARACION: { count: 0, sumAmount: 0 },
    EN_ENTREGA: { count: 0, sumAmount: 0 },
    ENTREGADOS: { count: 0, sumAmount: 0 },
    FINALIZADOS: { count: 0, sumAmount: 0 },
    ACTIVOS: { count: 0, sumAmount: 0 },
  };
};

export const joinSumCounters = (
  counter1: CounterByVirtualState,
  counter2: CounterByVirtualState,
): CounterByVirtualState => {
  const result = newCounterVirtual();

  const keys = Object.keys(result);

  keys.forEach(key => {
    result[key].count = counter1[key].count + counter2[key].count;
    result[key].sumAmount = counter1[key].sumAmount + counter2[key].sumAmount;
  });

  return result;
};

export const orderStateToVirtualState = (state: string): VIRTUAL_STATE | undefined => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const virtualStates: VIRTUAL_STATE[] = Object.keys(VIRTUAL_STATES_MAP);
  return virtualStates.find(vState => VIRTUAL_STATES_MAP[vState].indexOf(state) > -1);
};

export const orderGroupStateToVirtualState = (state: string): VIRTUAL_STATE | undefined => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const virtualStates: GROUP_STATE_MAP[] = Object.keys(GROUP_STATE_MAP);
  return virtualStates.find(vState => GROUP_STATE_MAP[vState].indexOf(state) > -1);
};

export const getTypeDelivery = (order: Order | OrderGroup): string => {
  // @ts-ignore
  let typeDelivery: string = getShippingMethod(order)?.customFields?.typeDelivery || '';

  if (typeDelivery === 'shipping') {
    typeDelivery = 'Envio a domicilio';
  } else if (typeDelivery === 'showroom') {
    typeDelivery = 'Punto de entrega';
  }

  return typeDelivery;
};

export const getShippingMethodName = (order: Order | OrderGroup): string => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return getShippingMethod(order)?.name || '';
};

export const getAddressDelivery = (order: Order | OrderGroup): string => {
  const addressPart = [order?.shippingAddress?.streetLine1, order?.shippingAddress?.city];
  let addressStr = addressPart.join(', ');
  // @ts-ignore
  const typeDelivery: string = getShippingMethod(order)?.customFields?.typeDelivery || '';

  if (typeDelivery === 'showroom') {
    // @ts-ignore
    addressStr = getShippingMethod(order)?.customFields?.address_or_places || '';
  }

  return addressStr;
};

const getShippingMethod = (order: Order | OrderGroup): ShippingMethod | undefined => {
  // @ts-ignore
  return order?.shippingLines?.[0]?.shippingMethod || order?.shippingMethod;
};

export default {
  getTypeDelivery,
  getShippingMethodName,
  getAddressDelivery,
};
