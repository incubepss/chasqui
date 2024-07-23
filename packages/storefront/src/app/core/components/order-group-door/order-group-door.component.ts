import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, take, tap } from 'rxjs/operators';

import { GetActiveOrder, OrderGroup } from '../../../common/generated-types';
import { OrderGroupService } from '../../../shared/services/order-group.service';

import { NotificationService } from '../../providers/notification/notification.service';
import { StateService } from '../../providers/state/state.service';
import { CartManager } from './../../../shared/services/cart.manager';
import { OrderGroupManager } from './../../../shared/services/order-group.manager';
import { ChannelSelectionService } from './../../../shared/services/channel-selection.service';

@Component({
  selector: 'vsf-order-group-door',
  templateUrl: './order-group-door.component.html',
  styleUrls: ['./order-group-door.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderGroupDoorComponent implements OnInit {
  @ViewChild('groupDoorModal') groupDoorModal: TemplateRef<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderGroupService: OrderGroupService,
    private orderGroupManager: OrderGroupManager,
    private channelSelectionService: ChannelSelectionService,
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private cartManager: CartManager,
    private stateService: StateService,
  ) {}

  orderGroup$: Observable<any>;
  loading$ = new BehaviorSubject<boolean>(true);
  orderGroupEnabled$: Observable<boolean>;

  modalRef: NgbModalRef | null;
  alias = '';

  async ngOnInit() {
    this.alias = this.getLastAlias();

    this.orderGroupEnabled$ = this.stateService.select(
      // Nota: por ahora siempre activo para sumar pedidos
      // Nota: el "!state.activeChannel" es para evitar flash en feedback en la UI
      // mientras se espera del back el canal activo.
      // asi que en este caso, se considera de forma optimista que estará activo
      state => true || state.orderGroupEnabled || !state.activeChannel,
    );

    this.openUseUrlCode();
  }

  async openUseUrlCode() {
    // si ya hay un modal abierto, cancela apertura
    if (this.modalRef) {
      return;
    }

    const params = await this.route.queryParams.pipe(take(1)).toPromise();
    const orderGroupCode = params?.gcode;
    if (orderGroupCode) {
      this.open(orderGroupCode);
    }
  }

  async open(code: string) {
    this.openModal();
    this.orderGroup$ = this.orderGroupService.findByCode(code).pipe(
      map(data => data.orderGroupByCode),
      tap(() => this.loading$.next(false)),
      shareReplay(1),
    );

    await this.orderGroup$.pipe(take(1)).toPromise();
  }

  openModal() {
    this.modalRef = this.modalService.open(this.groupDoorModal, { backdrop: 'static', centered: true });
  }

  cancel() {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
  }

  close() {
    const tokenChannel = this.channelSelectionService.getSelectedChannelToken();
    this.router.navigate(['/', tokenChannel, 'catalogo'], { replaceUrl: true });
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
  }

  async applyJoinOrderGroup(orderGroup: OrderGroup) {
    const tokenChannel = this.channelSelectionService.getSelectedChannelToken();
    if (orderGroup.channel?.token !== tokenChannel) {
      this.notificationService.error('El grupo pertenece a otra tienda, no puede ser usado en la actual');
      return;
    }

    try {
      this.setLastAlias(this.alias);
      const result = await this.orderGroupManager.assignActiveOrderToGroup(orderGroup.code, this.alias);

      if ((result as any).__typename === 'DisabledOrderGroupsError') {
        this.notificationService.error(
          'Los pedidos en grupo, están deshabilitados actualmente en la tienda',
          '¡uy!',
        );
        return;
      }

      if ((result as any).__typename === 'Order') {
        this.cartManager.setActiveOrder(result as GetActiveOrder.ActiveOrder);
      } else {
        this.notificationService.error('No se pudo unir tu pedido al grupo', '¡uy!');
      }
      this.close();
    } catch (e) {
      this.notificationService.error('No se pudo unir tu pedido al grupo');
    }
  }

  getLastAlias(): string {
    return window.localStorage.getItem('lastAlias') || '';
  }

  setLastAlias(value: string) {
    window.localStorage.setItem('lastAlias', value);
  }
}
