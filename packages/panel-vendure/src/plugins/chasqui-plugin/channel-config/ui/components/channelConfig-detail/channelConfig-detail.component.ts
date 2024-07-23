import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  BaseDetailComponent,
  CustomFieldConfig,
  Permission,
  Channel,
  CurrencyCode,
  GetZones,
  LanguageCode,
  UpdateChannelInput,
  NotificationService,
  DataService,
  ServerConfigService,
} from '@vendure/admin-ui/core';
import { DEFAULT_CHANNEL_CODE } from '@vendure/common/lib/shared-constants';
import { Observable } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
@Component({
  selector: 'chq-channelConfig-detail',
  templateUrl: './channelConfig-detail.component.html',
  styleUrls: ['./channelConfig-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelConfigDetailComponent
  extends BaseDetailComponent<Channel.Fragment>
  implements OnInit, OnDestroy
{
  customFields: CustomFieldConfig[];
  zones$: Observable<GetZones.Zones[]>;
  detailForm: FormGroup;
  currencyCodes = Object.values(CurrencyCode);
  availableLanguageCodes$: Observable<LanguageCode[]>;
  readonly updatePermission = [Permission.UpdateChannel];

  constructor(
    router: Router,
    route: ActivatedRoute,
    protected serverConfigService: ServerConfigService,
    private changeDetector: ChangeDetectorRef,
    protected dataService: DataService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) {
    super(route, router, serverConfigService, dataService);
    this.customFields = this.getCustomFieldConfig('Channel');
    this.customFields = this.filterProtectedCustomFields(this.customFields);

    this.detailForm = this.formBuilder.group({
      code: ['', Validators.required],
      token: ['', Validators.required],
      pricesIncludeTax: [false],
      currencyCode: [''],
      defaultShippingZoneId: ['', Validators.required],
      defaultLanguageCode: [],
      defaultTaxZoneId: ['', Validators.required],
      customFields: this.formBuilder.group(
        this.customFields.reduce((hash, field) => ({ ...hash, [field.name]: '' }), {}),
      ),
    });
  }

  ngOnInit() {
    this.init();
    this.zones$ = this.dataService.settings.getZones().mapSingle(data => data.zones);
    this.availableLanguageCodes$ = this.serverConfigService.getAvailableLanguages();
  }

  ngOnDestroy() {
    this.destroy();
  }

  private filterProtectedCustomFields(customFields: CustomFieldConfig[]): CustomFieldConfig[] {
    return customFields.filter(cf => cf.name !== 'showOnMultitienda');
  }

  saveButtonEnabled(): boolean {
    return this.detailForm.dirty && this.detailForm.valid;
  }

  save() {
    if (!this.detailForm.dirty) {
      return;
    }
    const formValue = this.detailForm.value;
    this.entity$
      .pipe(
        take(1),
        mergeMap(channel => {
          const input = {
            id: channel.id,
            code: formValue.code,
            token: formValue.token,
            pricesIncludeTax: formValue.pricesIncludeTax,
            currencyCode: formValue.currencyCode,
            defaultShippingZoneId: formValue.defaultShippingZoneId,
            defaultLanguageCode: formValue.defaultLanguageCode,
            defaultTaxZoneId: formValue.defaultTaxZoneId,
            customFields: formValue.customFields,
          } as UpdateChannelInput;
          return this.dataService.settings.updateChannel(input);
        }),
      )
      .subscribe(({ updateChannel }) => {
        switch (updateChannel.__typename) {
          case 'Channel':
            this.notificationService.success(_('common.notify-update-success'), {
              entity: 'Channel',
            });
            this.detailForm.markAsPristine();
            this.changeDetector.markForCheck();
            break;
          case 'LanguageNotAvailableError':
            this.notificationService.error(updateChannel.message);
        }
      });
  }

  /**
   * Update the form values when the entity changes.
   */
  protected setFormValues(entity: Channel.Fragment): void {
    this.detailForm.patchValue({
      code: entity.code,
      token: entity.token || this.generateToken(),
      pricesIncludeTax: entity.pricesIncludeTax,
      currencyCode: entity.currencyCode,
      defaultShippingZoneId: entity.defaultShippingZone ? entity.defaultShippingZone.id : '',
      defaultLanguageCode: entity.defaultLanguageCode,
      defaultTaxZoneId: entity.defaultTaxZone ? entity.defaultTaxZone.id : '',
    });
    if (this.customFields.length) {
      this.setCustomFieldFormValues(this.customFields, this.detailForm.get(['customFields']), entity);
    }
    if (entity.code === DEFAULT_CHANNEL_CODE) {
      const codeControl = this.detailForm.get('code');
      if (codeControl) {
        codeControl.disable();
      }
    }
  }

  private generateToken(): string {
    const randomString = () => Math.random().toString(36).substr(3, 10);
    return `${randomString()}${randomString()}`;
  }
}
