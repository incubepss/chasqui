import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuItem, addActionBarItem } from '@vendure/admin-ui/core';
@NgModule({
  imports: [SharedModule],
  providers: [
    addNavMenuItem(
      {
        id: 'orders',
        label: 'Pedidos en curso',
        routerLink: ['/extensions/ordersFlow'],
        // Icon can be any of https://clarity.design/icons
        icon: 'shopping-cart',
      },
      'sales',
      'orders',
    ),
    addActionBarItem({
      id: 'back-ordersFlow-list',
      label: 'Volver al listado',
      locationId: 'order-detail',
      buttonColor: 'primary',
      buttonStyle: 'outline',
      icon: 'arrow left',
      routerLink: ['/extensions/ordersFlow'],
    }),
    addActionBarItem({
      id: 'new-product-button',
      label: 'Crear otro producto',
      locationId: 'product-detail',
      buttonColor: 'primary',
      buttonStyle: 'outline',
      icon: 'plus',
      routerLink: ['/catalog/products/create'],
    }),
  ],
  exports: [],
})
export class OrdersFlowUiExtensionModule {}
