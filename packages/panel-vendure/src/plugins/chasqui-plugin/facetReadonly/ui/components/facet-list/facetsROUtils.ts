/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Facet, Translated } from '@vendure/core';

export const isFacetReadonly = (facet: Translated<Facet> | Facet): boolean => {
  // @ts-ignore
  return facet?.customFields?.shareChannelsReadonly === true;
};
