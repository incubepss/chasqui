import { Injectable } from '@nestjs/common';
import {
  Administrator,
  Channel,
  PaymentMethod,
  RequestContext,
  Role,
  ShippingMethod,
  ChannelService,
  CurrencyCode,
  ErrorResultUnion,
  RoleService,
  AdministratorService,
  ShippingMethodService,
  PaymentMethodService,
  manualFulfillmentHandler,
  isGraphQlErrorResult,
  Facet,
  FacetService,
} from '@vendure/core';
import {
  LanguageCode,
  CreateRoleInput,
  CreateChannelInput,
  CreateChannelResult,
  CreateAdministratorInput,
  CreateShippingMethodInput,
  CreatePaymentMethodInput,
} from '@vendure/common/lib/generated-types';
import { CreateTiendaInput } from '../multitienda';
import { FacetReadonlyService } from '../../facetReadonly/services/FacetReadonly.service';
import { tiendaPermissions } from './tiendapermissions';

@Injectable()
export class CreatorMultitiendaService {
  constructor(
    private channelService: ChannelService,
    private roleService: RoleService,
    private adminService: AdministratorService,
    private shippingMethodService: ShippingMethodService,
    private paymentMethodoService: PaymentMethodService,
    private facetService: FacetService,
    private facetReadolnyService: FacetReadonlyService,
  ) {}

  async create(
    ctx: RequestContext,
    input: CreateTiendaInput,
  ): Promise<ErrorResultUnion<CreateChannelResult, Channel, any>> {
    // Crear canal
    const responseChannel = await this.createChannel(ctx, input);
    if (isGraphQlErrorResult(responseChannel)) {
      return responseChannel;
    }

    if (!(responseChannel instanceof Channel)) {
      return responseChannel;
    }

    const channel = responseChannel as Channel;

    await this.assignChannelToSuperadminRole(ctx, channel);
    await this.assignSellosToChannel(ctx, channel);

    // Crear Metodo de entrega por defecto
    await this.createShippingMethod(ctx, channel);

    // Crear Metodo de Pago por defecto
    await this.createPaymentMethod(ctx, channel);

    // crea Faceta Categoría por defecto
    await this.createFacetCategoria(ctx, channel);

    // Crear Role
    const role = await this.createRole(ctx, channel, input);

    // Crear Admin
    const admin = await this.createAdmin(ctx, role, channel, input);
    if (isGraphQlErrorResult(admin)) {
      return admin;
    }

    return {
      __typename: 'Channel',
      ...channel,
    } as any;
  }

  protected async createChannel(
    ctx: RequestContext,
    input: CreateTiendaInput,
  ): Promise<ErrorResultUnion<CreateChannelResult, Channel, any>> {
    const inputChannel: CreateChannelInput = {
      code: input.code,
      token: input.token,
      currencyCode: CurrencyCode.ARS,
      defaultLanguageCode: LanguageCode.es,
      pricesIncludeTax: true,
      defaultShippingZoneId: 1,
      defaultTaxZoneId: 1,
      customFields: {
        showOnMultitienda: true,
        nombre: input.code,
        zoneStore: `${input.city}, ${input.province}`,
        cityStore: input.city,
        provinceStore: input.province,
        storeEnabled: false,
        messageStoreDisabled: 'Estamos construyendo nuestro catálogo, pronto podrás realizar compras.',
      },
    };

    return this.channelService.create(ctx, inputChannel).catch(e => {
      const isDuplicated = e.toString().indexOf('duplicate key value violates') > -1;

      if (isDuplicated) {
        return {
          __typename: 'CreateTiendaError',
          errorCode: 'TIENDA_DUPLICADA',
          message: e.toString(),
          friendlyMessage: 'Ya existe un canal con ese código o token',
        } as any;
      }

      const error = {
        __typename: 'CreateTiendaError',
        errorCode: 'UNKNOWN_ERROR',
        message: e.toString(),
      };
      return error as any;
    });
  }

