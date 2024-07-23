import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, combineLatest, merge, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, mapTo, shareReplay, switchMap } from 'rxjs/operators';

import { SearchProducts, SearchResultSortParameter } from '../../../common/generated-types';
import { CartManager } from '../../../shared/services/cart.manager';
import { DataService } from '../../providers/data/data.service';

import { AddToCart } from '../../../common/generated-types';
import { ADD_TO_CART } from '../product-detail/product-detail.graphql';
import { NotificationService } from '../../providers/notification/notification.service';

import { SEARCH_PRODUCTS } from './point-of-sale.graphql';

type SortParam = 'nombre' | 'precio-menor' | 'precio-mayor';

@Component({
  selector: 'vsf-point-of-sale',
  templateUrl: './point-of-sale.component.html',
  styleUrls: ['./point-of-sale.component.scss'],
})
export class PointOfSaleComponent implements OnInit {
  products$ = new BehaviorSubject([]);
  allProducts: any = [];
  totalResults$: Observable<number>;
  sort$: Observable<SortParam>;
  searchTerm$: Observable<string>;
  loading$: Observable<boolean>;
  hasErrorResult$: Observable<boolean>;
  breadcrumbs$: Array<{ id: string; name: string }>;
  addToCartAllowed$: Observable<boolean>;
  sortOptions: Array<{ value: SortParam; label: string }> = [
    { value: 'nombre', label: 'Nombre' },
    { value: 'precio-menor', label: 'Precio de menor a mayor' },
    { value: 'precio-mayor', label: 'Precio de mayor a menor' },
  ];
  searchTerm = new FormControl('');

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private cartManager: CartManager,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    const perPage = 500;

    this.sort$ = this.route.paramMap.pipe(
      switchMap(pm => of(pm.get('orden') || 'precio-menor')),
      distinctUntilChanged((x, y) => x.toString() === y.toString()),
      map(value => value as SortParam),
      shareReplay(1),
    );

    this.breadcrumbs$ = [
      {
        id: '',
        name: 'Home',
      },
      {
        id: '',
        name: 'Punto de venta',
      },
    ];

    const triggerFetch$ = combineLatest([this.sort$]);

    const queryResult$ = triggerFetch$.pipe(
      switchMap(([sortParam]) => {
        return this.dataService
          .query<SearchProducts.Query, SearchProducts.Variables>(SEARCH_PRODUCTS, {
            input: {
              groupByProduct: false,
              // @ts-ignore
              take: perPage,
              sort: this._sortMaker(sortParam),
            },
          })
          .pipe(
            catchError(err => {
              console.log('ops', err);
              return of({ errors: ['uy'] } as any);
            }),
          );
      }),
      shareReplay(1),
    );
    this.totalResults$ = queryResult$.pipe(map(data => data.search?.totalItems || 0));
    const items$ = queryResult$.pipe(map(data => data.search?.items || []));
    this.hasErrorResult$ = queryResult$.pipe(
      map(data => {
        return data.errors?.length > 0;
      }),
    );

    this.loading$ = merge(triggerFetch$.pipe(mapTo(true)), queryResult$.pipe(mapTo(false)));

    items$.subscribe(value => {
      // @ts-ignore
      const ret = this.products$.value.concat(value || []);
      this.products$.next(ret);
      this.allProducts = value;
    });

    this.addToCartAllowed$ = this.cartManager.addToCartAllowed$;
  }

  protected _sortMaker(sortParam: SortParam): SearchResultSortParameter {
    let sortField = 'name';
    let sortDirection = 'ASC';

    if (sortParam === 'precio-menor') {
      sortField = 'price';
      sortDirection = 'ASC';
    } else if (sortParam === 'precio-mayor') {
      sortField = 'price';
      sortDirection = 'DESC';
    }

    const sort: any = {};
    sort[sortField] = sortDirection;
    return sort;
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

  doChange(term: string) {
    const res = this.allProducts.filter((product: any): any => {
      return (
        product.sku.toUpperCase().includes(term.toUpperCase()) ||
        product.productName.toUpperCase().includes(term.toUpperCase())
      );
    });
    this.products$.next(res);
    if (res.length === 1 && term === res[0].sku)
      setTimeout(() => {
        this.doSearch('');
      }, 200);
  }

  doSearch(term: string) {
    if (this.products$.value.length === 1) {
      this.addToCart(this.products$.value[0], 1);
      this.searchTerm.setValue('', { emitEvent: false });
    }
  }
}
