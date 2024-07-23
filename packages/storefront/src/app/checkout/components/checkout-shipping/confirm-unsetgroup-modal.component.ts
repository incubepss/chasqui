import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'vsf-confirm-unsetgroup-modal',
  template: `
    <div class="modal-body">
      <p>¿Querés desvincular tu pedido del grupo?</p>
      <p class="text-muted">Si confirmas, tu compra seguirá como pedido individual</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="modal.dismiss(false)">cancelar</button>
      <button type="button" class="btn btn-success" (click)="modal.close(true)">Desvincular grupo</button>
    </div>
  `,
})
export class ConfirmUnsetGroupModalComponent {
  constructor(public modal: NgbActiveModal) {}
}
