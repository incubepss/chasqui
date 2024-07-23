import { Asset, CustomFields, LanguageCode } from '@vendure/core';

const customFieldsConfig: CustomFields = {
  ProductVariant: [
    {
      name: 'incentivo',
      type: 'int',
      list: false,
      public: true,
      internal: false,
      defaultValue: 0,
      ui: { component: 'currency-form-input' },
      label: [
        {
          languageCode: LanguageCode.es,
          value: 'Incentivo para coordinador de pedidos grupales',
        },
      ],
      description: [
        {
          languageCode: LanguageCode.es,
          value: 'Incentivo coordinador compra grupal',
        },
      ],
    },
  ],
  Customer: [
    {
      name: 'codeCustomer',
      type: 'string',
      list: false,
      nullable: true,
      unique: true,
      label: [{ languageCode: LanguageCode.es, value: 'Código de consumidor/a' }],
    },
    {
      name: 'orderSinglesEnabled',
      type: 'boolean',
      list: false,
      defaultValue: false,
      label: [{ languageCode: LanguageCode.es, value: 'Pedidos individuales habilitados' }],
    },
    {
      name: 'orderGroupEnabled',
      type: 'boolean',
      list: false,
      defaultValue: false,
      label: [{ languageCode: LanguageCode.es, value: 'Pedidos grupales habilitados' }],
    },
  ],
  Channel: [
    {
      name: 'showOnMultitienda',
      type: 'boolean',
      list: false,
      ui: { tab: 'Perfil de tienda' },
      label: [{ languageCode: LanguageCode.es, value: 'Mostrar en multi-tiendas' }],
      description: [{ languageCode: LanguageCode.es, value: 'Se mostrará en la tarjeta de multi-tiendas' }],
    },
    {
      name: 'nombre',
      type: 'string',
      list: false,
      ui: { tab: 'Perfil de tienda' },
      label: [{ languageCode: LanguageCode.es, value: 'Nombre' }],
    },
    {
      name: 'zoneStore',
      type: 'string',
      list: false,
      ui: { tab: 'Perfil de tienda' },
      label: [{ languageCode: LanguageCode.es, value: 'Zona de operación' }],
    },
    {
      name: 'cityStore',
      type: 'string',
      list: false,
      ui: { tab: 'Perfil de tienda' },
      label: [{ languageCode: LanguageCode.es, value: 'Ciudad' }],
    },
    {
      name: 'provinceStore',
      type: 'string',
      list: false,
      nullable: true,
      defaultValue: '',
      ui: {
        tab: 'Perfil de tienda',
        component: 'select-form-input',
        options: [
          { label: [{ value: 'Buenos Aires', languageCode: LanguageCode.es }], value: 'Buenos Aires' },
          { label: [{ value: 'C.A.B.A', languageCode: LanguageCode.es }], value: 'C.A.B.A' },
          { label: [{ value: 'Catamarca', languageCode: LanguageCode.es }], value: 'Catamarca' },
          { label: [{ value: 'Chaco', languageCode: LanguageCode.es }], value: 'Chaco' },
          { label: [{ value: 'Chubut', languageCode: LanguageCode.es }], value: 'Chubut' },
          { label: [{ value: 'Córdoba', languageCode: LanguageCode.es }], value: 'Córdoba' },
          { label: [{ value: 'Corrientes', languageCode: LanguageCode.es }], value: 'Corrientes' },
          { label: [{ value: 'Entre Ríos', languageCode: LanguageCode.es }], value: 'Entre Ríos' },
          { label: [{ value: 'Formosa', languageCode: LanguageCode.es }], value: 'Formosa' },
          { label: [{ value: 'Jujuy', languageCode: LanguageCode.es }], value: 'Jujuy' },
          { label: [{ value: 'La Pampa', languageCode: LanguageCode.es }], value: 'La Pampa' },
          { label: [{ value: 'La Rioja', languageCode: LanguageCode.es }], value: 'La Rioja' },
          { label: [{ value: 'Mendoza', languageCode: LanguageCode.es }], value: 'Mendoza' },
          { label: [{ value: 'Misiones', languageCode: LanguageCode.es }], value: 'Misiones' },
          { label: [{ value: 'Neuquén', languageCode: LanguageCode.es }], value: 'Neuquén' },
          { label: [{ value: 'Río Negro', languageCode: LanguageCode.es }], value: 'Río Negro' },
          { label: [{ value: 'Salta', languageCode: LanguageCode.es }], value: 'Salta' },
          { label: [{ value: 'San Juan', languageCode: LanguageCode.es }], value: 'San Juan' },
          { label: [{ value: 'San Luis', languageCode: LanguageCode.es }], value: 'San Luis' },
          { label: [{ value: 'Santa Cruz', languageCode: LanguageCode.es }], value: 'Santa Cruz' },
          { label: [{ value: 'Santa Fe', languageCode: LanguageCode.es }], value: 'Santa Fe' },
          {
            label: [{ value: 'Santiago del Estero', languageCode: LanguageCode.es }],
            value: 'Santiago del Estero',
          },
          {
            label: [{ value: 'Tierra del Fuego', languageCode: LanguageCode.es }],
            value: 'Tierra del Fuego',
          },
          { label: [{ value: 'Tucumán', languageCode: LanguageCode.es }], value: 'Tucumán' },
        ],
      },
      label: [{ languageCode: LanguageCode.es, value: 'Provincia' }],
    },
    {
      name: 'description',
      type: 'string',
      list: false,
      ui: { tab: 'Perfil de tienda', component: 'textarea-form-input' },
      label: [{ languageCode: LanguageCode.es, value: 'Descripción breve' }],
      description: [{ languageCode: LanguageCode.es, value: 'Se mostrará en la tarjeta de multi-tiendas' }],
    },
    {
      name: 'geolocationStore',
      type: 'text',
      list: false,
      ui: { tab: 'Perfil de tienda', component: 'geolocation-input', mode: 'point' },
      label: [{ languageCode: LanguageCode.es, value: 'Geo-localización principal' }],
    },
    {
      name: 'imgPortada',
      type: 'relation',
      entity: Asset,
      list: false,
      ui: { tab: 'Perfil de tienda' },
      label: [{ languageCode: LanguageCode.es, value: 'Imagen perfil multi-tienda' }],
    },
    {
      name: 'imgLogo',
      type: 'relation',
      entity: Asset,
      list: false,
      ui: { tab: 'Encabezado del sitio' },
      label: [{ languageCode: LanguageCode.es, value: 'Logo' }],
    },
    {
      name: 'bgColorStore',
      type: 'string',
      list: false,
      internal: false,
      ui: { tab: 'Encabezado del sitio' },
      label: [{ languageCode: LanguageCode.es, value: 'Color de fondo' }],
    },
    {
      name: 'storeEnabled',
      type: 'boolean',
      list: false,
      defaultValue: true,
      ui: {
        tab: 'Ventas',
      },
      label: [{ languageCode: LanguageCode.es, value: 'Ventas habilitadas' }],
    },
    {
      name: 'messageStoreDisabled',
      type: 'text',
      list: false,
      ui: {
        tab: 'Ventas',
        component: 'rich-text-form-input',
      },
      label: [{ languageCode: LanguageCode.es, value: 'Mensaje para deshabilitada' }],
    },
    {
      name: 'orderSinglesEnabled',
      type: 'boolean',
      list: false,
      defaultValue: true,
      label: [{ languageCode: LanguageCode.es, value: 'Pedidos individuales (Beta)' }],
      ui: {
        tab: 'Ventas',
        component: 'select-form-input',
        options: [
          { label: [{ value: 'Restringido por consumidores', languageCode: LanguageCode.es }], value: false },
          { label: [{ value: 'Habilitados', languageCode: LanguageCode.es }], value: true },
        ],
      },
      description: [
        {
          languageCode: LanguageCode.es,
          value:
            'Pedidos individuales habilitados sin restricción, si deshabilita, puede habilitar de forma particular por consumidor/a',
        },
      ],
    },
    {
      name: 'messageOrderSinglesDisabled',
      type: 'string',
      defaultValue: 'Para poder comprar, comunícate con la tienda.',
      list: false,
      ui: {
        tab: 'Ventas',
        component: 'rich-text-form-input',
      },
      label: [{ languageCode: LanguageCode.es, value: 'Mensaje para pedidos individuales deshabilitados' }],
    },
    {
      name: 'orderGroupEnabled',
      type: 'boolean',
      list: false,
      defaultValue: false,
      label: [{ languageCode: LanguageCode.es, value: 'Pedidos en grupo (Beta)' }],
      ui: {
        tab: 'Ventas',
        component: 'select-form-input',
        options: [
          { label: [{ value: 'Restringido por consumidores', languageCode: LanguageCode.es }], value: false },
          { label: [{ value: 'Habilitados', languageCode: LanguageCode.es }], value: true },
        ],
      },
    },
    {
      name: 'emailStore',
      type: 'string',
      list: false,
      ui: {
        tab: 'Contacto',
      },
      label: [{ languageCode: LanguageCode.es, value: 'E-Mail para contacto' }],
    },
    {
      name: 'scheduleStore',
      type: 'string',
      list: false,
      ui: {
        tab: 'Contacto',
      },
      label: [{ languageCode: LanguageCode.es, value: 'Horario de atención' }],
    },
    {
      name: 'phoneStore',
      type: 'string',
      list: false,
      ui: {
        tab: 'Contacto',
      },
      label: [{ languageCode: LanguageCode.es, value: 'Teléfono' }],
    },
    {
      name: 'telegramStore',
      type: 'string',
      list: false,
      ui: {
        tab: 'Contacto',
      },
      label: [{ languageCode: LanguageCode.es, value: 'Usuario de Telegram' }],
    },
    {
      name: 'whatsappStore',
      type: 'string',
      list: false,
      ui: {
        tab: 'Contacto',
      },
      label: [{ languageCode: LanguageCode.es, value: 'Número de Whatsapp' }],
    },
    {
      name: 'rrssStore',
      type: 'string',
      list: true,
      ui: {
        tab: 'Redes sociales',
      },
      label: [{ languageCode: LanguageCode.es, value: 'Redes' }],
    },
    {
      name: 'bannersAboutUs',
      type: 'relation',
      entity: Asset,
      list: true,
      ui: {
        tab: 'Quienes Somos',
      },
      label: [{ languageCode: LanguageCode.es, value: 'Banner rotativo' }],
    },
    {
      name: 'imgSecondaryAboutUs',
      type: 'relation',
      entity: Asset,
      list: false,
      ui: {
        tab: 'Quienes Somos',
      },
      label: [{ languageCode: LanguageCode.es, value: 'Imagen secundaria' }],
    },
    {
      name: 'bodyAboutUs',
      type: 'text',
      list: false,
      ui: {
        tab: 'Quienes Somos',
        component: 'rich-text-form-input',
      },
      label: [{ languageCode: LanguageCode.es, value: 'Contenido' }],
    },
    {
      name: 'fromAddress',
      type: 'string',
      list: false,
      ui: {
        tab: 'Notificaciones',
      },
      label: [{ languageCode: LanguageCode.es, value: 'E-Mail para envio y avisos de compras' }],
      description: [
        {
          languageCode: LanguageCode.es,
          value:
            'Este email es el que se mostrará a los consumidores cuando se envien notificaciones de compras confirmadas',
        },
      ],
      validate: value => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'E-Mail no valido';
        }
      },
    },
  ],
};

export default customFieldsConfig;
