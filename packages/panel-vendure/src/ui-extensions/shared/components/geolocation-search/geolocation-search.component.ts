import { Component, OnInit, ViewChild, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { concat, Observable, of, Subject, from } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { NgSelectComponent, SELECTION_MODEL_FACTORY } from '@ng-select/ng-select';
import { SingleSearchSelectionModelFactory } from '@vendure/admin-ui/core';

import { GeolocationService, ResponsePoint } from '../../services/GeolocationService';

@Component({
  selector: 'chq-geolocation-search',
  templateUrl: './geolocation-search.component.html',
  styleUrls: ['./geolocation-search.component.scss'],
  providers: [{ provide: SELECTION_MODEL_FACTORY, useValue: SingleSearchSelectionModelFactory }],
})
export class GeolocationSearchComponent implements OnInit {
  @ViewChild('selectComponent', { static: true }) private selectComponent: NgSelectComponent;

  @Output() change = new EventEmitter<ResponsePoint>();

  points$: Observable<ResponsePoint[]>;
  loading = false;
  input$ = new Subject<string>();
  selected: ResponsePoint[] = [];

  constructor(private geolocationService: GeolocationService, private changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadPeople();
  }

  trackByFn(item: ResponsePoint) {
    return item.place_id;
  }

  onSelect(point: ResponsePoint) {
    this.change.emit(point);
  }

  private loadPeople() {
    this.points$ = concat(
      of([]), // default items
      this.input$.pipe(
        distinctUntilChanged(),
        debounceTime(400),
        tap(() => {
          this.loading = true;
          this.changeDetector.markForCheck();
        }),
        switchMap(term => {
          return from(this.geolocationService.searchQuery(term)).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.loading = false)),
          );
        }),
      ),
    );
  }
}
