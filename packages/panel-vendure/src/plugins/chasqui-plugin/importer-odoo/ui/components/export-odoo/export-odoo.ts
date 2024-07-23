import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { EMPTY, Observable } from 'rxjs';
import { debounceTime, takeUntil, switchMap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { BaseListComponent, DataService, NotificationService, ModalService } from '@vendure/admin-ui/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

enum SortOrder {
  Asc = 'ASC',
  Desc = 'DESC',
}
import { GET_ORDERS, EXPORT_ORDER } from './export-odoo.graphql';

@Component({
  selector: 'export-odoo',
  templateUrl: './export-odoo.html',
  styleUrls: ['./export-odoo.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ExportOdooComponent
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
  currencyCode$: Observable<string | undefined>;

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
        return this.dataService.query(GET_ORDERS, args).refetchOnChannelChange();
      },
      data => {
        return data.orders;
      },
      (skip, take) => {
        const searchTermValue = this.searchTerm.value;
        const customerLastName = searchTermValue
          ? {
              contains: searchTermValue,
            }
          : {};
        const opts = {
          options: {
            skip,
            take,
            filter: {
              active: { eq: false },
              state: {
                in: [
                  'PaymentAuthorized',
                  'PaymentSettled',
                  'Shipped',
                  'PartiallyShipped',
                  'PartiallyDelivered',
                  'Delivered',
                  'WithFulfill',
                ],
              },
              customerLastName,
            },
            sort: {
              updatedAt: SortOrder.Desc,
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
    this.currencyCode$ = this.dataService.settings
      .getActiveChannel()
      .refetchOnChannelChange()
      .mapStream(data => data.activeChannel.currencyCode || undefined);
  }

  hasOdooIdInHistory(order): boolean {
    return order.history.items.some(
      item => item.data && item.data.note && item.data.note.startsWith('{"odooId":'),
    );
  }

  export(orderId: string): void {
    this.modalService
      .dialog({
        title: _('odoo-plugin.confirm-export'),
        buttons: [
          { type: 'secondary', label: _('common.cancel') },
          { type: 'primary', label: _('odoo-plugin.export'), returnValue: true },
        ],
      })
      .pipe(
        switchMap(response =>
          response
            ? this.dataService.mutate<
                any, // DeleteVendor.Mutation,
                any // DeleteVendor.Variables
              >(EXPORT_ORDER, { orderId })
            : EMPTY,
        ),
      )
      .subscribe(
        response => {
          const data = response.exportOrderToOdoo;

          this.notificationService.success(_('common.notify-create-success'), {
            entity: `Order (id: ${data})`,
          });
          this.refresh();
        },
        () => {
          this.notificationService.error(_('common.notify-create-error'), {
            entity: 'Order',
          });
        },
      );
  }
}
