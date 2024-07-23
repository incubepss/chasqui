import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { DataService } from '../../../core/providers/data/data.service';

import { REGISTER } from '../../../account/components/register/register.graphql';
import { GetOrderByCode, Register } from '../../../common/generated-types';
import { CheckoutStoreService } from '../../providers/checkout.store.service';
import { NotificationService } from './../../../core/providers/notification/notification.service';

@Component({
  selector: 'vsf-checkout-thanks-single',
  templateUrl: './checkout-thanks-single.component.html',
  styleUrls: ['./checkout-thanks-single.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutThanksSingleComponent implements OnInit {
  @Input()
  order: GetOrderByCode.OrderByCode;
  registrationSent = false;

  isBusyAutorRegistering = false;

  constructor(
    private dataService: DataService,
    private checkoutStoreService: CheckoutStoreService,
    private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    if (this.hasNoAccount && this.checkoutStoreService.selectCurrent('autoCreateAccount')) {
      this.isBusyAutorRegistering = true;
      this.changeDetector.markForCheck();
      this.register();
    }
  }

  get hasNoAccount(): boolean {
    return !this.order.customer?.user;
  }

  register() {
    const customer = this.order?.customer;

    if (!customer) {
      return;
    }

    this.dataService
      .mutate<Register.Mutation, Register.Variables>(REGISTER, {
        input: {
          emailAddress: customer.emailAddress,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phoneNumber: customer.phoneNumber,
        },
      })
      .toPromise()
      .then(r => {
        this.isBusyAutorRegistering = false;
        this.registrationSent = true;
        this.checkoutStoreService.setState('autoCreateAccount', false);
        this.changeDetector.markForCheck();
      })
      .catch(e => {
        this.notificationService.error('Ops! no se pudo crear la registración');
      });
  }
}
