import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, zip } from 'rxjs';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper';
import {
  groupBy,
  map,
  mergeMap,
  take,
  toArray,
  distinctUntilChanged,
  tap,
  shareReplay,
} from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Channel } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { ChannelService } from './../../../shared/services/channel.service';
import { ChannelSelectionService } from './../../../shared/services/channel-selection.service';

import { GET_CHANNELS } from './multicatalog.graphql';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y, Autoplay]);

@Component({
  selector: 'vsf-multicatalog-list',
  templateUrl: './multicatalog-list.component.html',
  styleUrls: ['./multicatalog-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MulticatalogListComponent implements OnInit {
  private currentPage = 0;
  channels$: Observable<Channel[]> | undefined;
  activeChannel$: Observable<Channel> | undefined;
  bannerImages$: string[];
  loading = true;

  groupedByProvince$: Observable<any[]> | undefined;
  groupedByStoreClose$: Observable<any[]> | undefined;
  groupedByStoreUnderConstruction$: Observable<any[]> | undefined;

  showAll = false;
  searchTerm = new FormControl('');
  searchTerm$: Observable<string>;

  swiperConfig = {
    slidesPerView: 1,
    spaceBetween: 20,
    navigation: false,
    pagination: { clickable: true },
    scrollbar: { draggable: true },
    loop: true,
    autoplay: { delay: 1500 },
    breakpoints: {
      992: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
    },
  };

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private channelSelectionService: ChannelSelectionService,
    private channelService: ChannelService,
  ) {}

  ngOnInit() {
    this.channelSelectionService.setSelectedChannelToken('');
    this.activeChannel$ = undefined;
    this.channels$ = this.dataService.query(GET_CHANNELS).pipe(
      take(1),
      map(data => data.channels),
    );

    this.activeChannel$ = this.channelService.getActiveChannel().pipe(
      tap(data => {
        this.bannerImages$ = this.getImages(data);
        this.loading = false;
      }),
    );

    this.groupedByProvince$ = this.channels$.pipe(
      mergeMap(channels =>
        channels.filter(
          channel => channel.customFields.storeEnabled && channel.customFields.showOnMultitienda,
        ),
      ),
      groupBy(
        channel => channel.customFields?.provinceStore || '',
        channel => channel,
      ),
      mergeMap(group => zip(of(group.key), group.pipe(toArray()))),
      toArray(),
    );

    this.groupedByStoreClose$ = this.channels$.pipe(
      map(channels =>
        channels.filter(
          channel => channel.customFields.storeEnabled === false && channel.customFields.showOnMultitienda,
        ),
      ),
    );

    this.groupedByStoreUnderConstruction$ = this.channels$.pipe(
      map(channels => channels.filter(channel => channel.customFields.showOnMultitienda === false)),
    );

    this.searchTerm$ = this.route.queryParamMap.pipe(
      map(pm => pm.get('search') || ''),
      distinctUntilChanged(),
      tap(search => {
        this.searchTerm.setValue(search);
        this.currentPage = 0;
      }),
      shareReplay(1),
    );
  }

  doSearch(term: string) {
    this.router.navigate(['/'], {
      queryParams: { search: term },
      queryParamsHandling: 'merge',
    });
  }

  getImages(channel: any): string[] {
    return (channel.customFields?.bannersAboutUs || []).map((img: any) => img.preview);
  }
}
