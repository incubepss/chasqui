import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, NotificationService, ServerConfigService } from '@vendure/admin-ui/core';
import { map } from 'rxjs/operators';

import { CREATE_TIENDA } from './tienda-creator.graphql';

@Component({
  selector: 'tienda-creator',
  templateUrl: './tienda-creator.html',
  styleUrls: ['./tienda-creator.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TiendaCreatorComponent {
  detailForm: FormGroup;

  provinces: string[] = [
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

  constructor(
    route: ActivatedRoute,
    router: Router,
    serverConfigService: ServerConfigService,
    private formBuilder: FormBuilder,
    protected dataService: DataService,
    private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {
    this.detailForm = this.formBuilder.group({
      code: ['', Validators.required],
      token: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      emailAdmin: ['', [Validators.required, Validators.email]],
      nameAdmin: ['', Validators.required],
      lastNameAdmin: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  saveButtonEnabled(): boolean {
    return this.detailForm.dirty && this.detailForm.valid;
  }

  create() {
    const formValue = this.detailForm.value;

    const input = {
      code: formValue.code,
      token: formValue.token,
      city: formValue.city,
      province: formValue.province,
      emailAdmin: formValue.emailAdmin,
      nameAdmin: formValue.nameAdmin,
      lastNameAdmin: formValue.lastNameAdmin,
      password: formValue.password,
    };

    this.dataService
      .mutate<any, any>(CREATE_TIENDA, {
        input,
      })
      .pipe(map(result => result.createTienda))
      .subscribe(
        data => {
          switch (data.__typename) {
            case 'Channel':
              this.notificationService.success('Tienda creada!');
              this.detailForm.reset();
              break;
            case 'CreateTiendaError':
              this.notificationService.error(data.friendlyMessage || data.message);
              break;
            case 'LanguageNotAvailableError':
              this.notificationService.error(data.message);
              break;
          }
        },
        (e: any) => {
          console.error(e);
          this.notificationService.error('common.notify-create-error', {
            entity: 'Tienda',
          });
        },
      );
  }
}
