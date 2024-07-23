import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, merge, Observable, of, Subscription } from 'rxjs';
import { map, mapTo, mergeMap, switchMap, take, tap } from 'rxjs/operators';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Address,
  CreateAddressInput,
  GetOrderForCheckout,
  GetAvailableCountries,
  GetCustomerAddresses,
  GetEligibleShippingMethods,
  GetShippingAddress,
  SetShippingAddress,
  SetShippingMethod,
  OrderGroup,
} from '../../../common/generated-types';
import { GET_AVAILABLE_COUNTRIES, GET_CUSTOMER_ADDRESSES } from '../../../common/graphql/documents.graphql';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';

import { NotificationService } from '../../../core/providers/notification/notification.service';
import { DataService } from '../../../core/providers/data/data.service';
import { ModalService } from '../../../core/providers/modal/modal.service';
import { StateService } from '../../../core/providers/state/state.service';
import { AddressFormComponent } from '../../../shared/components/address-form/address-form.component';
import { AddressModalComponent } from '../../../shared/components/address-modal/address-modal.component';

import { CheckoutStoreService } from '../../providers/checkout.store.service';
import { CartManager } from './../../../shared/services/cart.manager';
import { ConfirmUnsetGroupModalComponent } from './confirm-unsetgroup-modal.component';
import { OrderGroupService } from './../../../shared/services/order-group.service';
import {
  ASSIGN_ORDER_TO_GROUP,
  CHECK_CUSTOMER_ORDER,
  GET_ELIGIBLE_SHIPPING_METHODS,
  GET_SHIPPING_ADDRESS,
  SET_SHIPPING_ADDRESS,
  SET_SHIPPING_METHOD,
} from './checkout-shipping.graphql';

export type AddressFormValue = Pick<Address.Fragment, Exclude<keyof Address.Fragment, 'country'>> & {
  countryCode: string;
};

