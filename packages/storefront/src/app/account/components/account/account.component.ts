import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { SignOut, GetAccountOverview } from '../../../common/generated-types';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';
import { CartManager } from './../../../shared/services/cart.manager';
import { ChannelSelectionService } from './../../../shared/services/channel-selection.service';

import { SIGN_OUT } from './account.graphql';

@Component({
  selector: 'vsf-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent implements OnInit {
  isSignedIn$: Observable<boolean>;
  isOrderGroupEnabled$: Observable<boolean>;
  activeCustomer$: Observable<GetAccountOverview.ActiveCustomer>;

  constructor(
    private dataService: DataService,
    private stateService: StateService,
    private cartManager: CartManager,
    private router: Router,
    private channelSelectionService: ChannelSelectionService,
  ) {
    this.isSignedIn$ = this.stateService.select(state => state.signedIn);
    this.isOrderGroupEnabled$ = this.cartManager.orderGroupsAllowed$;
  }

  ngOnInit(): void {
    this.activeCustomer$ = this.stateService
      .select(state => state.activeCustomer)
      .pipe(filter(notNullOrUndefined));
  }

  signOut() {
    this.dataService.mutate<SignOut.Mutation>(SIGN_OUT).subscribe({
      next: () => {
        this.stateService.setState('signedIn', false);
        const token = this.channelSelectionService.getSelectedChannelToken();
        if (token) {
          this.router.navigate(['/', token, 'catalogo']);
        } else {
          this.router.navigate(['/']);
        }
      },
    });
  }
}
