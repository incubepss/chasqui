import { NgModule } from '@angular/core';
import {
  LocalStorageService,
  SharedModule,
  registerDashboardWidget,
  setDashboardWidgetLayout,
} from '@vendure/admin-ui/core';

@NgModule({
  imports: [SharedModule],
  declarations: [],
  providers: [
    registerDashboardWidget('nuevos-pedidos', {
      title: 'Nuevos pedidos',
      supportedWidths: [6, 8, 12],
      loadComponent: () =>
        import('./widgets/new-orders/new-orders-widget.component').then(m => m.NewOrdersWidgetComponent),
    }),
    registerDashboardWidget('resumen-de-pedidos', {
      title: 'Resumen de pedidos',
      supportedWidths: [4],
      loadComponent: () =>
        import('./widgets/order-summary-widget/order-summary-widget.component').then(
          m => m.OrderSummaryWidgetComponent,
        ),
    }),
    registerDashboardWidget('articulos-pedidos', {
      title: 'Artículos pedidos',
      supportedWidths: [6, 8, 12],
      loadComponent: () =>
        import('./widgets/variants-sold-widget/variants-sold-widget.component').then(
          m => m.VariantsSoldWidgetComponent,
        ),
    }),
    registerDashboardWidget('cargos-adicionales', {
      title: 'Cargos adicionales seleccionados',
      supportedWidths: [6, 8, 12],
      loadComponent: () =>
        import('./widgets/custom-surcharges-sold-widget/custom-surcharges-sold-widget.component').then(
          m => m.CustomSurchargesSoldWidgetComponent,
        ),
    }),
    setDashboardWidgetLayout([
      { id: 'nuevos-pedidos', width: 8 },
      { id: 'resumen-de-pedidos', width: 4 },
      { id: 'articulos-pedidos', width: 8 },
    ]),
  ],
  exports: [],
})
export class DashboardUiExtensionModule {
  constructor(private localStorageService: LocalStorageService) {
    this.clearDashboardLayout();
  }

  clearDashboardLayout() {
    const hasClearedFlag = this.localStorageService.get<any>('dashboard2');
    if (hasClearedFlag) {
      return;
    }

    this.localStorageService.remove('dashboardWidgetLayout');
    this.localStorageService.set<any>('dashboard2', true);
  }
}
