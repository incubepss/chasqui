import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { DataService } from '@vendure/admin-ui/core';
import { Subject } from 'rxjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { OrdersFlowState } from '../../services/ordersFlow-state';

dayjs.locale('es');

export type DateRange = {
  start?: Date;
  end?: Date;
};

export type OptionSimpleValue = {
  label: string;
  value: DateRange;
};

@Component({
  selector: 'chq-dates-filter',
  templateUrl: './dates-filter.component.html',
  styleUrls: ['./dates-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatesFilterComponent implements OnInit {
  @Output() change = new EventEmitter<DateRange>();
  debouncer: Subject<DateRange> = new Subject<DateRange>();

  _startDate: Date | undefined;
  _endDate: Date | undefined;

  private enabledTrigger = false;
  mode: 'simple' | 'custom' = 'simple';

  label = 'Fecha';
  options: Array<OptionSimpleValue> = [];

  constructor(
    private dataService: DataService,
    private changeDetector: ChangeDetectorRef,
    private orderFlowState: OrdersFlowState,
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.enabledTrigger = true;
    });

    this.mode = this.orderFlowState.dateFilterState.mode;
    this.label = this.orderFlowState.dateFilterState.label;
    this._startDate = this.orderFlowState.dateRange?.start;
    this._endDate = this.orderFlowState.dateRange?.end;

    const today = dayjs().startOf('day');
    const currentMonth = dayjs().startOf('month');
    const lastMonth = currentMonth.subtract(1, 'month');

    this.options.push({
      label: 'Últimos 7 días',
      value: {
        start: today.subtract(7, 'days').toDate(),
      },
    });
    this.options.push({
      label: 'Últimos 14 días',
      value: {
        start: today.subtract(14, 'days').toDate(),
      },
    });
    this.options.push({
      label: `Este mes (${currentMonth.format('MMMM YYYY')})`,
      value: {
        start: currentMonth.startOf('month').toDate(),
        end: currentMonth.endOf('month').toDate(),
      },
    });
    this.options.push({
      label: `Mes anterior (${lastMonth.format('MMMM YYYY')})`,
      value: {
        start: lastMonth.startOf('month').toDate(),
        end: lastMonth.endOf('month').toDate(),
      },
    });
  }

  get startDate(): Date | undefined {
    return this._startDate;
  }

  set startDate(value: Date | undefined) {
    this._startDate = value;
    this.triggerChange();
  }

  get endDate(): Date | undefined {
    return this._endDate;
  }

  set endDate(value: Date | undefined) {
    this._endDate = value;
    this.triggerChange();
  }

  setMode(value: 'custom' | 'simple') {
    this.mode = value;
    this.orderFlowState.dateFilterState.mode = this.mode;
    if (value === 'simple') {
      this.label = 'Fecha';
      this._startDate = undefined;
      this._endDate = undefined;
      this.triggerChange();
      this.orderFlowState.dateFilterState.label = this.label;
    }
    this.changeDetector.markForCheck();
  }

  setOption(opt: OptionSimpleValue) {
    this._startDate = opt.value?.start;
    this._endDate = opt.value?.end;
    this.label = opt.label;
    this.orderFlowState.dateFilterState.label = this.label;
    this.triggerChange();
  }

  triggerChange() {
    if (!this.enabledTrigger) {
      return;
    }

    this.change.emit({
      start: this.startDate,
      end: this.endDate,
    });
  }

  onChangeSimple(event: any) {
    event.stopPropagation();
    const newValue = event.target.value;
    this.setMode(newValue === 'custom' ? 'custom' : 'simple');
  }
}
