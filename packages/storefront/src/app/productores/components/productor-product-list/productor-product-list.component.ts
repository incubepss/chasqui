import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { map, mapTo, shareReplay, switchMap } from 'rxjs/operators';

import { SearchProducts } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { CartManager } from '../../../shared/services/cart.manager';
import { SEARCH_PRODUCTS_PRODUCTOR, GET_FACET_VALUES } from './productor-product-list.graphql';

@Component({
  selector: 'vsf-productor-product-list',
  templateUrl: './productor-product-list.component.html',
  styleUrls: ['./productor-product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductorProductListComponent implements OnInit {
  @Input() productorId: string;
  loading$: Observable<boolean>;
  products: any[] = [];
  facetValues$: Observable<any>;
  displayLoadMore = false;

  addToCartAllowed$: Observable<boolean>;

  private currentPage = 0;
  private take = 25;
  private refresh = new BehaviorSubject<void>(undefined);

  constructor(
    private dataService: DataService,
    private cartManager: CartManager,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.addToCartAllowed$ = this.cartManager.addToCartAllowed$;

    const query$ = this.refresh.pipe(
      switchMap(() => {
        return this.dataService
          .query<any, any>(SEARCH_PRODUCTS_PRODUCTOR, {
            id: this.productorId,
            optionsProducts: {
              take: this.take,
              skip: this.currentPage * this.take,
            },
          })
          .pipe(map((data: any) => data.productor.products));
      }),
    );
    this.facetValues$ = this.dataService
      .query(GET_FACET_VALUES)
      .pipe(map((data: any) => data.search.facetValues));

    query$.subscribe(result => {
      if (result?.items) {
        this.products = this.products.concat(result.items?.map(this.transformProduct));
        this.displayLoadMore = result.totalItems > this.products.length;
        this.changeDetector.markForCheck();
      }
    });

    this.loading$ = merge(this.refresh.pipe(mapTo(true)), query$.pipe(mapTo(false)));
  }

  private transformProduct(product: any): SearchProducts.Items {
    const ranges = product.variants?.reduce(
      (partial: number[], v: any) => {
        if (partial[0] === 0 || partial[0] > v.priceWithTax) {
          partial[0] = v.priceWithTax;
        }

        if (partial[1] === 0 || partial[1] < v.priceWithTax) {
          partial[1] = v.priceWithTax;
        }
        return partial;
      },
      [0, 0],
    );
    const min = ranges[0];
    const max = ranges[1];
    const facetValueIds = product.facetValues.map((data: any) => data.id);

    return {
      productVariantId: product.variants?.[0]?.id || 0,
      inStock: product.variants?.[0]?.stockLevel !== 'OUT_OF_STOCK',
      productId: product.id,
      productName: product.name,
      description: product.description,
      slug: product.slug,
      facetValueIds,
      priceWithTax: {
        min,
        max,
      },
      productAsset: product.assets?.[0] || null,
    };
  }

  loadMore() {
    this.currentPage++;
    this.refresh.next();
  }
}
