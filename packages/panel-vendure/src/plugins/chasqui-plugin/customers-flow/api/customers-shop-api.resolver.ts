import { Request, Response } from 'express';
import { Mutation, Resolver, Args, Context } from '@nestjs/graphql';
import {
  ActiveOrderService,
  AdministratorService,
  Allow,
  AuthService,
  ConfigService,
  Ctx,
  CustomerService,
  isGraphQlErrorResult,
  Logger,
  NATIVE_AUTH_STRATEGY_NAME,
  OrderService,
  Permission,
  RequestContext,
  Transaction,
  User,
  UserService,
} from '@vendure/core';
import { BaseAuthResolver } from '@vendure/core/dist/api/resolvers/base/base-auth.resolver';
import {
  MutationRequestPasswordResetArgs,
  RequestPasswordResetResult,
  MutationResetPasswordArgs,
  ResetPasswordResult,
} from '@vendure/common/lib/generated-shop-types';

import { CustomUserService } from './../service/custom-user.service';

@Resolver()
export class CustomersShopApiResolver extends BaseAuthResolver {
  constructor(
    authService: AuthService,
    userService: UserService,
    administratorService: AdministratorService,
    configService: ConfigService,
    private customerService: CustomerService,
    private customUserService: CustomUserService,
    private activeOrderService: ActiveOrderService,
    private orderService: OrderService,
  ) {
    super(authService, userService, administratorService, configService);
  }

  @Transaction()
  @Mutation()
  @Allow(Permission.Public)
  async requestPasswordReset(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationRequestPasswordResetArgs,
  ): Promise<RequestPasswordResetResult> {
    try {
      const user = await this.userService.getUserByEmailAddress(ctx, args.emailAddress);
      if (!user) {
        return { success: false };
      }
      await this.customerService.requestPasswordReset(ctx, args.emailAddress);

      // si hay un pedido activo, asocia el pedido al customer del user
      const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx);
      if (sessionOrder) {
        try {
          const customer = await this.customerService.findOneByUserId(ctx, user.id);
          if (customer) {
            await this.orderService.addCustomerToOrder(ctx, sessionOrder.id, customer);
          } else {
            Logger.warn(
              `On requestPasswordReset, cannot be added the customer to the activeOrder. The customer for ${user?.id} notfound`,
              'CustomersFlowPlugin',
            );
          }
        } catch (e) {
          Logger.error(
            'On requestPasswordReset, cannot be added customer on requestPasswordReset. Error:' + e,
            'CustomersFlowPlugin',
          );
        }
      }

      return { success: true };
    } catch (e) {
      return { success: false };
    }
  }

  @Transaction()
  @Mutation()
  @Allow(Permission.Public)
  async resetPassword(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationResetPasswordArgs,
    @Context('req') req: Request,
    @Context('res') res: Response,
  ): Promise<ResetPasswordResult> {
    const nativeAuthStrategyError = this.requireNativeAuthStrategy();
    if (nativeAuthStrategyError) {
      return nativeAuthStrategyError;
    }
    const { token, password } = args;
    const resetResult = await this.customerService.resetPassword(ctx, token, password);
    if (isGraphQlErrorResult(resetResult)) {
      return resetResult;
    }

    /**
     * Chequear que la cuenta esta verificada, sino verficiarla
     *
     * Esto envita un bug en el proceso de registración. Si la persona reseteaba contraseña antes de verificar el email
     * El usuario quedaba bloqueado, sin poder verificar el email de su cuenta
     */
    if (resetResult instanceof User) {
      await this.customUserService.makeSureUserIsVerified(ctx, resetResult as User);
    }

    const authResult = await super.authenticateAndCreateSession(
      ctx,
      {
        input: {
          [NATIVE_AUTH_STRATEGY_NAME]: {
            username: resetResult.identifier,
            password: args.password,
          },
        },
      },
      req,
      res,
    );

    if (isGraphQlErrorResult(authResult) && authResult.__typename === 'NotVerifiedError') {
      return authResult;
    }
    if (isGraphQlErrorResult(authResult)) {
      // This should never occur in theory
      throw authResult;
    }
    return authResult;
  }
}
