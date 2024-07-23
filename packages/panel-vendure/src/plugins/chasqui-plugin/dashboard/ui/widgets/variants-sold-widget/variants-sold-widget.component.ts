import dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap, take } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, NgModule, OnInit } from '@angular/core';
import { CoreModule, DataService, NotificationService } from '@vendure/admin-ui/core';

import { GET_VARIANTS_SOLD } from './variants-sold-widget.graphql';

export type Timeframe = 'day' | 'week' | 'month' | 'lastMonth';

@Component({
  selector: 'chq-variants-sold-widget',
  templateUrl: './variants-sold-widget.component.html',
  styleUrls: ['./variants-sold-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantsSoldWidgetComponent implements OnInit {
  today = new Date();
  yesterday = new Date(new Date().setDate(this.today.getDate() - 1));
  variantsSold$: Observable<any[]>;
  currencyCode$: Observable<string | undefined>;
  selection$ = new BehaviorSubject<{ timeframe: Timeframe; date?: Date }>({
    timeframe: 'month',
    date: this.today,
  });
  dateRange$: Observable<{ start: Date; end: Date }>;

  constructor(private dataService: DataService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.dateRange$ = this.selection$.pipe(
      distinctUntilChanged(),
      map(selection => {
        if (selection.timeframe === 'lastMonth') {
          return {
            start: dayjs(selection.date).subtract(1, 'M').startOf('month').toDate(),
            end: dayjs(selection.date).subtract(1, 'M').endOf('month').toDate(),
          };
        }
        return {
          start: dayjs(selection.date).startOf(selection.timeframe).toDate(),
          end: dayjs(selection.date).endOf(selection.timeframe).toDate(),
        };
      }),
      shareReplay(1),
    );
    this.variantsSold$ = this.dateRange$.pipe(
      switchMap(({ start, end }) => {
        const options = {
          filter: {
            orderPlacedAt: {
              between: {
                start: start.toISOString(),
                end: end.toISOString(),
              },
            },
          },
        };

        return this.dataService
          .query<any, any>(GET_VARIANTS_SOLD, {
            options,
          })
          .refetchOnChannelChange()
          .mapStream(data => data.variantsSold);
      }),
      shareReplay(1),
    );

    this.currencyCode$ = this.dataService.settings
      .getActiveChannel()
      .refetchOnChannelChange()
      .mapStream(data => data.activeChannel.currencyCode || undefined);
  }

  async toClipboard() {
    const records = await this.variantsSold$.pipe(take(1)).toPromise();

    // preparar to clipboard
    const rows = this.to2DPlainArray(records);

    // copiar
    const rowsTxt = rows.map(lines => lines.join('\t')).join('\n');
    this.copyTextToClipboard(rowsTxt);
  }

  private to2DPlainArray(records: Array<any>): string[][] {
    return records.reduce(
      (tmp, item) => {
        tmp.push([item.sku.toString(), item.name, item.count.toString(), (item.amount / 100).toString()]);
        return tmp;
      },
      [['sku', 'nombre de variante', 'cantidad', 'monto']],
    );
  }

  private copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      this.notificationService.error('El portapapeles no está disponible');
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => {
        this.notificationService.success('Registros copiados en el portapapeles');
      },
      () => {
        this.notificationService.error('No se pudo copiar los registros');
      },
    );
  }
}

@NgModule({
  imports: [CoreModule],
  declarations: [VariantsSoldWidgetComponent],
})
export class VariantsSoldWidgetModule {}
