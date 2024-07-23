import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { Router } from '@angular/router';
import { SearchProducts } from '../../../common/generated-types';
import { environment } from '../../../../environments/environment';
import { DataService } from '../../providers/data/data.service';
import { StateService } from '../../providers/state/state.service';
import { CartManager } from '../../../shared/services/cart.manager';
import {
  GET_ACTIVE_CHANNEL_ABOUT_US,
  GET_FACET_VALUES,
  GET_TOP_SOLD,
  GET_VARIANTS_SOLD,
} from './home-page.graphql';

@Component({
  selector: 'vsf-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit {
  collections$: Observable<any[]>;
  topSellers$: Observable<any[]>;
  topSold$: Observable<any[]>;
  topSellersLoaded$: Observable<boolean>;
  heroImage: SafeStyle;
  facetValues$: Observable<any>;
  sellosMenu$: Observable<any[]>;
  addToCartAllowed$: Observable<boolean>;
  readonly placeholderProducts = Array.from({ length: 12 }).map(() => null);
  cart$: any;
  channel$: Observable<any[]>;
  bannerImages$: any;

  constructor(
    private dataService: DataService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private stateService: StateService,
    private cartManager: CartManager,
  ) {}

  ngOnInit() {
    const now = new Date();
    const nowISO = now.toISOString();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneMonthAgoISO = oneMonthAgo.toISOString();

    this.facetValues$ = this.dataService
      .query(GET_FACET_VALUES)
      .pipe(map((data: any) => data.search.facetValues));

    this.dataService
      .query(GET_VARIANTS_SOLD, {
        options: {
          filter: {
            orderPlacedAt: {
              between: {
                start: oneMonthAgoISO,
                end: nowISO,
              },
            },
          },
        },
      })
      .pipe(
        map(data => {
          if (data.variantsSold.length === 0) {
            this.topSold$ = of([]);
            return;
          }
          const variantsSold = data.variantsSold.slice(0, 20).map((variant: any) => variant.id);
          this.topSold$ = this.dataService
            .query(GET_TOP_SOLD, {
              options: {
                take: 20,
                skip: 0,
                filter: {
                  id: {
                    in: variantsSold,
                  },
                },
              },
            })
            .pipe(
              map(({ products }) => {
                if (products?.items) {
                  return products.items?.map(this.transformProduct);
                }
              }),
              shareReplay(1),
            );
        }),
      )
      .subscribe();

    this.cart$ = this.cartManager.cart$.pipe(
      map(order => {
        return order?.lines;
      }),
    );

    this.channel$ = this.dataService.query(GET_ACTIVE_CHANNEL_ABOUT_US).pipe(
      map(data => {
        this.bannerImages$ = this.getImages(data.activeChannel);
        return data.activeChannel;
      }),
    );

    //this.topSellersLoaded$ = this.topSellers$.pipe(map(items => 0 < items.length));

    this.heroImage = this.sanitizer.bypassSecurityTrustStyle(this.getHeroImageUrl());

    this.sellosMenu$ = this.stateService.select(state => state.sellosMenu);

    this.addToCartAllowed$ = this.cartManager.addToCartAllowed$;
  }

  private getHeroImageUrl(): string {
    const { apiHost, apiPort } = environment;
    return `url('${apiHost}:${apiPort}/assets/preview/40/abel-y-costa-716024-unsplash__preview.jpg')`;
  }

  getImages(channel: any): string[] {
    return (channel.customFields?.bannersAboutUs || []).map((img: any) => img.preview);
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
}
