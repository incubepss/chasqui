import { Brackets } from 'typeorm';
import { ListQueryBuilder, RequestContext, TransactionalConnection, patchEntity, Asset } from '@vendure/core';
import { ID } from '@vendure/common/lib/shared-types';
import { ListQueryOptions } from '@vendure/core/dist/common/types/common-types';
import { Injectable } from '@nestjs/common';
import { Productor } from '../entities/productor.entity';

import { ProductorUsedError } from '../api/productor-errors';

// import { ProductorUpdateInput, ProductorAddInput } from '../generated-types2';

type ProductorUpdateInput = any;
type ProductorAddInput = any;

type FindAllOptions = ListQueryOptions<Productor> & {
  filterSellos?: Array<string>;
};

@Injectable()
export class ProductorService {
  relations: ['channels'];

  constructor(private listQueryBuilder: ListQueryBuilder, private connection: TransactionalConnection) {}

  async findAll(ctx: RequestContext, options?: FindAllOptions) {
    const channelId = ctx.channelId > 1 ? ctx.channelId : undefined;
    const query = this.listQueryBuilder.build(Productor, options, {
      relations: ['channels'],
      channelId: channelId,
      ctx,
    });

    if (options?.filterSellos) {
      query.andWhere(
        new Brackets(qb => {
          options.filterSellos?.forEach((sello: string, index) => {
            qb.orWhere(`productor.sellos like '%' || :sello_${index} || '%'`, { [`sello_${index}`]: sello });
          });
        }),
      );
    }

    return query.getManyAndCount().then(([items, totalItems]) => {
      return {
        items,
        totalItems,
      };
    });
  }

  async findOneBySlug(ctx: RequestContext, slug: string) {
    const query = this.listQueryBuilder.build(
      Productor,
      {},
      {
        relations: this.relations,
        ctx,
      },
    );

    query.andWhere('productor.slug = :slug', { slug });
    return query.getOne();
  }

  create(ctx: RequestContext, input: ProductorAddInput) {
    const productor = new Productor(input);
    if (ctx.channel) {
      if (!productor.channels) {
        productor.channels = [];
      }
      productor.channels.push(ctx.channel);
    }
    return this.connection.getRepository(ctx, Productor).save(productor);
  }

  async update(ctx: RequestContext, input: ProductorUpdateInput) {
    const productor = await this.connection.getEntityOrThrow(ctx, Productor, input.id);
    const updatedProductor = patchEntity(productor, {
      ...input,
    });
    if (input.logoId) {
      const asset = await this.connection.getRepository(ctx, Asset).findOne(input.logoId);
      if (asset) {
        updatedProductor.logo = asset;
      }
    }
    if (input.bannerId) {
      const asset = await this.connection.getRepository(ctx, Asset).findOne(input.bannerId);
      if (asset) {
        updatedProductor.banner = asset;
      }
    }
    return this.connection.getRepository(ctx, Productor).save(updatedProductor);
  }

  async deleteProductor(ctx: RequestContext, ids: ID) {
    const productor = await this.connection.getEntityOrThrow(ctx, Productor, ids);
    try {
      await this.connection.getRepository(ctx, Productor).delete(ids);
      /* eslint-disable */
    } catch (e: any) {
      if (e.message.indexOf('FOREIGN KEY') > -1) {
        return new ProductorUsedError(ids);
      }
      throw e;
    }
    return {
      __typename: 'Productor',
      ...productor,
    };
  }
}

export default ProductorService;
