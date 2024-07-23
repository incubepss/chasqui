import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, merge, Observable, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  mapTo,
  share,
  shareReplay,
  skip,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';

import queryParamUtils, { GroupParam } from '../../../common/utils/queryParamGrouped';
import {
  GetCollection,
  OrderGroup,
  SearchProducts,
  SearchResultSortParameter,
} from '../../../common/generated-types';
import { AssetPreviewPipe } from '../../../shared/pipes/asset-preview.pipe';
import { CartManager } from '../../../shared/services/cart.manager';
import { DataService } from '../../providers/data/data.service';
import { StateService } from '../../providers/state/state.service';

import { GET_COLLECTION, SEARCH_PRODUCTS } from './product-list.graphql';

type SortParam = 'nombre' | 'precio-menor' | 'precio-mayor';

/**
 * Arma estructra del tipo
 * 
 *  [
      {or: [1,2]}
      {or: [7]}
    ]
 */
const transformsFacetValueGrouped = (group: GroupParam): any[] | undefined => {
  if (!group) {
    return;
  }
  const keys = Object.keys(group);
  const ret = keys.map(key => {
    return { or: group[key] };
  });
  return ret;
};

@Component({
  selector: 'vsf-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  products$ = new BehaviorSubject([]);
  totalResults$: Observable<number>;
  collection$: Observable<GetCollection.Collection | undefined>;
  facetValues: SearchProducts.FacetValues[] | undefined;
  unfilteredTotalItems = 0;
  activeFacetValueIds$: Observable<string[]>;
  activeFacetValueGrouped$: Observable<GroupParam>;
  sort$: Observable<SortParam>;
  searchTerm$: Observable<string>;
  displayLoadMore$: Observable<boolean>;
  loading$: Observable<boolean>;
  hasErrorResult$: Observable<boolean>;
  breadcrumbs$: Observable<Array<{ id: string; name: string }>>;
  mastheadBackground$: Observable<SafeStyle>;
  collectionSlug$: Observable<string | null>;
  addToCartAllowed$: Observable<boolean>;
  sortOptions: Array<{ value: SortParam; label: string }> = [
    { value: 'nombre', label: 'Nombre' },
    { value: 'precio-menor', label: 'Precio de menor a mayor' },
    { value: 'precio-mayor', label: 'Precio de mayor a menor' },
  ];

  private currentPage = 0;
  private refresh = new BehaviorSubject<void>(undefined);
  readonly placeholderProducts = Array.from({ length: 15 }).map(() => null);
  cart$: any;
  cartLines$: any;
  orderGroup$: Observable<OrderGroup | null>;
  hasUrlOrderGroupCode$: Observable<boolean>;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private stateService: StateService,
    private sanitizer: DomSanitizer,
    private cartManager: CartManager,
  ) {}

  ngOnInit() {
    const perPage = 15;
    this.collectionSlug$ = this.route.paramMap.pipe(
      map(pm => pm.get('slug')),
      distinctUntilChanged(),
      tap(slug => {
        this.stateService.setState('lastCollectionSlug', slug || null);
        this.currentPage = 0;
      }),
      shareReplay(1),
    );

    this.activeFacetValueGrouped$ = this.route.paramMap.pipe(
      switchMap(pm => of(pm.get('etiqueta') || '')),
      distinctUntilChanged((x, y) => x.toString() === y.toString()),
      map(value => queryParamUtils.deserialize(value)),
      tap(() => {
        this.currentPage = 0;
      }),
      shareReplay(1),
    );

    this.sort$ = this.route.paramMap.pipe(
      switchMap(pm => of(pm.get('orden') || 'precio-menor')),
      distinctUntilChanged((x, y) => x.toString() === y.toString()),
      map(value => value as SortParam),
      tap(() => {
        this.currentPage = 0;
      }),
      shareReplay(1),
    );

    this.searchTerm$ = this.route.queryParamMap.pipe(
      map(pm => pm.get('search') || ''),
      distinctUntilChanged(),
      tap(() => {
        this.currentPage = 0;
      }),
      shareReplay(1),
    );

    this.collection$ = this.collectionSlug$.pipe(
      switchMap(slug => {
        if (slug) {
          return this.dataService
            .query<GetCollection.Query, GetCollection.Variables>(GET_COLLECTION, {
              slug,
            })
            .pipe(map(data => data.collection));
        } else {
          return of(undefined);
        }
      }),
      shareReplay(1),
    );

    this.cartLines$ = this.cartManager.cart$.pipe(
      map(order => {
        return order?.lines || [];
      }),
    );

    this.orderGroup$ = this.cartManager.cart$.pipe(
      // @ts-ignore
      map(cart => cart?.customFields?.orderGroup || null),
    );

    this.hasUrlOrderGroupCode$ = this.route.queryParams.pipe(
      map(params => {
        return !!params?.gcode;
      }),
    );

    const assetPreviewPipe = new AssetPreviewPipe();

    this.mastheadBackground$ = this.collection$.pipe(
      map(c => 'url(' + assetPreviewPipe.transform(c?.featuredAsset || undefined, 1000, 300) + ')'),
      map(style => this.sanitizer.bypassSecurityTrustStyle(style)),
    );

    this.breadcrumbs$ = this.collection$.pipe(
      map(collection => {
        if (collection) {
          return collection.breadcrumbs;
        } else {
          return [
            {
              id: '',
              name: 'Home',
            },
            {
              id: '',
              name: 'Catálogo',
            },
          ];
        }
      }),
    );

    const triggerFetch$ = combineLatest([
      this.collection$,
      this.activeFacetValueGrouped$,
      this.searchTerm$,
      this.sort$,
      this.refresh,
    ]);

    const getInitialFacetValueIds = () => {
      combineLatest([this.collection$, this.searchTerm$, this.sort$])
        .pipe(
          take(1),
          switchMap(([collection, term, sortParam]) => {
            return this.dataService.query<SearchProducts.Query, SearchProducts.Variables>(SEARCH_PRODUCTS, {
              input: {
                term,
                groupByProduct: true,
                collectionId: collection?.id,
                take: perPage,
                skip: this.currentPage * perPage,
                sort: this._sortMaker(sortParam),
              },
            });
          }),
        )
        .subscribe(data => {
          this.facetValues = data.search?.facetValues;
          this.unfilteredTotalItems = data.search?.totalItems;
        });
    };

    const queryResult$ = triggerFetch$.pipe(
      switchMap(([collection, activeFacetValueGrouped, term, sortParam]) => {
        const facetValueFilters = transformsFacetValueGrouped(activeFacetValueGrouped);

        return this.dataService
          .query<SearchProducts.Query, SearchProducts.Variables>(SEARCH_PRODUCTS, {
            input: {
              term,
              groupByProduct: true,
              collectionId: collection?.id,
              // @ts-ignore
              facetValueFilters,
              take: perPage,
              skip: this.currentPage * perPage,
              sort: this._sortMaker(sortParam),
            },
          })
          .pipe(
            tap(data => {
              if (queryParamUtils.isEmpty(activeFacetValueGrouped)) {
                this.facetValues = data.search?.facetValues;
                this.unfilteredTotalItems = data.search?.totalItems;
              } else if (!this.facetValues) {
                getInitialFacetValueIds();
              } else {
                this.facetValues = this.facetValues?.map(fv => fv);
              }
            }),
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

    const RESET = 'RESET';
    const reset$ = merge(
      this.collectionSlug$,
      this.activeFacetValueGrouped$,
      this.searchTerm$,
      this.sort$,
    ).pipe(mapTo(RESET), skip(1), share());

    reset$.subscribe(value => {
      this.products$.next([]);
    });

    items$.subscribe(value => {
      // @ts-ignore
      const ret = this.products$.value.concat(value || []);
      this.products$.next(ret);
    });

    this.displayLoadMore$ = combineLatest([this.products$, this.totalResults$]).pipe(
      map(([products, totalResults]) => {
        return 0 < products?.length && products?.length < totalResults;
      }),
    );

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

  trackByProductId(index: number, item: SearchProducts.Items) {
    return item.productId;
  }

  loadMore() {
    this.currentPage++;
    this.refresh.next();
  }
}
