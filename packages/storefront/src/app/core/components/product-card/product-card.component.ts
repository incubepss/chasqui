import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
  OnChanges,
  ViewChild,
  HostListener,
  EventEmitter,
  Output,
} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AddToCart, OrderLine } from '../../../common/generated-types';
import { ADD_TO_CART } from '../product-detail/product-detail.graphql';
import { DataService } from '../../providers/data/data.service';
import { NotificationService } from '../../providers/notification/notification.service';
import { StateService } from '../../providers/state/state.service';
import { CartManager } from './../../../shared/services/cart.manager';
import { getSellosCodes } from './utils-product-card';

@Component({
  selector: 'vsf-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent implements OnChanges {
  @ViewChild('addedToCartTemplate', { static: true })
  private addToCartTemplate: TemplateRef<any>;
  private sellos = [];
  private productInCartData: any = null;

  @Input() addEnabled = true;
  @Input() product: any;
  @Input() facetValues: any;
  @Input() cartOrderLines: any;

  modalDetailRef: NgbModalRef | null = null;

  constructor(
    private dataService: DataService,
    private cartManager: CartManager,
    private stateService: StateService,
    private notificationService: NotificationService,
    private modalService: NgbModal,
  ) {}

  ngOnChanges() {
    if (this.facetValues && Array.isArray(this.product?.facetValueIds)) {
      this.sellos = getSellosCodes(this.product, this.facetValues);
    }

    // Handle product quantity user changes
    if (this.product && this.cartOrderLines) {
      const filteredProduct = this.cartOrderLines.filter((order: OrderLine) => {
        return order.productVariant.id === this.product.productVariantId;
      });

      if (!!filteredProduct.length) {
        this.productInCartData = filteredProduct.pop();
      } else {
        this.productInCartData = null;
      }
    }
  }

  get isAvailable(): boolean {
    return (
      this.product &&
      this.product.productVariantId &&
      this.product.stockLevel !== 'OUT_OF_STOCK' &&
      this.product.inStock !== false
    );
  }

  openProductModal(content: string) {
    this.modalDetailRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: false,
      size: 'xl',
      modalDialogClass: 'modal-dialog',
      windowClass: 'modal-window',
      backdropClass: 'modal-backdrop',
      scrollable: true,
    });

    this.makePointStateHistory();
    this.modalDetailRef.result.finally(() => {
      this.modalDetailRef = null;
      this.clearPointStateHistory();
    });
  }

  protected makePointStateHistory() {
    if (!window.history?.state?.modalProduct) {
      const modalState = {
        modalProduct: true,
        desc: 'Fake state for the modal product detail',
      };
      history.pushState(modalState, 'modalProduct');
    }
  }

  protected clearPointStateHistory() {
    if (window.history?.state?.modalProduct) {
      history.back();
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    if (!this.modalDetailRef) {
      return;
    }

    this.modalDetailRef.close();
  }

  addToCart(product: any, qty: number = 1) {
    this.dataService
      .mutate<AddToCart.Mutation, AddToCart.Variables>(ADD_TO_CART, {
        variantId: product.productVariantId,
        qty,
      })
      .subscribe(({ addItemToOrder }) => {
        switch (addItemToOrder.__typename) {
          case 'Order':
            this.cartManager.setActiveOrder(addItemToOrder);
            break;
          case 'OrderModificationError':
          case 'OrderLimitError':
          case 'NegativeQuantityError':
            this.notificationService.error(addItemToOrder.message);
            break;
          case 'InsufficientStockError':
            this.notificationService.error(addItemToOrder.message, '!uy!');
            break;
        }
      });
  }

  viewCartFromNotification(closeFn: () => void) {
    this.stateService.setState('cartDrawerOpen', true);
    closeFn();
  }
}
