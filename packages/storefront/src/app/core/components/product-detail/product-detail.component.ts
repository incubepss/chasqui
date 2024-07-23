import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AddToCart, GetProductDetail } from '../../../common/generated-types';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';
import { DataService } from '../../providers/data/data.service';
import { NotificationService } from '../../providers/notification/notification.service';
import { StateService } from '../../providers/state/state.service';
import { CartManager } from '../../../shared/services/cart.manager';
import { ChannelSelectionService } from '../../../shared/services/channel-selection.service';

import { ADD_TO_CART, GET_PRODUCT_DETAIL } from './product-detail.graphql';

const MAX_QTY = 999;

interface GetProductDetailWithCustomfields extends GetProductDetail.Product {
  customFields?: any;
}

@Component({
  selector: 'vsf-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  @Input() productSlug = '';
  @Input() showBreadcrumbs = true;
  @Input() channel: any = null;

  product: GetProductDetailWithCustomfields;
  selectedAsset: { id: string; preview: string };
  protected _selectedVariant: GetProductDetail.Variants;

  get selectedVariant() {
    return this._selectedVariant;
  }

  set selectedVariant(value: GetProductDetail.Variants) {
    this._selectedVariant = value;
    this.isAvailable = value && value.stockLevel !== 'OUT_OF_STOCK';
  }

  isAvailable = false;
  qty = 1;
  breadcrumbs: GetProductDetail.Breadcrumbs[] | null = null;
  productor: any;
  @ViewChild('addedToCartTemplate', { static: true })
  private addToCartTemplate: TemplateRef<any>;
  private sub: Subscription;
  private inputProductSlug = new BehaviorSubject<string>('');
  inputProductSlug$ = this.inputProductSlug.asObservable();

  shareAvailable = false;

  addEnabled$: Observable<boolean>;

  constructor(
    private dataService: DataService,
    private stateService: StateService,
    private cartManager: CartManager,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private channelSelectionService: ChannelSelectionService,
  ) {
    this.shareAvailable = !!navigator.share;
  }

  ngOnInit() {
    this.addEnabled$ = this.cartManager.addToCartAllowed$;

    this.inputProductSlug.next(this.productSlug);
    const lastCollectionSlug$ = this.stateService.select(state => state.lastCollectionSlug);
    const productSlug$ = this.route.paramMap.pipe(
      map(paramMap => paramMap.get('slug')),
      filter(notNullOrUndefined),
    );
    const sourceSlug$ = this.productSlug === '' ? productSlug$ : this.inputProductSlug$;

    this.sub = sourceSlug$
      .pipe(
        switchMap(slug => {
          return this.dataService.query<GetProductDetail.Query, GetProductDetail.Variables>(
            GET_PRODUCT_DETAIL,
            {
              slug,
            },
          );
        }),
        map(data => data.product),
        filter(notNullOrUndefined),
        withLatestFrom(lastCollectionSlug$),
      )
      .subscribe(([product, lastCollectionSlug]) => {
        this.product = product;
        if (this.product.featuredAsset) {
          this.selectedAsset = this.product.featuredAsset;
        }
        this.selectedVariant = product.variants[0];
        const collection = this.getMostRelevantCollection(product.collections, lastCollectionSlug);
        this.breadcrumbs = collection ? collection.breadcrumbs : [];
        this.productor = this.product.customFields?.productor;
      });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  modalDismiss() {
    this.modalService.dismissAll();
  }

  channelRoute(route: string[]) {
    if (this.channel) {
      return ['/', this.channel.token, ...route];
    }
    return ['/', this.channelSelectionService.getSelectedChannelToken(), ...route];
  }

  addToCart(variant: GetProductDetail.Variants, qty: number) {
    if (qty > MAX_QTY) {
      this.notificationService.error('El valor máximo permitido es ' + MAX_QTY, '¡uy!');
      return;
    }

    this.modalService.dismissAll();
    this.dataService
      .mutate<AddToCart.Mutation, AddToCart.Variables>(ADD_TO_CART, {
        variantId: variant.id,
        qty,
      })
      .subscribe(({ addItemToOrder }) => {
        switch (addItemToOrder.__typename) {
          case 'Order':
            this.cartManager.setActiveOrder(addItemToOrder);
            if (variant) {
              this.notificationService.notify({
                title: 'Agregado al carrito',
                type: 'info',
                duration: 3000,
                templateRef: this.addToCartTemplate,
                templateContext: {
                  variant,
                  quantity: qty,
                },
              });
            }
            break;
          case 'OrderModificationError':
          case 'OrderLimitError':
          case 'NegativeQuantityError':
            this.notificationService.error(addItemToOrder.message);
            break;
          case 'InsufficientStockError':
            this.notificationService.error(addItemToOrder.message, '¡uy!');
            break;
        }
      });
  }

  viewCartFromNotification(closeFn: () => void) {
    this.stateService.setState('cartDrawerOpen', true);
    closeFn();
  }

  /**
   * If there is a collection matching the `lastCollectionId`, return that. Otherwise return the collection
   * with the longest `breadcrumbs` array, which corresponds to the most specific collection.
   */
  private getMostRelevantCollection(
    collections: GetProductDetail.Collections[],
    lastCollectionSlug: string | null,
  ) {
    const lastCollection = collections.find(c => c.slug === lastCollectionSlug);
    if (lastCollection) {
      return lastCollection;
    }
    return collections.slice().sort((a, b) => {
      if (a.breadcrumbs.length < b.breadcrumbs.length) {
        return 1;
      }
      if (a.breadcrumbs.length > b.breadcrumbs.length) {
        return -1;
      }
      return 0;
    })[0];
  }

  openModalProductor(content: string) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true });
  }

  async doShare(event: any) {
    event.preventDefault();
    event.stopPropagation();
    const targetHref = event.target.href;

    if (navigator.share && this.product) {
      try {
        await navigator.share({
          title: 'TiendasChasqui · Producto',
          text: this.product.name,
          url: targetHref,
        });
      } catch (err) {
        console.warn('No se pudo compartir el link', err);
      }
    }
  }
}
