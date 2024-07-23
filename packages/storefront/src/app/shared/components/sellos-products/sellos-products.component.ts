import { Component, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { hardcodedDescriptions } from '../sello/sello-description';
import { SelloProducto } from './sellos-products';
import { getSelloDescription } from './sellos-products.utils';

@Component({
  selector: 'vsf-sellos-products',
  templateUrl: './sellos-products.component.html',
  styleUrls: ['./sellos-products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellosProductsComponent implements OnChanges {
  @Input() sellos: SelloProducto[];
  @Input() size: 'sm';
  currentSello: string;
  sello = {};
  constructor(private modalService: NgbModal) {}

  ngOnChanges() {
    this.sellos = this.sellos.filter(sello =>
      hardcodedDescriptions.map((item: any) => item.code).includes(sello.code || sello),
    );
  }

  openModalSello(content: string, sello: SelloProducto) {
    this.currentSello = sello?.code ? sello.code : (sello as unknown as string);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true });
    this.sello = getSelloDescription(this.currentSello);
  }
}
