import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SwiperModule } from 'swiper/angular';

import { DialogButtonsDirective } from '../core/components/modal-dialog/dialog-buttons.directive';
import { DialogComponentOutletComponent } from '../core/components/modal-dialog/dialog-component-outlet.component';
import { DialogTitleDirective } from '../core/components/modal-dialog/dialog-title.directive';
import { ModalDialogComponent } from '../core/components/modal-dialog/modal-dialog.component';
import { NotificationComponent } from '../core/components/notification/notification.component';

import { ContentNotFoundComponent } from './../core/components/content-not-found/content-not-found.component';
import { IconPaymentMethodComponent } from './components/icon-payment-method/icon-payment-method.component';

import { AddressCardComponent } from './components/address-card/address-card.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import { AddressModalComponent } from './components/address-modal/address-modal.component';
import { CartContentsComponent } from './components/cart-contents/cart-contents.component';
import { CenteredCardComponent } from './components/centered-card/centered-card.component';
import { CollectionCardComponent } from './components/collection-card/collection-card.component';
import { DropdownContentDirective } from './components/dropdown/dropdown-content.directive';
import { DropdownTriggerDirective } from './components/dropdown/dropdown-trigger.directive';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { LinkRrssComponent } from './components/link-rrss/link-rrss.component';
import { PaymentCardComponent } from './components/payment-card/payment-card.component';
import { SellosProductsComponent } from './components/sellos-products/sellos-products.component';
import { SelloComponent } from './components/sello/sello.component';
import { ShippingLineCardComponent } from './components/shipping-line-card/shipping-line-card.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { ProductQuantitySelectorComponent } from './components/product-quantity-selector/product-quantity-selector.component';
import { AssetPreviewPipe } from './pipes/asset-preview.pipe';
import { FormatPricePipe } from './pipes/format-price.pipe';
import { OrderStateFriendlyPipe } from './pipes/order-state-friendly.pipe';
import { PaymentInstructionPipe } from './pipes/payment-instruction.pipe';
import { PaymentStateFriendlyPipe } from './pipes/payment-state-friendly.pipe';
import { ProductUrlPipe } from './pipes/product-url.pipe';
import { TimeAgoPipe } from './pipes/timeago-pipe';
import { TranslatePipe } from './pipes/translate.pipe';
import { TruncateTextPipe } from './pipes/truncate-text.pipe';
import { HelpButtonComponent } from './components/help-button/help-button.component';
import { BannerComponent } from './components/banner/banner.component';
import { StoreStatusBannerComponent } from './components/store-status-banner/store-status-banner.component';
import { ChannelService } from './services/channel.service';
import { PaymentMethodService } from './services/payment-method.service';
import { ContextRouterLinkDirective } from './directives/context-router-link.directive';
import { StateTagComponent } from './components/state-tag/state-tag.component';
import { ShareOrdergroupComponent } from './components/share-ordergroup/share-ordergroup.component';
import { OrderGroupManager } from './services/order-group.manager';
import { MobileSectionComponent } from './components/mobile-section/mobile-section.component';
import { ShippingMethodCardSelectorComponent } from './components/shipping-method-card-selector/shipping-method-card-selector.component';
import { MobileListActionComponent } from './components/mobile-list-action/mobile-list-action.component';
import { MobileCardComponent } from './components/mobile-card/mobile-card.component';
import { AlertSelfcloseComponent } from './components/alert-selfclose/alert-selfclose.component';

const SHARED_DECLARATIONS = [
  AlertSelfcloseComponent,
  ContentNotFoundComponent,
  CartContentsComponent,
  AddressCardComponent,
  AddressModalComponent,
  PaymentCardComponent,
  SignInComponent,
  AddressFormComponent,
  CenteredCardComponent,
  CollectionCardComponent,
  DropdownComponent,
  DropdownTriggerDirective,
  DropdownContentDirective,
  DialogButtonsDirective,
  DialogTitleDirective,
  DialogComponentOutletComponent,
  IconPaymentMethodComponent,
  ModalDialogComponent,
  MobileSectionComponent,
  MobileListActionComponent,
  MobileCardComponent,
  LinkRrssComponent,
  NotificationComponent,
  StateTagComponent,
  ShareOrdergroupComponent,
  ShippingMethodCardSelectorComponent,

  FormatPricePipe,
  ProductUrlPipe,
  AssetPreviewPipe,
  OrderStateFriendlyPipe,
  PaymentInstructionPipe,
  PaymentStateFriendlyPipe,
  SellosProductsComponent,
  SelloComponent,
  ShippingLineCardComponent,
  TimeAgoPipe,
  TranslatePipe,
  TruncateTextPipe,
  HelpButtonComponent,
  BannerComponent,
  StoreStatusBannerComponent,
  ContextRouterLinkDirective,
  ProductQuantitySelectorComponent,
];

const IMPORTS = [
  FontAwesomeModule,
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  OverlayModule,
  RouterModule,
  SwiperModule,
  NgbDropdownModule,
];

@NgModule({
  declarations: SHARED_DECLARATIONS,
  providers: [ChannelService, PaymentMethodService, OrderGroupManager],
  imports: IMPORTS,
  exports: [...IMPORTS, ...SHARED_DECLARATIONS],
})
export class SharedModule {}
