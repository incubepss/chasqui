import { defaultConfig, CatalogOptions, LanguageCode } from '@vendure/core';
import { ConfigArgDef } from '@vendure/core/dist/common/configurable-operation';

const MAP_TRANSLATIONS = {
  'facet-value-filter': {
    languageCode: LanguageCode.es,
    value: 'Filtro por etiquetas',
  },
  'variant-name-filter': {
    languageCode: LanguageCode.es,
    value: 'Filtro por nombre de Variante',
  },
  'variant-id-filter': {
    languageCode: LanguageCode.es,
    value: 'Selección manual de variantes de productos',
  },
  'product-id-filter': {
    languageCode: LanguageCode.es,
    value: 'Selección manual de productos',
  },
};

export const combineWithAndArg: ConfigArgDef<'boolean'> = {
  type: 'boolean',
  label: [{ languageCode: LanguageCode.es, value: 'Modo combinación' }],
  description: [
    {
      languageCode: LanguageCode.es,
      value:
        'Si este filtro es combinado con otros filtros, use "AND" si todas las condiciones tienen que ser satisfechas, o use "OR" si al menos una condicion satisface el filtro',
    },
  ],
  defaultValue: true,
  ui: {
    component: 'combination-mode-form-input',
  },
};

const MAP_EXTENDS = {
  'facet-value-filter': {
    args: {
      facetValueIds: {
        label: [{ value: 'Etiqueta', languageCode: LanguageCode.es }],
        type: 'ID',
        list: true,
        require: true,
        ui: {
          component: 'facet-value-form-input',
        },
      },
      containsAny: {
        type: 'boolean',
        label: [{ value: 'Contiene alguna', languageCode: LanguageCode.es }],
        description: [
          {
            languageCode: LanguageCode.es,
            value:
              'Si está activo, los productos tienen que tener al menos una de las etiquetas elegidas. Si no está activo, el producto tiene que tener todas las etiquetas elegidas',
          },
        ],
      },
      combineWithAnd: combineWithAndArg,
    },
  },
  'variant-name-filter': {
    args: {
      operator: {
        label: [{ value: 'Operador', languageCode: LanguageCode.es }],
        type: 'string',
        ui: {
          component: 'select-form-input',
          options: [
            { value: 'startsWith', label: [{ languageCode: LanguageCode.es, value: 'Empieza con' }] },
            { value: 'endsWith', label: [{ languageCode: LanguageCode.es, value: 'Termina con' }] },
            { value: 'contains', label: [{ languageCode: LanguageCode.es, value: 'Contiene' }] },
            { value: 'doesNotContain', label: [{ languageCode: LanguageCode.es, value: 'No contiene' }] },
          ],
        },
      },
      term: {
        label: [{ value: 'Término', languageCode: LanguageCode.es }],
        type: 'string',
      },
      combineWithAnd: combineWithAndArg,
    },
  },
  'variant-id-filter': {
    args: {
      variantIds: {
        type: 'ID',
        list: true,
        label: [{ languageCode: LanguageCode.es, value: 'Variantes' }],
        ui: {
          component: 'product-multi-form-input',
          selectionMode: 'variant',
        },
      },
      combineWithAnd: combineWithAndArg,
    },
  },
  'product-id-filter': {
    args: {
      productIds: {
        type: 'ID',
        list: true,
        label: [{ languageCode: LanguageCode.es, value: 'Productos' }],
        ui: {
          component: 'product-multi-form-input',
          selectionMode: 'product',
        },
      },
      combineWithAnd: combineWithAndArg,
    },
  },
};

const injectEsTranslating = (catalogOptions: CatalogOptions) => {
  catalogOptions.collectionFilters?.forEach(collectionFilter => {
    if (collectionFilter.code in MAP_TRANSLATIONS) {
      /* eslint-disable */
      // @ts-ignore
      collectionFilter.description.push(MAP_TRANSLATIONS[collectionFilter.code]);
    }
    if (collectionFilter.code in MAP_EXTENDS) {
      /* eslint-disable */
        // @ts-ignore
      collectionFilter.options.args = {
        /* eslint-disable */
        // @ts-ignore
        ...collectionFilter.options.args,
        /* eslint-disable */
        // @ts-ignore
        ...MAP_EXTENDS[collectionFilter.code].args
      }
    }
  });
};

const catalogOptions: CatalogOptions = {
  ...defaultConfig.catalogOptions,
};

injectEsTranslating(catalogOptions);

export default catalogOptions;
