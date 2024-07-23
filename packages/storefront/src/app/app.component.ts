import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { ChannelService } from './shared/services/channel.service';
import { PaymentMethodService } from './shared/services/payment-method.service';
import { StateService } from './core/providers/state/state.service';
import { ChannelSelectionService } from './shared/services/channel-selection.service';

export const DEFAULT_BG_COLOR = 'rgb(249 249 249)';

// eslint-disable-next-line @typescript-eslint/ban-types
declare let gtag: Function;
@Component({
  selector: 'vsf-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  cartDrawerVisible$: Observable<boolean>;
  mobileNavVisible$: Observable<boolean>;
  mobileCateVisible$: Observable<boolean>;
  isHomePage$: Observable<boolean>;
  isCatalogo$: Observable<boolean>;
  isStoreDisabled$: Observable<boolean>;

  backgroundColor = DEFAULT_BG_COLOR;
  defaultBackgroundColor = DEFAULT_BG_COLOR;

  constructor(
    private router: Router,
    private stateService: StateService,
    private channelService: ChannelService,
    private channelSelectionService: ChannelSelectionService,
    private paymentMethodService: PaymentMethodService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cartDrawerVisible$ = this.stateService.select(state => state.cartDrawerOpen);
    this.mobileNavVisible$ = this.stateService.select(state => state.mobileNavMenuIsOpen);
    this.mobileCateVisible$ = this.stateService.select(state => state.mobileCateMenuIsOpen);

    this.isHomePage$ = this.router.events.pipe(
      filter<any>(event => event instanceof RouterEvent),
      map((event: RouterEvent) => event.url === '/' || event.url.startsWith('/?search=')),
    );

    const isCatalogo = /categoria|catalogo/i;

    this.isCatalogo$ = this.router.events.pipe(
      filter<any>(event => event instanceof RouterEvent),
      map((event: RouterEvent) => isCatalogo.test(event.url)),
    );

    this.isHomePage$.subscribe(isHome => {
      if (isHome) {
        this.backgroundColor = DEFAULT_BG_COLOR;
      } else {
        this.loadActiveChannel();
      }
    });

    this.isStoreDisabled$ = this.stateService.select(state => state.storeDisabled);

    this.isStoreDisabled$.subscribe(value => {
      const body = document.getElementsByTagName('body')[0];
      if (value) {
        body.classList.add('isStoreDisabled');
      } else {
        body.classList.remove('isStoreDisabled');
      }
    });

    this.loadPaymentMethods();
    this.setUpAnalytics();
  }

  setUpAnalytics() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      gtag('config', environment.gidAnalytics, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        page_path: (event as NavigationEnd).urlAfterRedirects,
      });
    });
  }

  makeLink(parts: string[]) {
    return ['/', this.channelSelectionService.getSelectedChannelToken()].concat(parts);
  }

  loadActiveChannel() {
    this.channelService.getActiveChannel().subscribe(channel => {
      this.stateService.setState('activeChannel', channel);
      this.setBgColor(channel.customFields?.bgColorStore);
    });
  }

  loadPaymentMethods() {
    this.paymentMethodService.findPaymentMethods().subscribe(paymentMethods => {
      this.stateService.setState('paymentMethods', paymentMethods);
    });
  }

  setBgColor(color: string) {
    if (!color) {
      color = DEFAULT_BG_COLOR;
    }

    this.backgroundColor = color;
    this.changeDetector.markForCheck();
  }

  openMobileNav() {
    this.stateService.setState('mobileNavMenuIsOpen', true);
  }

  openCartDrawer() {
    this.stateService.setState('cartDrawerOpen', true);
  }

  closeCartDrawer() {
    this.stateService.setState('cartDrawerOpen', false);
  }
}
