import { normalizeString } from '@vendure/common/lib/normalize-string';
import { Injectable } from '@nestjs/common';
import { Channel, ID, Logger, RequestContext } from '@vendure/core';

import { ProductorOdoo } from '../odoo.service.d';

import { ProductorService } from './../../../productores/services/ProductorService';

@Injectable()
export class ProductorImporter {
  channel: Channel;
  ctx: RequestContext;

  constructor(private productorService: ProductorService) {}

  async importProductor(productor: ProductorOdoo, channel: Channel): Promise<ID | undefined> {
    const slug = this.makeSlug(productor);
    let producer = await this.productorService.findOneBySlug(RequestContext.empty(), slug);

    if (!producer) {
      producer = await this.createProducer(productor, channel);
    }

    return producer?.id;
  }

  protected makeSlug(productor: ProductorOdoo): string {
    return normalizeString(productor.nombre + ' ' + productor.id, '-');
  }

  async createProducer(productor: ProductorOdoo, channel: Channel) {
    Logger.info(
      `Creando Productor en canal ${channel.id} <= ${productor.id}  ${productor.nombre}`,
      'ImporterOdoo',
    );
    const ctx = new RequestContext({
      channel: channel,
      apiType: 'admin',
      isAuthorized: true,
      authorizedAsOwnerOnly: false,
      session: {} as any,
    });

    let direccion = productor.calle;
    if (productor.altura) {
      direccion = direccion + ' ' + productor.altura;
    }

    const sellos: Array<string> = [];
    if (productor.CARACTERISTICA_PRODUCTOR) {
      sellos.push(normalizeString(productor.CARACTERISTICA_PRODUCTOR.nombre, '_'));
    }

    let descriptionOffered = productor.descripcion_corta;
    if (descriptionOffered.length > 255) {
      descriptionOffered = descriptionOffered.slice(0, 254);
    }

    return this.productorService.create(ctx, {
      name: productor.nombre,
      slug: this.makeSlug(productor),
      enabled: true,
      descriptionOffered: descriptionOffered,
      description: productor.descripcion_larga,
      pais: productor.pais,
      provincia: productor.provincia,
      localidad: productor.localidad,
      direccion,
      sellos,
      linksRRSS: [],
    });
  }
}
