import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CustomFieldConfig } from '@vendure/common/lib/generated-types';
import { FormInputComponent } from '@vendure/admin-ui/core';

@Component({
  template: ` <span></span> `,
})
export class DummyInput implements FormInputComponent<CustomFieldConfig> {
  readonly: boolean;
  config: CustomFieldConfig;
  formControl: FormControl;
}
