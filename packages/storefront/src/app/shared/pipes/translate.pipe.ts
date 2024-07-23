/* eslint-disable @typescript-eslint/naming-convention */
import { Pipe, PipeTransform } from '@angular/core';

// todo: move this to json file
const DEFAULTS_ES: { [key: string]: string } = {
  agricultura_familiar: 'Agricultura familiar',
  cooperativas: 'Cooperativas',
  empresa_social: 'Empresa Social',
  recuperadas: 'Recuperadas',
};

@Pipe({
  name: 'translate',
})
export class TranslatePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }
    return DEFAULTS_ES[value] || value;
  }
}
