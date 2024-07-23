import { Observable, Subject, concat, of } from 'rxjs';
import { filter, catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CustomFieldControl, DataService } from '@vendure/admin-ui/core';

import { FIND_PRODUCTORES } from './productores.graphql';
// import { ProductorList, Productor } from '../../generated-types2';

type Productor = any;
type ProductorList = any;

@Component({
  selector: 'relation-productor-input',
  styleUrls: ['./productor-selector.scss'],
  template: `<ng-select
    class="productorSelector"
    [items]="productores$ | async"
    bindValue="id"
    bindLabel="name"
    (change)="onChange($event)"
    [(ngModel)]="selectedProductorId"
    [minTermLength]="3"
    typeToSearchText="Ingresá al menos 3 caracteres para buscar un productor"
    notFoundText="No se encontraron productores"
    [multiple]="false"
    [loading]="loading"
    [trackByFn]="trackByFn"
    [typeahead]="inputSearch$"
    [disabled]="readonly || false"
  >
  </ng-select> `,
})
export class ProductorSelectorComponent implements OnInit, CustomFieldControl {
  @Input() readonly: boolean;
  @Input() formControl: FormControl;
  @Input() config: any;

  selectedProductorId: string;

  productores$: Observable<Productor[]>;
  loading = false;
  inputSearch$ = new Subject<string>();

  constructor(private dataService: DataService) {}

  ngOnInit() {
    const initItems: any[] = [];

    if (this.formControl.value) {
      initItems.push(this.formControl.value);
    }

    this.productores$ = concat(
      of(initItems), // default items
      this.inputSearch$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter(term => !!term),
        tap(() => (this.loading = true)),
        switchMap(term => {
          return this.dataService
            .query<{ productores: ProductorList }>(FIND_PRODUCTORES, {
              options: {
                take: 25,
                filter: {
                  name: { contains: term },
                },
              },
            })
            .mapSingle(value => value.productores.items)
            .pipe(
              catchError(() => of([])), // empty list on error
              tap(() => (this.loading = false)),
            );
        }),
      ),
    );
    this.selectedProductorId = this.formControl.value?.id || undefined;
  }

  trackByFn(item: Productor): string | number {
    return item.id;
  }

  onChange(selected: any): void {
    selected = selected || null;
    this.formControl.setValue(selected);
    this.formControl.markAsDirty();
  }
}

export default ProductorSelectorComponent;
