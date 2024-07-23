import { Injectable } from '@nestjs/common';
import { normalizeString } from '@vendure/common/lib/normalize-string';
import {
  Channel,
  ChannelService,
  Collection,
  CollectionService,
  FacetValue,
  FacetValueService,
  ID,
  RequestContext,
} from '@vendure/core';
import { DEFAULT_LANGUAGE_CODE } from '../paramsContext';

@Injectable()
export class CollectionMakerService {
  constructor(
    // private facetService: FacetService,
    private channelService: ChannelService,
    private facetValueService: FacetValueService,
    private collectionService: CollectionService,
  ) {}

  async makeForFacetValuesIds(ids: ID[], channel: Channel): Promise<ID[]> {
    const ctx = new RequestContext({
      channel: channel,
      apiType: 'admin',
      isAuthorized: true,
      authorizedAsOwnerOnly: false,
      session: {} as any,
    });
    const facetValues = await this.facetValueService.findByIds(ctx, ids);

    return Promise.all(
      facetValues.map(facetValue => {
        return this.makeForFacetValue(ctx, facetValue, channel);
      }),
    );
  }

  protected async makeForFacetValue(
    ctx: RequestContext,
    facetValue: FacetValue,
    channel: Channel,
  ): Promise<ID> {
    const facetName = facetValue.name;
    const slug = normalizeString(facetName, '-') + '-' + facetValue.id;

    const collection = await this.collectionService.findOneBySlug(ctx, slug);

    if (collection) {
      return collection.id;
    }

    const result = await this.collectionService.create(ctx, {
      translations: [
        {
          languageCode: DEFAULT_LANGUAGE_CODE,
          name: facetName,
          slug: slug,
          description: '',
        },
      ],
      filters: [
        {
          code: 'facet-value-filter',
          arguments: [
            { name: 'facetValueIds', value: JSON.stringify([facetValue.id]) },
            { name: 'containsAny', value: 'false' },
          ],
        },
      ],
    });

    await this.channelService.assignToChannels(ctx, Collection, result.id, [channel.id]);
    await this.channelService.removeFromChannels(ctx, Collection, result.id, [1]);

    return result.id;
  }
}
