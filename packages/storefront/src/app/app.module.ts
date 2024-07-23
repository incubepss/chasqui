import { DOCUMENT, registerLocaleData } from '@angular/common';
import { Inject, LOCALE_ID, NgModule } from '@angular/core';
import {
  BrowserModule,
  BrowserTransferStateModule,
  makeStateKey,
  TransferState,
} from '@angular/platform-browser';
import { Router, RouterModule, UrlSerializer } from '@angular/router';
import localeEsAr from '@angular/common/locales/es-AR';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StateService } from './core/providers/state/state.service';

import { ProductoresModule } from './productores/productores.module';

import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { HomePageComponent } from './core/components/home-page/home-page.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { UserInteractionService } from './shared/services/user-interaction.service';
import { CartManager } from './shared/services/cart.manager';
import { MulticatalogModule } from './multicatalog/multicatalog.module';

const STATE_KEY = makeStateKey<any>('apollo.state');

registerLocaleData(localeEsAr);

@NgModule({
  declarations: [AppComponent, HomePageComponent],
  providers: [{ provide: LOCALE_ID, useValue: 'es-ar' }, CartManager, UserInteractionService],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    NgbModule,
    BrowserTransferStateModule,
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      initialNavigation: 'enabled',
      relativeLinkResolution: 'corrected',
      onSameUrlNavigation: 'reload',
      useHash: false,
    }),
    CoreModule,
    ProductoresModule,
    MulticatalogModule,
    SharedModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    private coreModule: CoreModule,
    private readonly transferState: TransferState,
    private router: Router,
    private urlSerializer: UrlSerializer,
    private stateService: StateService,
    @Inject(DOCUMENT) private document?: Document,
  ) {
    const isBrowser = this.transferState.hasKey<any>(STATE_KEY);

    if (isBrowser) {
      this.onBrowser();
    } else {
      this.onServer();
    }

    this.unregisterSW();

    /**
     * Mecanismo para asegurase la redireccion al login al terminar la sesion
     * (agarra el caso de cierre de sesion otro tab para el mismo consumidor)
     *
     * mejorar enfoque de implementacion en un futuro, creando service manager
     */
    let lastSignedIn = false;
    stateService
      .select(state => state.signedIn)
      .subscribe(signedIn => {
        if (!signedIn && lastSignedIn) {
          router.navigate(['/micuenta', 'ingresar']);
        }
        lastSignedIn = signedIn;
      });
  }

  unregisterSW() {
    //TODO: borrar este metodo en la próxima versión
    navigator?.serviceWorker?.getRegistrations().then(sworkers => {
      sworkers?.forEach(sw => {
        sw.unregister();
        console.log('[info]desregitrando service worker', sw);
      });
    });
  }

  onServer() {
    this.transferState.onSerialize(STATE_KEY, () => {
      const state = this.coreModule.extractState();
      return state;
    });
  }

  onBrowser() {
    const state = this.transferState.get<any>(STATE_KEY, null);
    this.coreModule.restoreState(state);
  }
}
