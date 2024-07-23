import { Injectable } from '@nestjs/common';
import {
  Facet,
  Channel,
  ID,
  RequestContext,
  FacetValueService,
  FacetService,
  FacetValue,
  ChannelService,
} from '@vendure/core';
import { normalizeString } from '@vendure/common/lib/normalize-string';

import { DEFAULT_LANGUAGE_CODE } from '../paramsContext';
import { OdooProduct } from '../odoo.service.d';
import { CollectionMakerService } from './collection-maker';

export type FacetImporterInput = {
  facet: string;
  value: string;
};

const FACET_SELLO_PRODUCTO = 'sello_producto'; // this must be same of the facetReadonly.initialFacetsReadonly.ts

@Injectable()
export class FacetImporter {
  private facetMap = new Map<string, Facet>();

  constructor(
    private facetService: FacetService,
    private facetValueService: FacetValueService,
    private channelService: ChannelService,
    private collectionMakerService: CollectionMakerService,
  ) {}

  async importFacetValues(producto: OdooProduct, channel: Channel): Promise<ID[]> {
    const cate = await this.importCategoria(producto, channel);
    const sellos = await this.importSellos(producto, channel);
    return [...cate, ...sellos];
  }

  private async importSellos(producto: OdooProduct, channel: Channel): Promise<ID[]> {
    if (!producto.sellos?.length) {
      return [];
    }
    const facetsInput: FacetImporterInput[] = producto.sellos.map(c => {
      return {
        facet: FACET_SELLO_PRODUCTO,
        value: c,
      };
    });
    return this.getFacetValueIds(facetsInput, channel);
  }

  private async importCategoria(producto: OdooProduct, channel: Channel): Promise<ID[]> {
    if (!producto.pos_categ) {
      return [];
    }
    const facetInput: FacetImporterInput = {
      facet: 'Categoría',
      value: producto.pos_categ,
    };
    const facetValuesIds = await this.getFacetValueIds([facetInput], channel);
    await this.collectionMakerService.makeForFacetValuesIds(facetValuesIds, channel);
    return facetValuesIds;
  }

  private async getFacetValueIds(facets: Array<FacetImporterInput>, channel: Channel): Promise<ID[]> {
    const facetValueIds: ID[] = [];
    const ctx = new RequestContext({
      channel: channel,
      apiType: 'admin',
      isAuthorized: true,
      authorizedAsOwnerOnly: false,
      session: {} as any,
    });

    for (const item of facets) {
      const facetName = item.facet;
      const valueName = item.value;
      let facetCode = normalizeString(facetName, '_');
      const isSharedReadonly = facetCode === FACET_SELLO_PRODUCTO;
      if (!isSharedReadonly) {
        facetCode = facetCode + ':' + normalizeString(channel.code, '_');
      }

      let facetEntity: Facet;
      const cachedFacet = this.facetMap.get(facetCode);

      if (cachedFacet) {
        facetEntity = cachedFacet;
      } else {
        const existing = await this.facetService.findByCode(facetCode, DEFAULT_LANGUAGE_CODE);
        if (existing) {
          facetEntity = existing;
        } else {
          facetEntity = await this.facetService.create(ctx, {
            isPrivate: false,
            code: facetCode,
            translations: [{ languageCode: DEFAULT_LANGUAGE_CODE, name: facetName }],
          });
          await this.channelService.assignToChannels(ctx, Facet, facetEntity.id, [channel.id]);
        }
        this.facetMap.set(facetCode, facetEntity);
      }

      const facetValueEntity: FacetValue = await this._getCreateFacetValue(
        ctx,
        valueName,
        facetEntity,
        channel,
      );
      facetValueIds.push(facetValueEntity.id);
    }

    return facetValueIds;
  }

  private async _getCreateFacetValue(
    ctx: RequestContext,
    valueName: string,
    facetEntity: Facet,
    channel: Channel,
  ): Promise<FacetValue> {
    let facetValueEntity: FacetValue;
    const existing = facetEntity.values.find(v => v.name === valueName);
    if (existing) {
      facetValueEntity = existing;
    } else {
      facetValueEntity = await this.facetValueService.create(RequestContext.empty(), facetEntity, {
        code: normalizeString(valueName, '_'),
        translations: [{ languageCode: DEFAULT_LANGUAGE_CODE, name: valueName }],
      });
      await this.channelService.assignToChannels(ctx, FacetValue, facetValueEntity.id, [channel.id]);
      facetEntity.values.push(facetValueEntity);
    }

    return facetValueEntity;
  }
}
