import { Routes } from '@angular/router';

import { SignInComponent } from '../shared/components/sign-in/sign-in.component';

import { AccountAddressBookComponent } from './components/account-address-book/account-address-book.component';
import { AccountAddressDetailComponent } from './components/account-address-detail/account-address-detail.component';
import { AccountChangeCredentialsComponent } from './components/account-change-credentials/account-change-credentials.component';
import { AccountCustomerDetailsComponent } from './components/account-customer-details/account-customer-details.component';
import { AccountDashboardComponent } from './components/account-dashboard/account-dashboard.component';
import { AccountOrderDetailComponent } from './components/account-order-detail/account-order-detail.component';
import { AccountOrderGroupDetailComponent } from './components/account-ordergroup-detail/account-ordergroup-detail.component';
import { AccountOrderGroupListComponent } from './components/account-ordergroup-list/account-ordergroup-list.component';
import { AccountOrderListComponent } from './components/account-order-list/account-order-list.component';
import { AccountComponent } from './components/account/account.component';
import { ChangeEmailAddressComponent } from './components/change-email-address/change-email-address.component';
import { ForgottenPasswordComponent } from './components/forgotten-password/forgotten-password.component';
import { RegisterComponent } from './components/register/register.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { VerifyComponent } from './components/verify/verify.component';
import { AccountGuard } from './providers/account.guard';
import { SignInGuard } from './providers/sign-in.guard';
import { OrderGroupNewComponent } from './components/ordergroup-new/ordergroup-new.component';
import { AccountOrderGroupRemitoComponent } from './components/account-ordergroup-remito/account-ordergroup-remito.component';

export const routes: Routes = [
  {
    path: '',
    component: AccountComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [AccountGuard],
        component: AccountDashboardComponent,
      },
      {
        path: 'pedidos',
        canActivate: [AccountGuard],
        component: AccountOrderListComponent,
      },
      {
        path: 'pedidos/:code',
        canActivate: [AccountGuard],
        component: AccountOrderDetailComponent,
      },
      {
        path: 'grupos',
        canActivate: [AccountGuard],
        component: AccountOrderGroupListComponent,
      },
      {
        path: 'grupos/:code',
        canActivate: [AccountGuard],
        component: AccountOrderGroupDetailComponent,
      },
      {
        path: 'grupos/:code/remito',
        canActivate: [AccountGuard],
        component: AccountOrderGroupRemitoComponent,
      },
      {
        path: 'grupos-nuevo',
        canActivate: [AccountGuard],
        component: OrderGroupNewComponent,
      },
      {
        path: 'grupos/:codeGroup/:code',
        canActivate: [AccountGuard],
        component: AccountOrderDetailComponent,
      },
      {
        path: 'direcciones',
        canActivate: [AccountGuard],
        component: AccountAddressBookComponent,
      },
      {
        path: 'direcciones/:id',
        canActivate: [AccountGuard],
        component: AccountAddressDetailComponent,
      },
      {
        path: 'datos-personales',
        canActivate: [AccountGuard],
        component: AccountCustomerDetailsComponent,
      },
      {
        path: 'cambio-credenciales',
        canActivate: [AccountGuard],
        component: AccountChangeCredentialsComponent,
      },
      {
        path: 'ingresar',
        component: SignInComponent,
      },
      {
        path: 'registrar',
        canActivate: [SignInGuard],
        component: RegisterComponent,
      },
      {
        path: 'verificar',
        canActivate: [SignInGuard],
        component: VerifyComponent,
      },
      {
        path: 'blanqueo-de-password',
        canActivate: [SignInGuard],
        component: ResetPasswordComponent,
      },
      {
        path: 'olvido-de-password',
        canActivate: [SignInGuard],
        component: ForgottenPasswordComponent,
      },
      {
        path: 'cambio-email',
        canActivate: [SignInGuard],
        component: ChangeEmailAddressComponent,
      },
    ],
  },
];
