import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { DataService } from '@vendure/admin-ui/core';

export type DateRange = {
  start?: Date;
  end?: Date;
};

export type OptionSimpleValue = {
  label: string;
  value: DateRange;
};

@Component({
  selector: 'chq-ordergroup-state-label',
  templateUrl: './orderGroup-state-label.component.html',
  styleUrls: ['./orderGroup-state-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderGroupStateLabelComponent implements OnInit {
  @Input()
  state: string;

  constructor(private dataService: DataService, private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {}

  get chipColorType() {
    let color = 'warning';
    if (this.state === 'Delivered') {
      color = 'success';
    } else if (this.state === 'AddingOrders') {
      color = '';
    }

    return color;
  }
}
