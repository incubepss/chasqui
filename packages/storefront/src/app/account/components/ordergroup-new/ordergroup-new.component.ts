import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, merge, Observable, of } from 'rxjs';
import { map, mapTo, switchMap, take } from 'rxjs/operators';

import {
  Address,
  CreateAddressInput,
  GetAvailableCountries,
  GetCustomerAddresses,
  GetShippingAddress,
  ShippingMethod,
  OrderGroup,
  CreateAddress,
} from '../../../common/generated-types';
import { GET_AVAILABLE_COUNTRIES, GET_CUSTOMER_ADDRESSES } from '../../../common/graphql/documents.graphql';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';

import { NotificationService } from '../../../core/providers/notification/notification.service';
import { DataService } from '../../../core/providers/data/data.service';
import { ModalService } from '../../../core/providers/modal/modal.service';
import { StateService } from '../../../core/providers/state/state.service';
import { AddressFormComponent } from '../../../shared/components/address-form/address-form.component';
import { AddressModalComponent } from '../../../shared/components/address-modal/address-modal.component';

import { OrderGroupService } from '../../../shared/services/order-group.service';
import { ShippingMethodService } from '../../../shared/services/shipping-method.service';
import {
  CHECK_CUSTOMER_ORDER,
  CREATE_ORDER_GROUP,
  GET_SHIPPING_ADDRESS,
  CANCEL_ORDER_GROUP,
  CREATE_ADDRESS,
} from './ordergroup-new.graphql';

export type AddressFormValue = Pick<Address.Fragment, Exclude<keyof Address.Fragment, 'country'>> & {
  countryCode: string;
};

