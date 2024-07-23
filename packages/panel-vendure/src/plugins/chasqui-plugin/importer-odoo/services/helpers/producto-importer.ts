import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Channel,
  ChannelService,
  ID,
  Logger,
  RequestContext,
  ProductVariantService,
  ProductService,
  Product,
  Translated,
  FacetValue,
  Facet,
} from '@vendure/core';
import { normalizeString } from '@vendure/common/lib/normalize-string';
import { FastImporterService } from '@vendure/core/dist/data-import/providers/importer/fast-importer.service';

import { OdooProduct, Imagen } from '../odoo.service.d';
import { OdooService } from '../odoo.service';
import { DEFAULT_LANGUAGE_CODE, ODOO_PARAMS } from '../paramsContext';
import { FacetImporter } from './facet-importer';
import { ImagesImporter } from './images-importer';
import { ProductorImporter } from './productor-importer';

@Injectable()
export class ProductoImporter implements OnModuleInit {
  channel: Channel;
  ctxGlobal: RequestContext;

  constructor(
    private channelService: ChannelService,
    private fastImporter: FastImporterService,
    private productService: ProductService,
    private productVariantService: ProductVariantService,

    private chasqu1Service: OdooService,
    private facetImporter: FacetImporter,
    private imagesImporter: ImagesImporter,
    private productorImporter: ProductorImporter,
  ) {}

  async onModuleInit() {
    Logger.info('ProductoImporterService: initialize fastImporter');
  }

  async importProduct(odooProduct: OdooProduct, idChannel: ID) {
    // inicializa contexto, canal e importador
    const channel = await this.getChannel(idChannel);
    if (!channel) {
      throw new Error('Canal no encontrado ' + idChannel);
    }

    this.channel = channel;
    await this.fastImporter.initialize(channel);

    this.ctxGlobal = new RequestContext({
      channel: await this.channelService.getDefaultChannel(), // atenti, tiene que ser el canal por defecto
      apiType: 'admin',
      isAuthorized: true,
      authorizedAsOwnerOnly: false,
      session: {
        user: {
          id: 1, // harcodeado el superadmin para que no patee servicios como assignProductVariantsToChannel
        },
      } as any,
    });

    const ctxChannel = new RequestContext({
      channel: this.channel,
      apiType: 'admin',
      isAuthorized: true,
      authorizedAsOwnerOnly: false,
      session: {
        user: {
          id: 1, // harcodeado el superadmin para que no patee servicios como assignProductVariantsToChannel
        },
      } as any,
    });

    // Check if the producto of odoo has been imported yet
    const product = await this.findProduct(odooProduct, channel);
    if (product) {
      await this.updateProducto(ctxChannel, odooProduct, product);
      const result = 'Producto already imported on ' + product.createdAt;
      Logger.warn(result);
      return result;
    }

    try {
      const idProduct: ID = await this.saveProducto(ctxChannel, odooProduct);
      const result = `Product imported from odoo: ${odooProduct.id} => ${idProduct} (${odooProduct.name})`;
      Logger.info(result);
      return result;
    } catch (e: any) {
      const errorMsg = e.message;
      console.error(e);
      throw new Error(errorMsg);
    }
  }

  async getChannel(idChannel: ID): Promise<Channel | undefined> {
    const ctx = RequestContext.empty();
    return this.channelService.findOne(ctx, idChannel);
  }

  async saveProducto(ctxChannel: RequestContext, odooProduct: OdooProduct): Promise<ID> {
    // importar productor
    // const variante = producto.VARIANTEs[0];
    //const productorId = await this.productorImporter.importProductor(producto.PRODUCTOR, this.channel);

    // importar imagenes
    const assets = await this.importAssets(odooProduct);

    // importar categoria facetas
    const facetValueIds = await this.facetImporter.importFacetValues(odooProduct, this.channel);

    // importar producto
    const product = await this.productService.create(ctxChannel, {
      enabled: true,
      featuredAssetId: assets.length ? assets[0].id : undefined,
      assetIds: assets?.map(a => a.id),
      facetValueIds: facetValueIds,
      // customFields: {
      //   productorId: productorId,
      // },
      translations: [
        {
          languageCode: DEFAULT_LANGUAGE_CODE,
          name: odooProduct.name,
          description: odooProduct.product_tooltip,
          slug: this.slugMaker(odooProduct.barcode, this.channel),
        },
      ],
    });

    //const incentivo = Math.round(variante.incentivo * 100);

    // importar variante
    const productVariantId = await this.fastImporter.createProductVariant({
      productId: product.id,
      sku: odooProduct.barcode,
      taxCategoryId: this.taxCategory(odooProduct.taxes_id[0]),
      stockOnHand: odooProduct.qty_available,
      facetValueIds: facetValueIds,
      //featuredAssetId: assets.length ? assets[0].id : undefined,
      //assetIds: assets?.map(a => a.id),
      translations: [
        {
          languageCode: DEFAULT_LANGUAGE_CODE,
          name: odooProduct.name,
        },
      ],
      price: Math.floor(odooProduct.list_price * 100),
      // customFields: {
      //   incentivo,
      // },
    });

    // ASIGNA LA VARIANTE (y el producto) AL CANAL
    await this.productVariantService.assignProductVariantsToChannel(this.ctxGlobal, {
      channelId: this.channel.id,
      productVariantIds: [productVariantId],
      priceFactor: 1,
    });

    return product.id;
  }