@Component({
  selector: 'vsf-checkout-shipping',
  templateUrl: './checkout-shipping.component.html',
  styleUrls: ['./checkout-shipping.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutShippingComponent implements OnInit {
  @ViewChild('addressForm') addressForm: AddressFormComponent;
  @ViewChild('createGroupModal') createGroupModal: ElementRef;
  @ViewChild('btnContinue') btnContinue: ElementRef;

  cart$: Observable<GetOrderForCheckout.ActiveOrder | null | undefined>;
  customerAddresses$: Observable<Address.Fragment[]>;
  availableCountries$: Observable<GetAvailableCountries.AvailableCountries[]>;
  eligibleShippingMethods$: Observable<GetEligibleShippingMethods.EligibleShippingMethods[]>;
  loadingShippingMethods$: Observable<boolean>;
  shippingAddress$: Observable<GetShippingAddress.ShippingAddress | null | undefined>;
  signedIn$: Observable<boolean>;
  step: 'selectAddress' | 'editAddress' | 'selectMethod' | 'orderGroupStep' = 'selectMethod';

  orderGroupEnabled$: Observable<boolean>;
  orderSinglesAllowed$: Observable<boolean>;

  activeOrderGroups$: Observable<OrderGroup[]>;

  isOrderHeadOfGroup$: Observable<boolean>;
  isOrderPartOfGroup$: Observable<boolean>;
  orderGroup$: Observable<OrderGroup>;

  canContinue$ = new BehaviorSubject(false);

  constructor(
    private dataService: DataService,
    private stateService: StateService,
    private cartManager: CartManager,
    private checkoutStore: CheckoutStoreService,
    private changeDetector: ChangeDetectorRef,
    private modalService: ModalService,
    private modalNgbService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private orderGroupService: OrderGroupService,
  ) {}

  ngOnInit() {
    this.signedIn$ = this.stateService.select(state => state.signedIn);
    this.orderSinglesAllowed$ = this.cartManager.orderSinglesAllowed$;

    this.orderGroupEnabled$ = this.cartManager.orderGroupsAllowed$;

    this.customerAddresses$ = this.dataService
      .query<GetCustomerAddresses.Query>(GET_CUSTOMER_ADDRESSES)
      .pipe(map(data => (data.activeCustomer ? data.activeCustomer.addresses || [] : [])));

    this.availableCountries$ = this.dataService
      .query<GetAvailableCountries.Query>(GET_AVAILABLE_COUNTRIES)
      .pipe(map(data => data.availableCountries));

    this.shippingAddress$ = this.dataService
      .query<GetShippingAddress.Query>(GET_SHIPPING_ADDRESS)
      .pipe(map(data => data.activeOrder && data.activeOrder.shippingAddress));

    this.eligibleShippingMethods$ = this.shippingAddress$.pipe(
      switchMap(() =>
        this.dataService.query<GetEligibleShippingMethods.Query>(GET_ELIGIBLE_SHIPPING_METHODS),
      ),
      map(data => data.eligibleShippingMethods),
    );

    // pedidos grupales activos del usuario logueado
    this.activeOrderGroups$ = this.route.data.pipe(map(data => data.activeOrderGroups as OrderGroup[]));

    this.loadingShippingMethods$ = merge(of(true), this.eligibleShippingMethods$.pipe(mapTo(false)));

    combineLatest([this.signedIn$, this.customerAddresses$])
      .pipe(take(1))
      .subscribe(([signedIn, addresses]) => {
        this.step = 'selectMethod';
      });

    this.cart$ = this.route.data.pipe(
      switchMap(data => data.activeOrder as Observable<GetOrderForCheckout.ActiveOrder>),
    );

    this.isOrderHeadOfGroup$ = this.cart$.pipe(
      // @ts-ignore
      map(c => c?.customFields?.isOrderHeadOfGroup),
    );

    this.orderGroup$ = this.cart$.pipe(
      //@ts-ignore
      map(c => c.customFields?.orderGroup),
    );

    this.isOrderPartOfGroup$ = this.cart$.pipe(
      map(
        c =>
          // @ts-ignore
          c?.customFields?.orderGroup && !c?.customFields?.isOrderHeadOfGroup,
      ),
    );

    this.dataService.mutate<any>(CHECK_CUSTOMER_ORDER).pipe(take(1)).subscribe();

    const currentMethod = this.checkoutStore.selectCurrent('shippingMethod');
    if (currentMethod) {
      this.selectShippingMethod(currentMethod);
    }

    const currentShipingAddressId = this.checkoutStore.selectCurrent('shippingAddressId');
    if (currentShipingAddressId) {
      this.canContinue$.next(true);
    }
  }

  get skipStepAddress(): boolean {
    const currentMethod = this.checkoutStore.selectCurrent('shippingMethod');
    // @ts-ignore
    return currentMethod.customFields?.typeDelivery === 'showroom' || false;
  }

  get shippingMethodId(): string | undefined {
    const currentMethod = this.checkoutStore.selectCurrent('shippingMethod');
    // @ts-ignore
    return currentMethod?.id;
  }

  get selectedAddressId(): string | undefined {
    return this.checkoutStore.selectCurrent('shippingAddressId') || undefined;
  }

  get isSignedIn(): Promise<boolean> {
    return this.stateService
      .select(state => state.signedIn)
      .pipe(take(1))
      .toPromise();
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

  unsetForOrderGroup() {
    this.modalNgbService.open(ConfirmUnsetGroupModalComponent, { centered: true }).result.then(
      result => {
        if (result) {
          this.doProceedUnsetOrderGroup();
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    );
  }

  async doProceedUnsetOrderGroup() {
    const order = await this.orderGroupService.deactivateOrderGroup();
    if (!order.customFields?.orderGroup) {
      this.notificationService.success('pedido grupal desvinculado');
    }
    this.changeDetector.markForCheck();
  }

  continueToPayment() {
    this.router.navigate(['../pago'], { relativeTo: this.route });
  }

  setShippingAddress(value: AddressFormValue | Address.Fragment) {
    this.checkoutStore.setState('shippingAddressId', value?.id);
    const input = this.valueToAddressInput(value);
    this.dataService
      .mutate<SetShippingAddress.Mutation, SetShippingAddress.Variables>(SET_SHIPPING_ADDRESS, {
        input,
      })
      .subscribe(data => {
        this.mutateShippingMethod();
      });
  }

  async clickOnShippingMethod(event: MouseEvent, method: GetEligibleShippingMethods.EligibleShippingMethods) {
    event.preventDefault();
    this.selectShippingMethod(method, true);
  }

  async selectShippingMethod(
    method: GetEligibleShippingMethods.EligibleShippingMethods,
    scroll: boolean = false,
  ) {
    this.checkoutStore.setState('shippingMethod', method);
    if (this.skipStepAddress && scroll) {
      this.setShippingAddress({
        id: '0',
        fullName: 'punto entrega: ' + method.name,
        // @ts-ignore
        streetLine1: method.customFields?.address_or_places || '',
        countryCode: 'AR',
      });
      this.continueToPayment();
      return;
    }

    const isSignedIn = await this.isSignedIn;
    if (!isSignedIn) {
      this.step = 'editAddress';
      this.changeDetector.markForCheck();
    } else {
      this.step = (await this.hasAddresses) ? 'selectAddress' : 'editAddress';
    }

    if (scroll) {
      setTimeout(() => {
        const elList = document.querySelectorAll('.card-direccion');
        const el = elList?.[0] as HTMLElement;
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  mutateShippingMethod() {
    const shippingMethodId = this.shippingMethodId;
    if (shippingMethodId) {
      this.dataService
        .mutate<SetShippingMethod.Mutation, SetShippingMethod.Variables>(SET_SHIPPING_METHOD, {
          id: shippingMethodId,
        })
        .subscribe(data => {
          this.canContinue$.next(true);
          this.continueToPayment();
        });
    }
  }

  goToStepOrderGroup() {
    this.step = 'orderGroupStep';
    this.changeDetector.markForCheck();
    setTimeout(() => {
      const elList = document.querySelectorAll('.checkout-actions');
      const el = elList?.[0] as HTMLElement;
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
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
