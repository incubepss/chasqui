/* eslint-disable @typescript-eslint/naming-convention */
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, combineLatest, merge, Observable } from 'rxjs';
import { switchMap, map, distinctUntilChanged, tap, shareReplay, mapTo } from 'rxjs/operators';

import queryParamGroupedUtils from '../../../common/utils/queryParamGrouped';
import { DataService } from '../../../core/providers/data/data.service';
import { GetCollection, GetProductDetail, SearchProducts } from '../../../common/generated-types';
import { facetSelloProductores, SELLOS_PRODUCTORES_ALLCODES } from '../../../shared/components/sello/sellos';
import { StateService } from './../../../core/providers/state/state.service';
import { SellosProductoresCode } from './../../../shared/components/sello/sellos.d';
import { SEARCH_PRODUCTORES } from './productores-list.graphql';

@Component({
  selector: 'vsf-productores-list',
  templateUrl: './productores-list.component.html',
  styleUrls: ['./productores-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoresListComponent implements OnInit {
  productores: any[] = [];

  sellosFacetValues: SearchProducts.FacetValues[] = facetSelloProductores;

  activeSellos: SellosProductoresCode[] = SELLOS_PRODUCTORES_ALLCODES;
  activeSellosCodes$: Observable<string[]>;

  displayLoadMore = false;
  unfilteredTotalItems = 10000;
  loading$: Observable<boolean>;
  private currentPage = 0;
  private take = 25;
  private refresh = new BehaviorSubject<void>(undefined);
  readonly placeholderCards = Array.from({ length: 3 }).map(() => null);

  channelName$: Observable<string>;

  constructor(
    private dataService: DataService,
    private stateService: StateService,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.activeSellosCodes$ = this.route.paramMap.pipe(
      map(pm => pm.get('etiqueta') || ''),
      distinctUntilChanged((x, y) => x.toString() === y.toString()),
      map(etiqueta => {
        const grouped = queryParamGroupedUtils.deserialize(etiqueta);
        return grouped?.['sellos_productores'] || [];
      }),
      //@ts-ignore
      tap(() => {
        this.displayLoadMore = false;
        this.currentPage = 0;
        this.productores = [];
      }),
      shareReplay(1),
    );

    const triggerFetch$ = combineLatest([this.activeSellosCodes$, this.refresh]);

    const queryResult$ = triggerFetch$.pipe(
      switchMap(([sellosCodes]) => {
        const args: any = {
          options: {
            take: this.take,
            skip: this.currentPage * this.take,
          },
        };

        if (sellosCodes?.length > 0) {
          args.options.filterSellos = sellosCodes;
        }

        return this.dataService
          .query<any, any>(SEARCH_PRODUCTORES, args)
          .pipe(map((data: any) => data.productores));
      }),
      shareReplay(1),
    );

    queryResult$.subscribe((result: any) => {
      this.productores = this.productores.concat(result.items || []);
      this.displayLoadMore = result.totalItems > this.productores.length;
      this.changeDetectorRef.markForCheck();
    });

    this.loading$ = merge(triggerFetch$.pipe(mapTo(true)), queryResult$.pipe(mapTo(false)));

    this.channelName$ = this.stateService.select(s => s.activeChannelName);
  }

  loadMore() {
    this.currentPage++;
    this.refresh.next();
  }
}