@Component({
  selector: 'vsf-ordergroup-new',
  templateUrl: './ordergroup-new.component.html',
  styleUrls: ['./ordergroup-new.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderGroupNewComponent implements OnInit {
  @ViewChild('addressForm') addressForm: AddressFormComponent;
  @ViewChild('createGroupModal') createGroupModal: ElementRef;
  @ViewChild('btnContinue') btnContinue: ElementRef;

  customerAddresses$: Observable<Address.Fragment[]>;
  availableCountries$: Observable<GetAvailableCountries.AvailableCountries[]>;

  shippingMethods$: Observable<ShippingMethod[]>;
  loadingShippingMethods$: Observable<boolean>;

  shippingAddress$: Observable<GetShippingAddress.ShippingAddress | null | undefined>;
  signedIn$: Observable<boolean>;
  step: 'selectAddress' | 'editAddress' | 'selectMethod' | 'thanksStep' = 'selectMethod';

  canContinue$ = new BehaviorSubject(false);

  selectedMethod: any;
  selectedAddress: CreateAddressInput;
  selectedAddressId: any;

  isShowingThanks = false;
  orderGroup: OrderGroup;

  isBusy = false;

  constructor(
    private dataService: DataService,
    private stateService: StateService,
    private shippingMethodService: ShippingMethodService,
    private changeDetector: ChangeDetectorRef,
    private modalService: ModalService,
    private router: Router,
    private notificationService: NotificationService,
    private orderGroupService: OrderGroupService,
  ) {}

  ngOnInit() {
    this.signedIn$ = this.stateService.select(state => state.signedIn);

    this.customerAddresses$ = this.dataService
      .query<GetCustomerAddresses.Query>(GET_CUSTOMER_ADDRESSES, 'no-cache')
      .pipe(map(data => (data.activeCustomer ? data.activeCustomer.addresses || [] : [])));

    this.availableCountries$ = this.dataService
      .query<GetAvailableCountries.Query>(GET_AVAILABLE_COUNTRIES)
      .pipe(map(data => data.availableCountries));

    this.shippingAddress$ = this.dataService
      .query<GetShippingAddress.Query>(GET_SHIPPING_ADDRESS)
      .pipe(map(data => data.activeOrder && data.activeOrder.shippingAddress));

    this.shippingMethods$ = this.shippingMethodService.findShippingMethods().pipe(map(r => r.items));

    this.loadingShippingMethods$ = merge(of(true), this.shippingMethods$.pipe(mapTo(false)));

    combineLatest([this.signedIn$, this.customerAddresses$])
      .pipe(take(1))
      .subscribe(([signedIn, addresses]) => {
        this.step = 'selectMethod';
      });

    this.dataService.mutate<any>(CHECK_CUSTOMER_ORDER).pipe(take(1)).subscribe();
  }

  get skipStepAddress(): boolean {
    const selectedMethod = this.selectedMethod;
    // @ts-ignore
    return selectedMethod.customFields?.typeDelivery === 'showroom' || false;
  }

  get shippingMethodId(): string | undefined {
    return this.selectedMethod?.id;
  }

  get hasAddresses(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      this.customerAddresses$
        .pipe(take(1))
        .toPromise()
        .then(addresses => {
          resolve(addresses?.length > 0);
        }, reject);
    });
  }

  getLines(address: Address.Fragment): string[] {
    return [
      address.fullName,
      address.company,
      address.streetLine1,
      address.streetLine2,
      address.province,
      address.postalCode,
      address.country.name,
    ].filter(notNullOrUndefined);
  }

  createAddress() {
    this.modalService
      .fromComponent(AddressModalComponent, {
        locals: {
          title: 'Crear nueva dirección',
        },
        closable: true,
      })
      .pipe(
        switchMap(() =>
          this.dataService.query<GetCustomerAddresses.Query>(GET_CUSTOMER_ADDRESSES, null, 'network-only'),
        ),
      )
      .subscribe();
  }

  editAddress(address: Address.Fragment) {
    this.addressForm.addressForm.patchValue({ ...address, countryCode: address.country.code });
    this.step = 'editAddress';
  }

  async setShippingAddress(value: AddressFormValue | Address.Fragment) {
    if (!value.id) {
      this.createNewAddress(value as AddressFormValue);
      return;
    }

    this.selectedAddress = this.valueToAddressInput(value);
    this.selectedAddressId = value?.id;
    this.canContinue$.next(true);
  }

  async createNewAddress(value: AddressFormValue) {
    try {
      this.isBusy = true;
      this.changeDetector.markForCheck();
      const address = await this.saveNewAddress(value as AddressFormValue);

      this.selectedAddress = this.valueToAddressInput(address);
      this.selectedAddressId = value?.id;

      this.createOrderGroup();
    } catch (e) {
      this.notificationService.error('No se pudo crear la dirección. Contactá a soporte');
      return;
    } finally {
      this.isBusy = false;
      this.changeDetector.markForCheck();
    }
  }

  async saveNewAddress(value: AddressFormValue): Promise<Address.Fragment> {
    if (value) {
      delete value.company;
      delete value.streetLine2;
    }
    return this.dataService
      .mutate<CreateAddress.Mutation, CreateAddress.Variables>(CREATE_ADDRESS, {
        input: value,
      })
      .pipe(map(data => data.createCustomerAddress))
      .toPromise();
  }

  async clickOnShippingMethod(event: MouseEvent, method: ShippingMethod) {
    event.preventDefault();
    this.selectShippingMethod(method, true);
  }

  async selectShippingMethod(method: ShippingMethod, scroll: boolean = false) {
    this.selectedMethod = method;
    if (this.skipStepAddress && scroll) {
      this.setShippingAddress({
        id: '0',
        fullName: 'punto entrega: ' + method.name,
        // @ts-ignore
        streetLine1: method.customFields?.address_or_places || '',
        countryCode: 'AR',
      });
      return;
    }
    this.canContinue$.next(this.selectedAddressId > 0);

    this.step = (await this.hasAddresses) ? 'selectAddress' : 'editAddress';
    this.changeDetector.markForCheck();

    if (scroll) {
      setTimeout(() => {
        const elList = document.querySelectorAll('.card-direccion');
        const el = elList?.[0] as HTMLElement;
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  async createOrderGroup() {
    this.isBusy = true;
    this.changeDetector.markForCheck();
    this.dataService
      .mutate<any, any>(CREATE_ORDER_GROUP, {
        shippingMethodId: this.selectedMethod.id,
        address: this.selectedAddress,
      })
      .pipe(map(r => r.createOrderGroup))
      .toPromise()
      .then(r => {
        this.showThanks(r);
      })
      .catch(e => {
        this.notificationService.error(
          '¡uy! No se pudo crear el grupo. Comunícate con el soporte si el error persiste',
        );
      })
      .finally(() => {
        this.isBusy = false;
        this.changeDetector.markForCheck();
      });
  }

  async cancelOrderGroup(orderGroup: OrderGroup) {
    this.isBusy = true;
    this.changeDetector.markForCheck();
    this.dataService
      .mutate<any, any>(CANCEL_ORDER_GROUP, {
        orderGroupId: orderGroup.id,
      })
      .pipe(map(r => r.cancelOrderGroup))
      .toPromise()
      .then(r => {
        this.notificationService.success('Pedido grupal cancelado', 'Cancelado');
        this.router.navigateByUrl('/micuenta');
      })
      .catch(e => {
        this.notificationService.error(
          '¡uy! No se pudo cancelar el grupo. Comunicate con el soporte si el error persiste',
        );
      })
      .finally(() => {
        this.isBusy = false;
        this.changeDetector.markForCheck();
      });
  }

  showThanks(orderGroup: OrderGroup) {
    this.isShowingThanks = true;
    this.orderGroup = orderGroup;
    this.changeDetector.markForCheck();
    window.scroll(0, 0);
  }

  get shareUrl(): string {
    return this.orderGroupService.getShareUrlForGroup(this.orderGroup);
  }

  private valueToAddressInput(value: AddressFormValue | Address.Fragment): CreateAddressInput {
    return {
      city: value.city || '',
      company: value.company || '',
      countryCode: this.isFormValue(value) ? value.countryCode : value.country.code,
      defaultBillingAddress: value.defaultBillingAddress,
      defaultShippingAddress: value.defaultShippingAddress,
      fullName: value.fullName || '',
      phoneNumber: value.phoneNumber || '',
      postalCode: value.postalCode || '',
      province: value.province || '',
      streetLine1: value.streetLine1 || '',
      streetLine2: value.streetLine2 || '',
    };
  }

  private isFormValue(input: AddressFormValue | Address.Fragment): input is AddressFormValue {
    return typeof (input as any).countryCode === 'string';
  }
}
