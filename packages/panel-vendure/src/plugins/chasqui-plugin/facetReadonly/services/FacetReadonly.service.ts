import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  Facet,
  FacetService,
  ChannelService,
  Logger,
  LanguageCode,
  Channel,
  FacetValueService,
  FacetValue,
  translateDeep,
} from '@vendure/core';
import { DEFAULT_CHANNEL_CODE } from '@vendure/common/lib/shared-constants';
import { ID } from '@vendure/common/lib/shared-types';
import {
  FacetReadonlyRaw,
  FacetValueReadonlyRaw,
  initalFacetReadonly,
  SELLOS_FACET_CODE,
} from './initialFacetsReadonly';

export const DEFAULT_LANGUAGE_CODE = LanguageCode.es;

@Injectable()
export class FacetReadonlyService implements OnApplicationBootstrap {
  constructor(
    private facetService: FacetService,
    private facetValueService: FacetValueService,
    private channelService: ChannelService,
    private connection: TransactionalConnection,
  ) {}

  async onApplicationBootstrap() {
    Logger.info('Initializing FacetReadonlyService Plugin', 'FacetReadonlyPlugin');
    await this.initFacetsReadonly();
  }

  async initFacetsReadonly() {
    const facetsRO = await this.getFacetsReadonly();

    await this.checkAssignedToAllChannels(facetsRO);

    // find the "readonly" facets that there aren't still presents on the DB
    const newFacetsToInit = initalFacetReadonly.filter(raw => {
      const currentIndex = facetsRO.findIndex(facet => facet.code === raw.code);
      return currentIndex === -1;
    });

    if (!newFacetsToInit?.length) {
      return;
    }

    // init the new ones
    await Promise.all(
      newFacetsToInit.map(raw => {
        return this.initFacet(raw);
      }),
    );
  }

  protected async checkAssignedToAllChannels(facets: Facet[]): Promise<any> {
    const ctx = new RequestContext({
      channel: await this.channelService.getDefaultChannel(),
      apiType: 'admin',
      isAuthorized: true,
      authorizedAsOwnerOnly: false,
      session: {} as any,
    });
    return Promise.all(
      facets.map(facet => {
        return this.assignFacetToAllChannels(ctx, facet);
      }),
    );
  }

  async isFacetReadonly(ctx: RequestContext, facetId: ID): Promise<boolean> {
    const facet = await this.facetService.findOne(ctx, facetId);
    if (!facet) {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return facet?.customFields?.shareChannelsReadonly === true;
  }

  async assignFacetsRoToChannel(ctx: RequestContext, idChannel: ID): Promise<any> {
    const facetsRO = await this.getFacetsReadonly();
    if (!facetsRO) {
      return [];
    }

    const idsFacets = facetsRO.map(f => f.id);
    Logger.info(`assignFacetsRoToChannel ${idChannel} <= ${idsFacets} `, 'FacetReadonlyPlugin');

    return Promise.all(
      facetsRO.map(facet => {
        return this.assingFacetToChannels(ctx, facet, [idChannel]);
      }),
    );
  }

  async getFacetsReadonly(): Promise<Array<Facet>> {
    return this.connection
      .getRepository(Facet)
      .createQueryBuilder('facet')
      .where('facet.customFieldsSharechannelsreadonly = true')
      .getMany();
  }

  async getFacetByCode(code: string): Promise<Facet | undefined> {
    return this.connection
      .getRepository(Facet)
      .createQueryBuilder('facet')
      .where('code = :code', { code: code })
      .getOne();
  }

  async getSellosFacetValues(ctx: RequestContext): Promise<Array<FacetValue>> {
    return this.connection
      .getRepository(FacetValue)
      .createQueryBuilder('facetValue')
      .leftJoinAndSelect(Facet, 'facet', 'facet.id = facetValue.facetId')
      .where('facet.code = :code', { code: SELLOS_FACET_CODE })
      .getMany()
      .then(values => values.map(facetValue => translateDeep(facetValue, ctx.languageCode)));
  }

  /**
   * Create (insert) a "readonly" Facet and assign it to all currrent channels (except default channel)
   * precondition: the facets is not yet initialited as readonly Facet
   */
  protected async initFacet(raw: FacetReadonlyRaw): Promise<Facet | undefined> {
    Logger.info('Initializing readonly facet ' + raw.code, 'FacetReadonlyPlugin');
    const ctx = new RequestContext({
      channel: await this.channelService.getDefaultChannel(),
      apiType: 'admin',
      isAuthorized: true,
      authorizedAsOwnerOnly: false,
      session: {} as any,
    });

    // check if there is a facet with the code
    let facet = await this.getFacetByCode(raw.code);

    if (!facet) {
      // CREATE it
      await this.createFacet(ctx, raw);
    } else {
      // UPDATE it, to makesure that shareChannelsReadonly is setted to true
      await this.facetService.update(ctx, {
        id: facet.id,
        customFields: {
          shareChannelsReadonly: true,
        },
      });
    }
    // get await the lastest version
    facet = await this.facetService.findByCode(raw.code, DEFAULT_LANGUAGE_CODE);

    if (facet) {
      await this.assignFacetToAllChannels(ctx, facet);
    } else {
      Logger.warn('Facet readonly has not be created', raw.code);
    }

    return facet;
  }

  protected async createFacet(ctx: RequestContext, raw: FacetReadonlyRaw): Promise<Facet> {
    let facetEntity: Facet;

    try {
      facetEntity = await this.facetService.create(ctx, {
        code: raw.code,
        isPrivate: false,
        translations: [{ name: raw.name, languageCode: DEFAULT_LANGUAGE_CODE }],
        customFields: {
          shareChannelsReadonly: true,
        },
      });
    } catch (e: any) {
      Logger.error('Facet could not be created', e);
      throw e;
    }

    if (!facetEntity) {
      throw new Error('Facet readonly could not be created');
    }

    await Promise.all(
      raw.facetValues.map((rawValue: FacetValueReadonlyRaw) => {
        return this.facetValueService.create(ctx, facetEntity, {
          code: rawValue.code,
          facetId: facetEntity.id,
          translations: [{ name: rawValue.name, languageCode: DEFAULT_LANGUAGE_CODE }],
        });
      }),
    );

    return facetEntity;
  }

  protected async assignFacetToAllChannels(ctx: RequestContext, facet: Facet): Promise<any> {
    const idChannels = await this.getAllChannelsIds();
    this.assingFacetToChannels(ctx, facet, idChannels);
  }

  protected async assingFacetToChannels(
    ctx: RequestContext,
    facet: Facet,
    idChannels: Array<ID>,
  ): Promise<any> {
    Logger.info(`assign facet ${facet.code} to channels ${idChannels} `, 'FacetReadonlyPlugin');

    await this.channelService.assignToChannels(ctx, Facet, facet.id, idChannels);

    const facetValues = await this.facetValueService.findByFacetId(ctx, facet.id);

    await Promise.all(
      facetValues.map(fValue => {
        return this.channelService.assignToChannels(ctx, FacetValue, fValue.id, idChannels);
      }),
    );
  }

  protected async getAllChannelsIds(): Promise<ID[]> {
    const channels = await this.connection
      .getRepository(Channel)
      .createQueryBuilder('channel')
      .where('code <> :code', { code: DEFAULT_CHANNEL_CODE })
      .getMany();
    return channels.map(c => c.id);
  }
}