  taxCategory = (odooTaxId: number): number => {
    const odooParams = JSON.parse((this.channel.customFields as any).odooParams).iva;
    const iva: [number, number][] = odooParams ? odooParams : JSON.parse(ODOO_PARAMS).iva;

    const taxCategory = iva.find(tax => tax[0] === odooTaxId);
    return taxCategory ? taxCategory[1] : 3; // return 3 if tax category ID is not found
  };

  async updateProducto(
    ctxChannel: RequestContext,
    odooProduct: OdooProduct,
    alreadyProduct: Translated<Product>,
  ): Promise<Translated<Product>> {
    Logger.info(`Actualizando producto ${alreadyProduct.id} ${alreadyProduct.name}`);
    //const productorId = await this.productorImporter.importProductor(odooProduct.PRODUCTOR, this.channel);

    const id: ID = alreadyProduct.id;

    // importar imagenes
    const assets = alreadyProduct.featuredAsset
      ? [alreadyProduct.featuredAsset]
      : await this.importAssets(odooProduct);

    const product = await this.productService.update(ctxChannel, {
      id,
      enabled: true,
      featuredAssetId: assets.length ? assets[0].id : undefined,
      assetIds: assets?.map(a => a.id),
      translations: [
        {
          languageCode: DEFAULT_LANGUAGE_CODE,
          name: odooProduct.name,
          description: odooProduct.product_tooltip,
          slug: this.slugMaker(odooProduct.barcode, this.channel),
        },
      ],
    });
    await this.updateProductVariante(ctxChannel, odooProduct, alreadyProduct);

    return product;
  }

  async updateProductVariante(
    ctxChannel: RequestContext,
    odooProduct: OdooProduct,
    alreadyProduct: Translated<Product>,
  ): Promise<any> {
    const variants = await this.productVariantService.getVariantsByProductId(
      this.ctxGlobal,
      alreadyProduct.id,
      {
        filter: { sku: { eq: odooProduct.barcode } },
      },
    );
    if (variants.totalItems > 0) {
      const variant = variants.items[0];
      //const incentivo = Math.round(variante.incentivo * 100);
      const newPrice = Math.floor(odooProduct.list_price * 100);
      Logger.info(`Actualizando precio y stock de variante sku ${odooProduct.barcode} a precio: ${newPrice}`);

      await this.productVariantService.update(ctxChannel, [
        {
          id: variant.id,
          sku: odooProduct.barcode,
          taxCategoryId: this.taxCategory(odooProduct.taxes_id[0]),
          price: newPrice,
          stockOnHand: odooProduct.qty_available,
          translations: [
            {
              languageCode: DEFAULT_LANGUAGE_CODE,
              name: odooProduct.name,
            },
          ],
          // customFields: {
          //   incentivo,
          // },
        },
      ]);
    }
  }

  async verifyAssignProductToChannel(product: Product, channel: Channel): Promise<any> {
    // verify if product is assigned to the channel
    const isAlreadyAssigned = product.channels.find(c => c.id === channel.id) !== undefined;

    if (!isAlreadyAssigned) {
      await this.verifyAssignProductFacetsToChannel(product, channel);
      const variants = await this.productVariantService.getVariantsByProductId(this.ctxGlobal, product.id);
      await this.productService.assignProductsToChannel(this.ctxGlobal, {
        channelId: channel.id,
        productIds: [product.id],
      });

      await this.productVariantService.assignProductVariantsToChannel(this.ctxGlobal, {
        channelId: this.channel.id,
        productVariantIds: variants.items.map(v => v.id),
        priceFactor: 1,
      });
    }
  }

  async verifyAssignProductFacetsToChannel(product: Product, channel: Channel): Promise<any> {
    const facetsIds: ID[] = [];
    let facetValues = await this.productService.getFacetValuesForProduct(this.ctxGlobal, product.id);

    facetValues = facetValues.filter(fv => {
      const notAssigned = fv.channels.find(c => c.id === channel.id) === undefined;
      const idFacet = fv.facet.id;
      if (facetsIds.indexOf(idFacet) === -1) {
        facetsIds.push(fv.facet.id);
      }
      return notAssigned;
    });

    await Promise.all(
      facetValues.map(facetValue => {
        return this.channelService.assignToChannels(this.ctxGlobal, FacetValue, facetValue.id, [channel.id]);
      }),
    );

    await Promise.all(
      facetsIds.map(facetId => {
        return this.channelService.assignToChannels(this.ctxGlobal, Facet, facetId, [channel.id]);
      }),
    );
  }

  private findProduct(odooProduct: OdooProduct, channel: Channel) {
    return this.productService.findOneBySlug(this.ctxGlobal, this.slugMaker(odooProduct.barcode, channel));
  }

  private slugMaker(barcode: string, channel: Channel): string {
    const channelCode = channel.code;
    return normalizeString(`${channelCode}-odoo-${barcode}`, '-').replace(/[^a-z0-9-]/g, '');
  }

  private async importAssets(odooProduct: OdooProduct) {
    const featuredAsset: Imagen[] =
      odooProduct.image_128 !== 'false'
        ? [
            {
              id: odooProduct.id,
              name: odooProduct.barcode + '.jpg',
              base64String: odooProduct.image_128,
            },
          ]
        : [];
    return await this.imagesImporter.importAssets(featuredAsset, this.channel);
  }
}
