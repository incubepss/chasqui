import { SellosProductoresCode, SellosProductoresFacetValue } from './sellos.d';

const FACET_SELLOS_PRODUCTORES = {
  id: 'sellos_productores',
  code: 'sellos_productores',
  name: 'Sellos de productores',
};

export const SELLOS_PRODUCTORES_ALLCODES: SellosProductoresCode[] = [
  'agricultura_familiar',
  'cooperativas',
  'empresa_social',
  'recuperadas',
];

export const facetSelloProductores: SellosProductoresFacetValue[] = [
  {
    count: 100,
    facetValue: {
      id: 'cooperativas',
      code: 'cooperativas',
      name: 'Cooperativas',
      facet: FACET_SELLOS_PRODUCTORES,
    },
  },
  {
    count: 100,
    facetValue: {
      id: 'empresa_social',
      code: 'empresa_social',
      name: 'Empresa Social',
      facet: FACET_SELLOS_PRODUCTORES,
    },
  },
  {
    count: 100,
    facetValue: {
      id: 'agricultura_familiar',
      code: 'agricultura_familiar',
      name: 'Agricultura familiar',
      facet: FACET_SELLOS_PRODUCTORES,
    },
  },
  {
    count: 100,
    facetValue: {
      id: 'recuperadas',
      code: 'recuperadas',
      name: 'Recuperadas',
      facet: FACET_SELLOS_PRODUCTORES,
    },
  },
];
