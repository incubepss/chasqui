import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BaseDetailComponent,
  DataService,
  NotificationService,
  ServerConfigService,
} from '@vendure/admin-ui/core';
import { Observable, of } from 'rxjs';
import { filter, mapTo } from 'rxjs/operators';

import { CustomSurcharge, CustomSurchargeAddInput, CustomSurchargeUpdateInput } from '../../generated-types';

import { CREATE_SURCHARGE, UPDATE_SURCHARGE } from './customSurcharge-detail.graphql';

@Component({
  selector: 'pe-customSurcharge-detail',
  templateUrl: './customSurcharge-detail.component.html',
  styleUrls: ['./customSurcharge-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CustomSurchargeDetailComponent extends BaseDetailComponent<CustomSurcharge> implements OnInit {
  detailForm: FormGroup;

  forRemove: Array<any> = [];

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
      name: ['', Validators.required],
      question: ['', Validators.required],
      enabled: [true],
      options: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.init();
  }

  get options() {
    return this.detailForm.get('options') as FormArray;
  }

  addOption(option: any = null): void {
    const optionGroup = this.formBuilder.group({
      id: option?.id || undefined,
      description: [option?.description || '', Validators.required],
      listPrice: [option?.listPrice || 0],
    });
    this.options.push(optionGroup);
    this.detailForm.markAsDirty();
  }

  removeOption(index: number): void {
    const opt = this.options.at(index).value;
    if (opt?.id) {
      opt.flagRemove = true;
      this.forRemove.push(opt);
    }
    this.options.removeAt(index);
    this.detailForm.markAsDirty();
  }

  create(): void {
    if (!this.detailForm) {
      return;
    }
    const formValue = this.detailForm.value;
    const options = formValue.options?.map(opt => {
      delete opt.id;
      return opt;
    });
    const example: CustomSurchargeAddInput = {
      enabled: true,
      name: formValue.name,
      question: formValue.question,
      options: options,
    };
    this.dataService.mutate(CREATE_SURCHARGE, { input: example }).subscribe(
      (data: any) => {
        this.notificationService.success('common.notify-create-success', {
          entity: 'Cargo adicional',
        });
        this.detailForm.markAsPristine();
        this.changeDetector.markForCheck();
        this.router.navigate(['../', data.addCustomSurcharge.id], { relativeTo: this.route });
      },
      () => {
        this.notificationService.error('common.notify-create-error', {
          entity: 'Cargo adicional',
        });
      },
    );
  }

  save(): void {
    this.saveChanges()
      .pipe(filter(result => !!result))
      .subscribe(
        () => {
          this.detailForm.markAsPristine();
          this.changeDetector.markForCheck();
          this.notificationService.success('common.notify-update-success', {
            entity: 'Cargo adicional',
          });
        },
        () => {
          this.notificationService.error('common.notify-update-error', {
            entity: 'Cargo adicional',
          });
        },
      );
  }

  private saveChanges(): Observable<boolean> {
    if (this.detailForm.dirty) {
      const formValue = this.detailForm.value;

      const options = formValue.options.concat(this.forRemove);

      const input: CustomSurchargeUpdateInput = {
        id: this.id,
        name: formValue.name,
        question: formValue.question,
        enabled: formValue.enabled,
        options: options,
      };
      return this.dataService
        .mutate(UPDATE_SURCHARGE, {
          input,
        })
        .pipe(mapTo(true));
    } else {
      return of(false);
    }
  }

  protected setFormValues(entity: CustomSurcharge): void {
    this.detailForm.patchValue({
      enabled: entity.enabled,
      name: entity.name,
      question: entity.question,
    });
    this.options.clear();
    this.forRemove = [];
    entity.options?.forEach(option => {
      this.addOption(option);
    });
  }
}
