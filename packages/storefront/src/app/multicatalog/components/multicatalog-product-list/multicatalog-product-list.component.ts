import {
  Component,
  OnInit,
  OnChanges,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  SimpleChanges,
} from '@angular/core';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { map, mapTo, switchMap } from 'rxjs/operators';

import { SearchProducts, Channel } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { SEARCH_PRODUCTS, GET_FACET_VALUES } from './multicatalog-product-list.graphql';

@Component({
  selector: 'vsf-multicatalog-product-list',
  templateUrl: './multicatalog-product-list.component.html',
  styleUrls: ['./multicatalog-product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MulticatalogProductListComponent implements OnChanges {
  @Input() channels: any;
  @Input() term: string;
  loading$: Observable<boolean>;
  products: any[] = [];
  facetValues$: Observable<any>;
  displayLoadMore = false;

  addToCartAllowed$: Observable<boolean>;

  private currentPage = 0;
  private take = 15;
  private refresh = new BehaviorSubject<void>(undefined);

  constructor(private dataService: DataService, private changeDetector: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.term) {
      this.products = [];
      this.currentPage = 0;
      this.refresh.next();
    }
    const query$ = this.refresh.pipe(
      switchMap(() => {
        return this.dataService
          .query<SearchProducts.Query, SearchProducts.Variables>(SEARCH_PRODUCTS, {
            input: {
              term: this.term,
              groupByProduct: true,
              take: this.take,
              skip: this.currentPage * this.take,
            },
          })
          .pipe(map((data: any) => data.search));
      }),
    );
    this.facetValues$ = this.dataService
      .query(GET_FACET_VALUES)
      .pipe(map((data: any) => data.search.facetValues));

    query$.subscribe(result => {
      if (result?.items) {
        const updateProducts = [...this.products, ...result.items];
        this.products = updateProducts;
        this.displayLoadMore = result.totalItems > this.products.length;
        this.changeDetector.markForCheck();
        this.channels.subscribe((channels: Channel[]) => {
          const productsWithChannel = this.products.map((product: any) => {
            const channelId = product.channelIds.find((element: string) => element !== '1');
            const channel = channels.find(c => c.id === channelId);
            return { ...product, channel };
          });
          this.products = productsWithChannel;
        });
      }
    });

    this.loading$ = merge(this.refresh.pipe(mapTo(true)), query$.pipe(mapTo(false)));
  }

  loadMore() {
    this.currentPage++;
    this.refresh.next();
  }
}
