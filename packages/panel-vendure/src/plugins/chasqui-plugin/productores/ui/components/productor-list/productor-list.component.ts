import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { EMPTY } from 'rxjs';
import { debounceTime, takeUntil, switchMap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { BaseListComponent, DataService, NotificationService, ModalService } from '@vendure/admin-ui/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

// import { SortOrder } from '../../generated-types';
enum SortOrder {
  Asc = 'ASC',
  Desc = 'DESC',
}

// import { CsvDataService } from '../../common/export-as-csv';

// import {
//   GetAllVendorsQuery,
//   Vendors,
//   GetAllVendorsQueryVariables,
//   DeleteVendor
// } from '../../generated-types';

import { FIND_PRODUCTORES, DELETE_PRODUCTOR } from './productor-list.graphql';

@Component({
  selector: 'productor-list',
  templateUrl: './productor-list.component.html',
  styleUrls: ['./productor-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductorListComponent
  extends BaseListComponent<
    any, //GetAllVendorsQuery,
    any, //Vendors.Fragment,
    any //GetAllVendorsQueryVariables
  >
  implements OnInit
{
  searchTerm = new FormControl('');
  Vendors: any;
  routeurl: string;

  constructor(
    private dataService: DataService,
    private modalService: ModalService,
    private notificationService: NotificationService,
    private apollo: Apollo,
    router: Router,
    route: ActivatedRoute,
  ) {
    super(router, route);
    super.setQueryFn(
      (...args: any[]) => {
        return this.dataService.query(FIND_PRODUCTORES, args).refetchOnChannelChange();
      },
      data => {
        return data.productores;
      },
      (skip, take) => {
        const searchTermValue = this.searchTerm.value;
        const filter = searchTermValue
          ? {
              name: { contains: searchTermValue },
            }
          : {};
        const opts = {
          options: {
            skip,
            take,
            filter,
            sort: {
              name: SortOrder.Asc,
            },
          },
        };
        return opts;
      },
    );
  }

  ngOnInit() {
    super.ngOnInit();
    this.routeurl = location.origin;
    this.searchTerm.valueChanges.pipe(debounceTime(250), takeUntil(this.destroy$)).subscribe(() => {
      this.refresh();
    });
  }

  downloadcsv(): void {
    // let args: any[] = [];
    // this.apollo.watchQuery<any>({
    //   query: FIND_PRODUCTORES
    //   variables: args
    // }).valueChanges.subscribe((data) => {
    //    CsvDataService.exportToCsv('danfe-vendors.csv', data.data.Vendors.items);
    // });
  }

  delete(id: string): void {
    this.modalService
      .dialog({
        title: _('productor-plugin.confirm-delete-productor'),
        buttons: [
          { type: 'secondary', label: _('common.cancel') },
          { type: 'danger', label: _('common.delete'), returnValue: true },
        ],
      })
      .pipe(
        switchMap(response =>
          response
            ? this.dataService.mutate<
                any, // DeleteVendor.Mutation,
                any // DeleteVendor.Variables
              >(DELETE_PRODUCTOR, { input: id })
            : EMPTY,
        ),
      )
      .subscribe(
        response => {
          const data = response.deleteProductor;
          if ('errorCode' in data) {
            this.notificationService.error(_('productor-plugin.' + data.errorCode), {
              entity: 'Productor',
            });
            return;
          }

          this.notificationService.success(_('common.notify-delete-success'), {
            entity: 'Productor',
          });
          this.refresh();
        },
        () => {
          this.notificationService.error(_('common.notify-delete-error'), {
            entity: 'Productor',
          });
        },
      );
  }
}
