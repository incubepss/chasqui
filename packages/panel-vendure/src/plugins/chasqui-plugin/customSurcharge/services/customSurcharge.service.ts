import { Injectable } from '@nestjs/common';
import {
  RequestContext,
  ListQueryBuilder,
  TransactionalConnection,
  patchEntity,
  ID,
  Order,
  Surcharge,
  OrderService,
} from '@vendure/core';
import { omit } from '@vendure/common/lib/omit';
import { CustomSurcharge } from '../entites/CustomSurcharge.entity';
import { CustomSurchargeOption } from '../entites/CustomSurchargeOption.entity';

type CustomSurchargeAddInput = any;
type CustomSurchargeUpdateInput = any;

const sortOptions = (a: { listPrice: number }, b: { listPrice: number }) => {
  if (a.listPrice === 0) {
    return 1;
  }
  if (a.listPrice < b.listPrice) {
    return -1;
  } else if (a.listPrice > b.listPrice) {
    return 1;
  }
  return 0;
};

@Injectable()
export class CustomSurchargeService {
  constructor(
    private listQueryBuilder: ListQueryBuilder,
    private orderService: OrderService,
    private connection: TransactionalConnection,
  ) {}

  async findAll(ctx: RequestContext, options: any = undefined): Promise<CustomSurcharge[]> {
    const customSurcharges = await this.listQueryBuilder
      .build(CustomSurcharge, options)
      .andWhere('customsurcharge.channelId = :channelId', { channelId: ctx.channelId })
      .getMany();

    customSurcharges?.forEach(q => q.options?.sort(sortOptions));

    return customSurcharges;
  }

  async findOne(ctx: RequestContext, id: string): Promise<CustomSurcharge | undefined> {
    const customSurcharge = await this.connection.getRepository(ctx, CustomSurcharge).findOne(id);
    if (customSurcharge?.options) {
      customSurcharge.options = customSurcharge.options.sort(sortOptions);
    }
    return customSurcharge;
  }

  async findOneOption(ctx: RequestContext, id: ID): Promise<CustomSurchargeOption | undefined> {
    return this.connection.getRepository(ctx, CustomSurchargeOption).findOne(id, {
      relations: ['customSurcharge'],
    });
  }

  async create(ctx: RequestContext, input: CustomSurchargeAddInput) {
    const options = input.options;
    input.options = [];
    const customSurcharge = new CustomSurcharge(input);
    customSurcharge.channel = ctx.channel;
    const customSurchargeSaved = await this.connection
      .getRepository(ctx, CustomSurcharge)
      .save(customSurcharge);

    await Promise.all(
      options.map((rawOption: any) => {
        rawOption.customSurcharge = customSurchargeSaved;
        const option = new CustomSurchargeOption(rawOption);
        return this.connection.getRepository(ctx, CustomSurchargeOption).save(option);
      }),
    );

    return this.connection.getRepository(ctx, CustomSurcharge).findOne(customSurchargeSaved.id);
  }

  async update(ctx: RequestContext, input: CustomSurchargeUpdateInput) {
    const customSurcharge = await this.connection.getEntityOrThrow(ctx, CustomSurcharge, input.id);

    patchEntity(customSurcharge, omit(input, ['options']));
    const updated = await this.connection.getRepository(ctx, CustomSurcharge).save(customSurcharge);

    const options = input.options;

    await Promise.all(
      options.map((rawOption: any) => {
        if (rawOption.id && rawOption.flagRemove) {
          return this.removeOption(ctx, rawOption.id);
        } else {
          return this.saveOption(ctx, updated.id, rawOption);
        }
      }),
    );

    return this.connection.getRepository(ctx, CustomSurcharge).findOne(updated.id);
  }

  async remove(ctx: RequestContext, id: ID) {
    const customSurcharge = await this.connection.getEntityOrThrow(ctx, CustomSurcharge, id);
    const deleted = await this.connection.getRepository(ctx, CustomSurcharge).remove(customSurcharge);
    deleted.id = id;
    return {
      __typename: 'CustomSurcharge',
      ...deleted,
    };
  }

  async useOptionOnOrder(
    ctx: RequestContext,
    order: Order,
    option: CustomSurchargeOption,
  ): Promise<Order | undefined> {
    if (!order || !option) {
      return undefined;
    }

    const skuKey = `${option.customSurcharge.id}-${option.id}`;
    const description = option.customSurcharge.name + ': ' + option.description;

    const surcharge: Partial<Surcharge> = {
      listPrice: option.listPrice,
      listPriceIncludesTax: true,
      description: description,
      sku: skuKey,
    };

    // Remove surcharge of the same CustomSurcharge
    const oldSurcharges = await this._findUsedOptionOnOrder(ctx, order, option.customSurcharge.id);
    await this._removeSurchargesFromOrder(ctx, order, oldSurcharges);

    // Add the new one
    return this.orderService.addSurchargeToOrder(ctx, order.id, surcharge);
  }

  protected async _findUsedOptionOnOrder(
    ctx: RequestContext,
    order: Order,
    customSurchargeId: ID,
  ): Promise<Array<Surcharge>> {
    const skuKey = `${customSurchargeId}-`;
    if (!order.surcharges) {
      order = (await this.orderService.findOne(ctx, order.id)) || order;
    }
    const surcharges = order.surcharges.filter(s => s.sku.indexOf(skuKey) > -1) || [];

    return surcharges;
  }

  protected _removeSurchargesFromOrder(
    ctx: RequestContext,
    order: Order,
    surcharges: Array<Surcharge>,
  ): Promise<any> {
    return Promise.all(
      surcharges?.map(surcharge => {
        return this.orderService.removeSurchargeFromOrder(ctx, order.id, surcharge.id);
      }),
    );
  }

  protected async saveOption(ctx: RequestContext, parentId: ID, input: any) {
    if (!input.id) {
      //SAVE
      input.customSurcharge = { id: parentId };
      const option = new CustomSurchargeOption(input);
      return this.connection.getRepository(ctx, CustomSurchargeOption).save(option);
    } else {
      // UPDATE
      const option = await this.connection.getEntityOrThrow(ctx, CustomSurchargeOption, input.id);
      patchEntity(option, input);
      return this.connection.getRepository(ctx, CustomSurchargeOption).save(option);
    }
  }

  protected async removeOption(ctx: RequestContext, id: ID) {
    const option = await this.connection.getEntityOrThrow(ctx, CustomSurchargeOption, id);
    await this.connection.getRepository(ctx, CustomSurchargeOption).remove(option);
    return option;
  }
}
