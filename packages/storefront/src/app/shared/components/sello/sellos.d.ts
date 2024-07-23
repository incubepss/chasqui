import { SearchProducts } from '../../../common/generated-types';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type SellosProductoresCode =
  | 'agricultura_familiar'
  | 'cooperativas'
  | 'empresa_social'
  | 'recuperadas';

export type SellosProductoresFacetValue = SearchProducts.FacetValues & {
  facetValue: {
    id: SellosProductoresCode;
    code: SellosProductoresCode;
    name: string;
  };
};
