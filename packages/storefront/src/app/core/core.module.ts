import { APP_BASE_HREF, isPlatformServer } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, PLATFORM_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs/operators';

import { environment, DEFAULT_CHANNEL_TOKEN } from '../../environments/environment';
import possibleTypesData from '../common/introspection-results';
import { SharedModule } from '../shared/shared.module';
import { ChannelSelectionService } from '../shared/services/channel-selection.service';
import { TermsandconditionsComponent } from '../ayuda/components/termsandconditions/termsandconditions.component';
import { ArrepentimientoComponent } from '../ayuda/components/arrepentimiento/arrepentimiento.component';
import { MulticatalogCardComponent } from '../multicatalog/components/multicatalog-card/multicatalog-card.component';
import { StateService } from './providers/state/state.service';
import { makeUri } from './../../environments/makeUri';

import { AccountLinkComponent } from './components/account-link/account-link.component';
import { AssetGalleryComponent } from './components/asset-gallery/asset-gallery.component';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';
import { CartToggleComponent } from './components/cart-toggle/cart-toggle.component';
import { CollectionBreadcrumbsComponent } from './components/collection-breadcrumbs/collection-breadcrumbs.component';
import { CollectionsMenuMobileComponent } from './components/collections-menu-mobile/collections-menu-mobile.component';
import { CollectionsMenuComponent } from './components/collections-menu/collections-menu.component';
import { LayoutFooterComponent } from './components/layout/layout-footer.component';
import { LayoutHeaderComponent } from './components/layout/layout-header.component';
import { LayoutComponent } from './components/layout/layout.component';
import { OrderGroupDoorComponent } from './components/order-group-door/order-group-door.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductListControlsComponent } from './components/product-list-controls/product-list-controls.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductSearchBarComponent } from './components/product-search-bar/product-search-bar.component';
import { buildIconLibrary } from './icon-library';
import { DefaultInterceptor } from './providers/data/interceptor';
import { LayoutTopNavComponent } from './components/layout/layout-top-nav/layout-top-nav.component';
import { SellosMenuComponent } from './components/sellos-menu/sellos-menu.component';
import { SellosService } from './services/sellos.service';
import { ImgLogoTiendaComponent } from './components/img-logo-tienda/img-logo-tienda.component';
import { CollectionsTreeNavComponent } from './components/collections-tree-nav/collections-tree-nav.component';
import { MobileToolbarComponent } from './components/mobile-toolbar/mobile-toolbar.component';
import { PromotionCodeComponent } from './components/promotion-code/promotion-code.component';
import { PointOfSaleComponent } from './components/point-of-sale/point-of-sale.component';

const CORE_COMPONENTS = [
  ProductListComponent,
  ProductDetailComponent,
  CartToggleComponent,
  AccountLinkComponent,
  CartDrawerComponent,
  LayoutComponent,
  LayoutHeaderComponent,
  LayoutFooterComponent,
  CollectionBreadcrumbsComponent,
  CollectionsMenuComponent,
  CollectionsTreeNavComponent,
  CollectionsMenuMobileComponent,
  MobileToolbarComponent,
  OrderGroupDoorComponent,
  ProductCardComponent,
  ProductListControlsComponent,
  ProductSearchBarComponent,
  PromotionCodeComponent,
  AssetGalleryComponent,
  LayoutTopNavComponent,
  SellosMenuComponent,
  ImgLogoTiendaComponent,
  ArrepentimientoComponent,
  TermsandconditionsComponent,
  PointOfSaleComponent,
  MulticatalogCardComponent,
];

let apolloCache: InMemoryCache;
let providedCacheState: any | undefined;

export const apolloOptionsFactory = (
  httpLink: HttpLink,
  platformId: any,
  channelSelectionService: ChannelSelectionService,
) => {
  // Note: the intermediate assignment to `fn` is required to prevent
  // an angular compiler error. See https://stackoverflow.com/a/51977115/772859
  let { apiHost, apiPort, shopApiPath } = environment;
  const isServer = isPlatformServer(platformId);
  apolloCache = new InMemoryCache({
    possibleTypes: possibleTypesData.possibleTypes,
    typePolicies: {
      /* eslint-disable */
      Order: {
        fields: {
          adjustments: {
            merge: (existing, incoming) => incoming,
          },
          lines: {
            merge: (existing, incoming) => incoming,
          },
        },
      },
      /* eslint-disable */
      OrderLine: {
        fields: {
          adjustments: {
            merge: (existing, incoming) => incoming,
          },
        },
      },
    },
  });
  if (providedCacheState) {
    apolloCache.restore(providedCacheState);
  }
  let uri;
  if (isServer) {
    apiHost = process?.env?.SERVER_API_HOST || apiHost;
    apiPort = process?.env?.SERVER_API_PORT ? +process.env.SERVER_API_PORT : apiPort;
    shopApiPath = process?.env?.SERVER_API_PATH || shopApiPath;
    uri = `${apiHost}:${apiPort}/${shopApiPath}`;
  } else {
    uri = makeUri({ apiHost, apiPort, shopApiPath });
  }
  return {
    cache: apolloCache,
    link: ApolloLink.from([
      setContext(() => {
        const headers = {};
        const selectedChannelToken = channelSelectionService.getSelectedChannelToken();
        if (selectedChannelToken) {
          // @ts-ignore
          headers['vendure-token'] = selectedChannelToken;
        }

        if (!isServer) {
          if (environment.tokenMethod === 'bearer') {
            const authToken = sessionStorage.getItem('authToken');
            if (authToken) {
              // @ts-ignore
              headers['authorization'] = `Bearer ${authToken}`;
            }
          }
        }
        return {
          headers,
        };
      }),
      httpLink.create({
        uri,
        withCredentials: true,
      }),
    ]),
  };
};

@NgModule({
  declarations: CORE_COMPONENTS,
  imports: [HttpClientModule, SharedModule, BrowserModule, NgbModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true },
    { provide: APP_BASE_HREF, useValue: environment.baseHref },
    {
      provide: APOLLO_OPTIONS,
      useFactory: apolloOptionsFactory,
      deps: [HttpLink, PLATFORM_ID, ChannelSelectionService],
    },
    SellosService,
  ],
  exports: [CORE_COMPONENTS, NgbModule],
})
export class CoreModule {
  constructor(library: FaIconLibrary, sellosService: SellosService, stateService: StateService) {
    buildIconLibrary(library);

    this.populateSellos(sellosService, stateService);
  }

  async populateSellos(sellosService: SellosService, stateService: StateService) {
    const sellos = await sellosService.findSellos().pipe(take(1)).toPromise();
    stateService.setState('sellosMenu', sellos);
  }

  extractState() {
    return apolloCache.extract();
  }

  restoreState(state: any) {
    if (apolloCache) {
      apolloCache.restore(state);
    }
    providedCacheState = state;
  }
}
