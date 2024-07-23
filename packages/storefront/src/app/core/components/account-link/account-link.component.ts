import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { DataService } from '../../providers/data/data.service';
import { StateService } from '../../providers/state/state.service';

import { GetActiveCustomer } from '../../../common/generated-types';
import { GET_ACTIVE_CUSTOMER } from '../../../common/graphql/documents.graphql';
import { CartManager } from './../../../shared/services/cart.manager';
import { UserInteractionService } from './../../../shared/services/user-interaction.service';

@Component({
  selector: 'vsf-account-link',
  templateUrl: './account-link.component.html',
  styleUrls: ['./account-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountLinkComponent implements OnInit {
  activeCustomer$: Observable<GetActiveCustomer.ActiveCustomer | undefined>;

  private refresh = new BehaviorSubject<void>(undefined);

  constructor(
    private dataService: DataService,
    private stateService: StateService,
    private cartManager: CartManager,
    private userInteractionService: UserInteractionService,
  ) {}

  ngOnInit() {
    this.userInteractionService.onBackToTab$.subscribe(() => {
      this.refresh.next();
    });

    const signedId$ = this.stateService.select(state => state.signedIn);
    this.activeCustomer$ = combineLatest([signedId$, this.refresh]).pipe(
      switchMap(() => {
        return this.dataService.query<GetActiveCustomer.Query>(GET_ACTIVE_CUSTOMER, {}, 'network-only');
      }),
      map(data => {
        return data?.activeCustomer;
      }),
    );

    this.activeCustomer$.subscribe(activeCustomer => {
      this.stateService.setState('activeCustomer', activeCustomer || null);
      if (!activeCustomer) {
        this.cartManager.refresh();
      }
    });
  }

  userName(customer: NonNullable<GetActiveCustomer.ActiveCustomer>): string {
    const { firstName, lastName, emailAddress } = customer;
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else {
      return emailAddress;
    }
  }
}
