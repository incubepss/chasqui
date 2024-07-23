export type FacetValueReadonlyRaw = {
  name: string;
  code: string;
};

export type FacetReadonlyRaw = {
  name: string;
  code: string;
  facetValues: Array<{
    name: string;
    code: string;
  }>;
};

export const SELLOS_FACET_CODE = 'sello_producto';

export const initalFacetReadonly: FacetReadonlyRaw[] = [
  {
    name: 'Sello producto',
    code: SELLOS_FACET_CODE,
    facetValues: [
      { name: 'Agroecológico', code: 'agroecologico' },
      { name: 'Artesanal', code: 'artesanal' },
      { name: 'En Red', code: 'en_red' },
      { name: 'Kilómetro Cero', code: 'kilometro_cero' },
      { name: 'Orgánico', code: 'organico' },
      { name: 'Reciclado', code: 'reciclado' },
    ],
  },
];
