import { ID } from '@vendure/common/lib/shared-types';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ModalService, NotificationService, DataService } from '@vendure/admin-ui/core';
import { Observable, EMPTY, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { DELETE_SURCHARGE, GET_SURCHARGES } from './customSurcharge-list.graphql';

@Component({
  selector: 'pe-customSurcharge-list',
  templateUrl: './customSurcharge-list.component.html',
  styleUrls: ['./customSurcharge-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomSurchargeListComponent implements OnInit {
  surcharges$: Observable<any[]>;
  private refresh = new BehaviorSubject<void>(undefined);

  constructor(
    private dataService: DataService,
    private modalService: ModalService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.surcharges$ = this.refresh.pipe(
      switchMap(() => {
        return this.dataService
          .query(GET_SURCHARGES)
          .refetchOnChannelChange()
          .mapStream((r: any) => r.customSurcharges);
      }),
    );
  }

  delete(id: ID): void {
    this.modalService
      .dialog({
        title: 'customSurcharge-plugin.confirm-delete',
        buttons: [
          { type: 'secondary', label: 'common.cancel' },
          { type: 'danger', label: 'common.delete', returnValue: true },
        ],
      })
      .pipe(
        switchMap(response => (response ? this.dataService.mutate(DELETE_SURCHARGE, { input: id }) : EMPTY)),
      )
      .subscribe(
        (response: any) => {
          const data = response.deleteCustomSurcharge;
          if ('errorCode' in data) {
            this.notificationService.error('productor-plugin.' + data.errorCode, {
              entity: 'CustomSurcharge',
            });
            return;
          }

          this.notificationService.success('common.notify-delete-success', {
            entity: 'CustomSurcharge',
          });

          this.refresh.next();
        },
        () => {
          this.notificationService.error('common.notify-delete-error', {
            entity: 'CustomSurcharge',
          });
          this.refresh.next();
        },
      );
  }
}
