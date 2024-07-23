import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { DataService } from '@vendure/admin-ui/core';

import { Observable } from 'rxjs';

@Component({
  selector: 'chq-shipping-method-filter',
  templateUrl: './shippingMethod-filter.component.html',
  styleUrls: ['./shippingMethod-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShippingMethodFilterComponent implements OnInit {
  shippingMethods$: Observable<any[]>;
  @Input() selected: any = null;

  @Output() change = new EventEmitter<any>();

  constructor(private dataService: DataService, private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.shippingMethods$ = this.dataService.shippingMethod
      .getShippingMethods()
      .refetchOnChannelChange()
      .mapStream((result: any) => {
        return result.shippingMethods.items;
      });
  }

  onSelect(item: any) {
    this.selected = item;
    this.change.emit(item);
    this.changeDetector.markForCheck();
  }
}
