import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { ShippingMethod } from '../../../common/generated-types';
import { StateService } from './../../../core/providers/state/state.service';

@Component({
  selector: 'vsf-entregas',
  templateUrl: './entregas.component.html',
  styleUrls: ['./entregas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntregasComponent implements OnInit {
  shippingMethods: ShippingMethod[];
  zones = [
    { name: 'Zonas de envío', typeDelivery: 'shipping' },
    { name: 'Puntos de retiro', typeDelivery: 'showroom' },
  ];
  selectedMethod: ShippingMethod;

  channelName$: Observable<string>;

  constructor(
    private stateService: StateService,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.shippingMethods = this.route.snapshot.data.shippingMethods;
    this.channelName$ = this.stateService.select(s => s.activeChannelName);
  }

  filterItemsOfType(type: string) {
    return this.shippingMethods.filter(method => method.customFields?.typeDelivery === type);
  }

  onShownMethod(method: any) {
    if (method) {
      this.selectedMethod = method;
      this.changeDetector.markForCheck();
    }
  }
}
