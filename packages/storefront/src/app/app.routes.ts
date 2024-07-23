import { Route, Routes } from '@angular/router';

import { ProductDetailComponent } from './core/components/product-detail/product-detail.component';
import { ProductListComponent } from './core/components/product-list/product-list.component';
import { HomePageComponent } from './core/components/home-page/home-page.component';

import { VerifyComponent } from './account/components/verify/verify.component';
import { ProductoresListComponent } from './productores/components/productores-list/productores-list.component';
import { ProductorDetailComponent } from './productores/components/productor-detail/productor-detail.component';
import { ProximamenteComponent } from './landing/components/proximamente/proximamente.component';
import { ChannelUrlResolver } from './shared/providers/channel-url.resolver';
import { ContentNotFoundComponent } from './core/components/content-not-found/content-not-found.component';
import { TermsandconditionsComponent } from './ayuda/components/termsandconditions/termsandconditions.component';
import { ArrepentimientoComponent } from './ayuda/components/arrepentimiento/arrepentimiento.component';
import { OrderGroupDoorComponent } from './core/components/order-group-door/order-group-door.component';
import { PointOfSaleComponent } from './core/components/point-of-sale/point-of-sale.component';
export const routes: Routes = [
  {
    path: 'tienda-no-encontrada',
    pathMatch: 'full',
    component: ContentNotFoundComponent,
  },
  {
    path: 'micuenta',
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
  },
  {
    path: 'finalizar-compra',
    loadChildren: () => import('./checkout/checkout.module').then(m => m.CheckoutModule),
  },
  {
    path: 'verificar',
    component: VerifyComponent,
  },
  { path: 'terminosycondiciones', component: TermsandconditionsComponent },
  { path: 'arrepentimiento', component: ArrepentimientoComponent },
  {
    path: ':channelcode',
    resolve: {
      channelCodeOnUrl: ChannelUrlResolver,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        //redirectTo: 'catalogo',
        component: HomePageComponent,
      },
      {
        path: 'categoria/:slug',
        component: ProductListComponent,
      },
      {
        path: 'bienvenida',
        loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule),
      },
      {
        path: 'catalogo',
        component: ProductListComponent,
      },
      {
        path: 'pos',
        component: PointOfSaleComponent,
      },
      {
        path: 'producto/:slug',
        component: ProductDetailComponent,
      },
      {
        path: 'productores',
        component: ProductoresListComponent,
        // loadChildren: () => import('./productores/productores.module').then(m => m.ProductoresModule),
      },
      {
        path: 'productores/:id',
        component: ProductorDetailComponent,
      },
      {
        path: 'entregas',
        loadChildren: () => import('./entregas/entregas.module').then(m => m.EntregasModule),
      },
    ],
  },
  {
    path: '',
    loadChildren: () => import('./multicatalog/multicatalog.module').then(m => m.MulticatalogModule),
  },

  {
    path: 'como-comprar',
    component: ProximamenteComponent,
  },
  {
    path: 'ayuda',
    component: ProximamenteComponent,
  },
  {
    path: '**',
    component: ContentNotFoundComponent,
  },
];
