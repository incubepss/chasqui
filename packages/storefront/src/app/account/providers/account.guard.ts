import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { take } from 'rxjs/operators';

import { ChannelSelectionService } from '../../shared/services/channel-selection.service';
import { GetActiveCustomer } from '../../common/generated-types';
import { GET_ACTIVE_CUSTOMER } from '../../common/graphql/documents.graphql';
import { DataService } from '../../core/providers/data/data.service';
import { StateService } from '../../core/providers/state/state.service';

@Injectable({ providedIn: 'root' })
export class AccountGuard implements CanActivate {
  constructor(
    private stateService: StateService,
    private channelSelectionService: ChannelSelectionService,
    private dataService: DataService,
    private router: Router,
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    if (!this.channelSelectionService.getSelectedChannelToken()) {
      // No hay canal desaginado, redirige a multitienda, para que se elija una
      this.router.navigate(['/']);
      return false;
    }

    const data = await this.dataService
      .query<GetActiveCustomer.Query>(GET_ACTIVE_CUSTOMER, {}, 'no-cache')
      .pipe(take(1))
      .toPromise();
    const isThereCustomer = !!data?.activeCustomer;
    this.stateService.setState('activeCustomer', data?.activeCustomer || null);
    if (!isThereCustomer) {
      this.router.navigate(['/micuenta', 'ingresar']);
    }
    return isThereCustomer;
  }
}
