import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { StateService } from '../../providers/state/state.service';
import { Channel, PaymentMethod } from '../../../common/generated-types';

@Component({
  selector: 'vsf-layout-footer',
  templateUrl: './layout-footer.component.html',
  styleUrls: ['./layout-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutFooterComponent implements OnInit {
  channel$: Observable<Channel | null>;
  paymentMethods$: Observable<PaymentMethod[] | null>;

  constructor(private stateService: StateService) {}

  ngOnInit(): void {
    this.channel$ = this.stateService.select(state => state.activeChannel);
    this.paymentMethods$ = this.stateService.select(state => state.paymentMethods);
  }
}
