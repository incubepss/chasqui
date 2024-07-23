import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { merge, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, mapTo, shareReplay, switchMap } from 'rxjs/operators';

import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from './../../../core/providers/state/state.service';
import { SEARCH_PRODUCTOR } from './productor-detail.graphql';

@Component({
  selector: 'vsf-productor-detail',
  templateUrl: './productor-detail.component.html',
  styleUrls: ['./productor-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductorDetailComponent implements OnInit {
  loading$: Observable<boolean>;
  productor$: Observable<any | undefined>;
  channelName$: Observable<string>;

  constructor(
    private stateService: StateService,
    private dataService: DataService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.channelName$ = this.stateService.select(s => s.activeChannelName);
    const productorId$ = this.route.paramMap.pipe(
      map(pm => {
        return pm.get('id');
      }),
      distinctUntilChanged(),
      shareReplay(1),
    );

    this.productor$ = productorId$.pipe(
      switchMap(id => {
        if (id) {
          return this.dataService
            .query<any, any>(SEARCH_PRODUCTOR, {
              id,
            })
            .pipe(
              map((data: any) => {
                return data.productor;
              }),
            );
        } else {
          return of(undefined);
        }
      }),
      shareReplay(1),
    );

    this.loading$ = merge(productorId$.pipe(mapTo(true)), this.productor$.pipe(mapTo(false)));
  }

  assembleDireccion(productor: any): string {
    if (!productor) {
      return '';
    }
    const parts: string[] = [productor.localidad, productor.provincia];

    if (productor.pais && !productor.pais.match(/argentina/i)) {
      parts.push(productor.pais);
    }

    return parts.filter(part => !!part).join(', ');
  }
}
