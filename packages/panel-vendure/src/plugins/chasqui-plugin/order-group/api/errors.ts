import { ErrorResult, Order } from '@vendure/core';
import { CancelOrderResult } from '@vendure/common/lib/generated-types';

export class DisabledOrderGroupsError extends ErrorResult {
  readonly __typename = 'DisabledOrderGroupsError';
  readonly errorCode = 'DISABLED_ORDERGROUPS_ERROR' as any;
  readonly message = 'DISABLED_ORDERGROUPS_ERROR';
  constructor() {
    super();
  }
}

export class CancelOrderGroupsError extends ErrorResult {
  readonly __typename = 'CancelOrderGroupsError';
  readonly errorCode = 'CANCEL_ORDERGROUPS_ERROR' as any;
  readonly message = 'CANCEL_ORDERGROUPS_ERROR';
  constructor() {
    super();
  }
}
export class CancelOrderOfGroupError extends ErrorResult {
  readonly __typename = 'CancelOrderOfGroupError';
  readonly errorCode = 'CANCEL_ORDER_OF_ORDERGROUPS_ERROR' as any;
  parentErrorCode = '';
  message = 'CANCEL_ORDERGROUPS_ERROR';

  constructor(message?: string, errorCode?: string) {
    super();
    if (message) {
      this.message = message;
    }
    if (errorCode && errorCode !== this.errorCode) {
      this.parentErrorCode = errorCode;
    }
  }
}

export type CancelOrderOfOrderGroupResult = Order | CancelOrderResult | CancelOrderOfGroupError;
