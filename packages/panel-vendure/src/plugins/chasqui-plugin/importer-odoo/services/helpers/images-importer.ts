/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { Logger, Asset, RequestContext, ChannelService, Channel, ConfigService } from '@vendure/core';
import { AssetImporter } from '@vendure/core/dist/data-import/providers/asset-importer/asset-importer';
import { Imagen } from '../odoo.service.d';

export type FacetImporterInput = {
  facet: string;
  value: string;
};

@Injectable()
export class ImagesImporter {
  constructor(
    private channelService: ChannelService,
    private assetImporter: AssetImporter,
    private configService: ConfigService,
  ) {}

  async importAssets(imagenes: Imagen[], channel: Channel): Promise<Asset[]> {
    let assets: Asset[];
    try {
      const remoteImages = this.filterExcludeNoDisponible(imagenes);

      const pathImages = await this.downloadImages(remoteImages);

      const { assetNamingStrategy } = this.configService.assetOptions;

      // @ts-ignore
      if (assetNamingStrategy.setContextImportChannel) {
        // @ts-ignore
        assetNamingStrategy.setContextImportChannel(channel);
      }

      const createProductAssets = await this.assetImporter.getAssets(pathImages);
      assets = createProductAssets.assets;
      if (assets.length) {
        await Promise.all(
          assets.map(asset => {
            return this.channelService.assignToChannels(RequestContext.empty(), Asset, asset.id, [
              channel.id,
            ]);
          }),
        );
      }
    } catch (e: any) {
      Logger.error(e.message, e);
      throw e;
    }
    return assets;
  }

  private filterExcludeNoDisponible(images: Array<Imagen>): Array<Imagen> {
    return images.filter(image => !this.isNodisponible(image.name));
  }

  // aca tengo que cambiar la función para verificar si la imagen ya existe
  private isNodisponible(value: string): boolean {
    return !value || /no([-| ])?disponible/gi.test(value);
  }

  private async downloadImages(images: Array<Imagen>): Promise<string[]> {
    return Promise.all(
      images.map(image => {
        const outputLocationPath = this.configService.importExportOptions.importAssetsDir + '/' + image.name;
        return this.downloadFileBase64(image.base64String, outputLocationPath, image.name);
      }),
    );
  }

  private async downloadFileBase64(
    base64String: string,
    outputLocationPath: string,
    imageName: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const imageBuffer = Buffer.from(base64String, 'base64');

      fs.writeFile(outputLocationPath, imageBuffer, err => {
        if (err) {
          console.error('Error al guardar la imagen:', err);
          reject(err); // Rechazar la promesa con el error
          return;
        }
        console.log('Imagen guardada correctamente en:', outputLocationPath);
        resolve(imageName); // Resuelve la promesa con el nombre de la imagen
      });
    });
  }
}
