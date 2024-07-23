import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BaseDetailComponent,
  DataService,
  NotificationService,
  ServerConfigService,
  RelationCustomFieldConfig,
  unicodePatternValidator,
} from '@vendure/admin-ui/core';
import { normalizeString } from '@vendure/common/lib/normalize-string';
import { Observable, of } from 'rxjs';
import { filter, mapTo } from 'rxjs/operators';

//import { Productor, ProductorAddInput, ProductorUpdateInput } from '../../../generated-types2';

type Productor = any;
type ProductorAddInput = any;
type ProductorUpdateInput = any;

import { CREATE_PRODUCTOR, UPDATE_PRODUCTOR } from './productor-editor.graphql';

const URL_PATTERN = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

@Component({
  selector: 'productor-editor',
  templateUrl: './productor-editor.html',
  styleUrls: ['./productor-editor.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ProductorEditorComponent extends BaseDetailComponent<Productor> implements OnInit, OnDestroy {
  detailForm: FormGroup;

  configLogo: RelationCustomFieldConfig = {
    name: 'logo',
    type: 'Asset',
    entity: 'Asset',
    list: false,
    scalarFields: [],
  };

  get linksRRSS() {
    return this.detailForm.get('linksRRSS') as FormArray;
  }

  addLinkRRSS(value = '') {
    const control = new FormControl(value, Validators.pattern(URL_PATTERN));
    this.linksRRSS.push(control);
    this.detailForm.markAsDirty();
  }

  removeLinkRRSS(index: number): void {
    this.linksRRSS.removeAt(index);
    this.detailForm.markAsDirty();
  }

  constructor(
    route: ActivatedRoute,
    router: Router,
    serverConfigService: ServerConfigService,
    private formBuilder: FormBuilder,
    protected dataService: DataService,
    private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {
    super(route, router, serverConfigService, dataService);

    this.detailForm = this.formBuilder.group({
      enabled: true,
      name: ['', Validators.required],
      slug: ['', unicodePatternValidator(/^[\p{Letter}0-9_-]+$/)],
      descriptionOffered: '',
      description: '',
      sellos: '',
      logo: '',
      banner: '',
      pais: 'Argentina',
      provincia: '',
      localidad: '',
      direccion: '',
      webUrl: ['', Validators.pattern(URL_PATTERN)],
      email: ['', Validators.email],
      linksRRSS: this.formBuilder.array([]),
    });
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    this.destroy();
  }

  create(): void {
    if (!this.detailForm.dirty) {
      return;
    }

    const input = this.getValueVendor();

    this.dataService
      .mutate<
        any, //CreateVendor.Mutation,
        any //CreateVendor.Variables
      >(CREATE_PRODUCTOR, {
        input,
      })
      .subscribe(
        data => {
          this.notificationService.success('common.notify-create-success', {
            entity: 'Productor',
          });
          this.detailForm.markAsPristine();
          this.changeDetector.markForCheck();
          this.router.navigate(['../', data.addProductor.id], { relativeTo: this.route });
        },
        () => {
          this.notificationService.error('common.notify-create-error', {
            entity: 'Productor',
          });
        },
      );
  }

  onChangeSellos(selection): void {
    this.detailForm.patchValue({ sellos: selection });
    this.detailForm.markAsDirty();
  }

  updateSlug(nameValue: string) {
    const slugControl = this.detailForm.get('slug');
    const isCurrentEmpty = !slugControl?.value || true;
    if (slugControl && slugControl.pristine && isCurrentEmpty) {
      slugControl.setValue(normalizeString(`${nameValue}`, '-'));
    }
  }

  save(): void {
    this.saveChanges()
      .pipe(filter(result => !!result))
      .subscribe(
        () => {
          this.detailForm.markAsPristine();
          this.changeDetector.markForCheck();
          this.notificationService.success('common.notify-update-success', {
            entity: 'Productor',
          });
        },
        () => {
          this.notificationService.error('common.notify-update-error', {
            entity: 'Productor',
          });
        },
      );
  }

  private getValueVendor(): any {
    const formValue = this.detailForm.value;

    const productor: Partial<ProductorAddInput | ProductorUpdateInput> = {
      enabled: formValue.enabled,
      name: formValue.name,
      slug: formValue.slug,
      description: formValue.description,
      descriptionOffered: formValue.descriptionOffered,
      sellos: formValue.sellos,
      logoId: formValue.logo?.id || null,
      bannerId: formValue.banner?.id || null,
      pais: formValue.pais,
      provincia: formValue.provincia,
      localidad: formValue.localidad,
      direccion: formValue.direccion,
      webUrl: formValue.webUrl,
      email: formValue.email,
      linksRRSS: formValue.linksRRSS,
    };

    return productor;
  }

  private saveChanges(): Observable<boolean> {
    if (!this.detailForm.dirty) {
      return of(false);
    }

    const input = this.getValueVendor();
    input.id = this.id;

    return this.dataService
      .mutate<
        any, //UpdateVendor.Mutation,
        any //UpdateVendor.Variables
      >(UPDATE_PRODUCTOR, {
        input,
      })
      .pipe(mapTo(true));
  }

  protected setFormValues(entity: Productor): void {
    this.detailForm.patchValue({
      enabled: entity.enabled,
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      descriptionOffered: entity.descriptionOffered,
      sellos: entity.sellos,
      banner: entity.banner,
      logo: entity.logo,
      pais: entity.pais,
      provincia: entity.provincia,
      localidad: entity.localidad,
      direccion: entity.direccion,
      webUrl: entity.webUrl,
      email: entity.email,
    });
    this.linksRRSS.clear();
    entity.linksRRSS?.forEach(link => {
      this.addLinkRRSS(link);
    });
  }
}
