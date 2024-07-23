import { Resolver, ResolveField, Parent } from '@nestjs/graphql';

import {
  Ctx,
  RequestContext,
  Payment,
  PaymentMethodService,
  PaymentMethod,
  Api,
  ApiType,
  PaymentMetadata,
} from '@vendure/core';
import { pick } from '@vendure/common/lib/pick';

@Resolver('Payment')
export class PaymentResolver {
  constructor(private paymentMethodService: PaymentMethodService) {}

  @ResolveField()
  async paymentMethod(@Ctx() ctx: RequestContext, @Parent() payment: Payment): Promise<PaymentMethod | null> {
    if (!payment) {
      return null;
    }
    const code = payment.method;
    const result = await this.paymentMethodService.getMethodAndOperations(ctx, code);
    return result?.paymentMethod;
  }

  @ResolveField()
  metadata(@Api() apiType: ApiType, @Parent() payment: Payment): PaymentMetadata {
    /** 
      sobreescribe el comportamiento de vendure, expone también el campo comments
      para que coordinadora de grupo pueda ver comentarios de pedidos participantes
      (ref: story #138 zentao)
    */
    return apiType === 'admin' ? payment.metadata : pick(payment.metadata, ['public', 'comments']);
  }
}
