import { Injectable } from '@angular/core';

import { StateService } from '../../core/providers/state/state.service';

import { OrderGroupService } from './order-group.service';

/**
 * Este manager resuelve story #74 zentao
 * http://zentao.1961.com.ar/story-view-74.html&tid=bm91jjsg?tid=xh0umzuk
 *
 * Mantiene el enlace al grupo en varios escenarios luego de ingresar como usuario
 */
@Injectable({
  providedIn: 'root',
})
export class OrderGroupManager {
  private contextOrderGroupCode: string | null = null;
  private contextAlias = '';
  private signedIn: boolean | undefined;

  constructor(private stateService: StateService, private orderGroupService: OrderGroupService) {
    this.stateService.select(state => state.signedIn).subscribe(this.onChangeSignedin.bind(this));
  }

  async assignActiveOrderToGroup(orderCode: string, alias: string) {
    if (!this.signedIn) {
      this.contextOrderGroupCode = orderCode;
      this.contextAlias = alias;
    }
    return this.orderGroupService.assignActiveOrderToGroup(orderCode, alias);
  }

  onChangeSignedin(signedIn: boolean | undefined) {
    this.signedIn = signedIn;
    this.validateLinkToGroup();
  }

  async validateLinkToGroup() {
    if (this.signedIn && this.contextOrderGroupCode) {
      await this.orderGroupService.assignActiveOrderToGroup(this.contextOrderGroupCode, this.contextAlias);
      this.contextOrderGroupCode = null;
      this.contextAlias = '';
    }
  }
}
