import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CustomFieldConfig } from '@vendure/common/lib/generated-types';
import { FormInputComponent, ModalService } from '@vendure/admin-ui/core';

import { GeolocationDialog } from '../geolocation-dialog/geolocation.dialog';

@Component({
  templateUrl: './geolocation-input.component.html',
  styleUrls: ['./geolocation-input.component.scss'],
})
export class GeolocationInputComponent implements FormInputComponent<CustomFieldConfig> {
  readonly: boolean;
  config: CustomFieldConfig;
  formControl: FormControl;

  constructor(private modalService: ModalService) {}

  get mode(): 'point' | 'zone' {
    const typeDelivery = this.formControl.parent?.value?.typeDelivery;
    let result: 'point' | 'zone' = 'point';
    if (typeDelivery) {
      result = typeDelivery === 'shipping' ? 'zone' : 'point';
    } else {
      result = this.config.ui?.mode || 'point';
    }
    return result;
  }

  doSelect() {
    this.modalService
      .fromComponent(GeolocationDialog, {
        size: 'xl',
        closable: true,
        locals: {
          mode: this.mode,
          value: this.formControl.value,
        } as any,
      })
      .subscribe(response => {
        if (response === false || response === undefined) {
          return;
        }
        this.formControl.setValue(response);
        this.formControl.markAsDirty();
      });
  }

  doClear() {
    this.formControl.setValue('');
    this.formControl.markAsDirty();
  }
}