  protected async createRole(ctx: RequestContext, channel: Channel, input: CreateTiendaInput): Promise<Role> {
    // const superadmin = await this.roleService.getSuperAdminRole();
    const ctxGlobal = new RequestContext({
      channel: await this.channelService.getDefaultChannel(), // atenti, tiene que ser el canal por defecto
      apiType: 'admin',
      isAuthorized: true,
      authorizedAsOwnerOnly: false,
      session: {
        user: {
          id: 1, // harcodeado el superadmin para que no patee servicios como assignProductVariantsToChannel
        },
      } as any,
    });

    const inputRole: CreateRoleInput = {
      description: 'admin ' + input.token,
      code: input.code,
      channelIds: [channel.id],
      permissions: tiendaPermissions,
    };

    const role = await this.roleService.create(ctxGlobal, inputRole);
    return role;
  }

  protected async assignChannelToSuperadminRole(ctx: RequestContext, channel: Channel): Promise<Role> {
    const role = await this.roleService.getSuperAdminRole();
    await this.roleService.assignRoleToChannel(ctx, role.id, channel.id);
    return role;
  }

  protected assignSellosToChannel(ctx: RequestContext, channel: Channel): Promise<void> {
    return this.facetReadolnyService.assignFacetsRoToChannel(ctx, channel.id);
  }

  protected async createFacetCategoria(ctx: RequestContext, channel: Channel): Promise<Facet> {
    const facet = await this.facetService.create(ctx, {
      code: 'categorias-' + channel.token,
      isPrivate: false,
      translations: [{ name: 'Categorías', languageCode: LanguageCode.es }],
    });

    await this.channelService.assignToChannels(ctx, Facet, facet.id, [channel.id]);

    return facet;
  }

  protected async createAdmin(
    ctx: RequestContext,
    role: Role,
    channel: Channel,
    input: CreateTiendaInput,
  ): Promise<Administrator> {
    const inputAdmin: CreateAdministratorInput = {
      emailAddress: input.emailAdmin,
      firstName: input.nameAdmin,
      lastName: input.lastNameAdmin,
      password: input.password || '123456',
      roleIds: [role.id],
      customFields: {
        channel: channel,
      },
    };

    return this.adminService.create(ctx, inputAdmin).catch(e => {
      const isDuplicated = e.toString().indexOf('duplicate key value violates') > -1;

      if (isDuplicated) {
        return {
          __typename: 'CreateTiendaError',
          errorCode: 'EMAIL_ADDRESS_CONFLICT_ERROR',
          message: e.toString(),
          friendlyMessage:
            'Se creo la tienda, pero NO el adminitrador, ya existe un adminitrador con ese email',
        } as any;
      }
      const error = {
        __typename: 'CreateTiendaError',
        errorCode: 'UNKNOWN_ERROR',
        message: e.toString(),
        friendlyMessage: 'No se creo el administrador, posiblemente ya exista',
      };
      return error as any;
    });
  }

  protected async createShippingMethod(ctx: RequestContext, channel: Channel): Promise<ShippingMethod> {
    const inputShippingMethod: CreateShippingMethodInput = {
      fulfillmentHandler: manualFulfillmentHandler.code,
      calculator: {
        code: 'default-shipping-calculator',
        arguments: [
          {
            name: 'rate',
            value: '0',
          },
          {
            name: 'includesTax',
            value: 'auto',
          },
          {
            name: 'taxRate',
            value: '0',
          },
        ],
      },
      checker: {
        code: 'default-shipping-eligibility-checker',
        arguments: [
          {
            name: 'orderMinimum',
            value: '0',
          },
        ],
      },
      code: 'acordar-con-el-vendedor',
      translations: [
        {
          languageCode: LanguageCode.es,
          name: 'Acordar con el vendedor',
        },
      ],
      customFields: {
        typeDelivery: 'showroom',
      },
    };

    const shippingMethod = await this.shippingMethodService.create(ctx, inputShippingMethod);

    await this.channelService.assignToChannels(ctx, ShippingMethod, shippingMethod.id, [channel.id]);
    return shippingMethod;
  }

  protected async createPaymentMethod(ctx: RequestContext, channel: Channel): Promise<PaymentMethod> {
    const inputPaymentMethod: CreatePaymentMethodInput = {
      name: 'Acordar con el vendedor',
      code: 'acordar-con-el-vendedor',
      description: '',
      enabled: true,
      handler: {
        code: 'payment-manual',
        arguments: [],
      },
      customFields: {},
    };

    const paymentMethod = await this.paymentMethodoService.create(ctx, inputPaymentMethod);
    await this.channelService.assignToChannels(ctx, PaymentMethod, paymentMethod.id, [channel.id]);
    return paymentMethod;
  }
}
