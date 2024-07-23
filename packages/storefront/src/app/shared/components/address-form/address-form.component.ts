import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Address, Country, OrderAddress } from '../../../common/generated-types';
import { DEFAULT_COUNTRY_CODE } from './../../../../environments/environment';

@Component({
  selector: 'vsf-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent implements OnChanges {
  @Input() availableCountries: Country.Fragment[];
  @Input() address: OrderAddress.Fragment | Address.Fragment;

  provicias: string[] = [
    'Buenos Aires',
    'C.A.B.A',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán',
  ];

  addressForm: FormGroup;
  constructor(private formBuilder: FormBuilder) {
    this.addressForm = this.formBuilder.group({
      fullName: '',
      company: '',
      streetLine1: ['', Validators.required],
      streetLine2: '',
      city: ['', Validators.required],
      province: ['', Validators.required],
      postalCode: ['', Validators.required],
      countryCode: [DEFAULT_COUNTRY_CODE],
      phoneNumber: '',
    });
  }

  hasError(controlName: string): boolean {
    const ctrl = this.addressForm.get(controlName);
    return (ctrl?.invalid && ctrl?.touched) || false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('address' in changes && this.addressForm && this.address) {
      this.addressForm.patchValue(this.address, {});
    }
  }
}
