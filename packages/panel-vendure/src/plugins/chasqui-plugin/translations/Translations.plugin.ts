import { OnApplicationBootstrap } from '@nestjs/common';
import { I18nService, PluginCommonModule, VendurePlugin } from '@vendure/core';

import es_core_json from '../../../translations/es_core.json';

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [I18nService],
})
export class TranslationsPlugin implements OnApplicationBootstrap {
  constructor(private i18nService: I18nService) {}

  onApplicationBootstrap(): any {
    this.i18nService.addTranslation('es', es_core_json);
  }
}
