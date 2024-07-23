import { NgSelectComponent } from '@ng-select/ng-select';
import { Component, Input, ViewChild, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { DataService } from '@vendure/admin-ui/core';

const SELLOS_PRODUCTORES = ['agricultura_familiar', 'cooperativas', 'empresa_social', 'recuperadas'];

@Component({
  selector: 'sellos-productor-selector',
  styleUrls: ['./sellos-productor-selector.scss'],
  template: `<ng-select
    class="sellosProductorSelector"
    [items]="sellos"
    (change)="onChange($event)"
    [(ngModel)]="selectedSellos"
    [multiple]="true"
    [hideSelected]="true"
  >
    <ng-template ng-label-tmp let-item="item" class="sello-item">
      <div class="selloBox">
        <span [ngClass]="getClassSello(item)"></span>
        <span class="selloBox-label">{{ getLabel(item) | translate }}</span>
        <span class="selloBox-clear" (click)="clear(item)" aria-hidden="true">×</span>
      </div>
    </ng-template>
    <ng-template ng-option-tmp let-item="item">
      <div class="selloBox selloBox--horizontal">
        <span [ngClass]="getClassSello(item)"></span>
        <span class="selloBox-label">{{ getLabel(item) | translate }}</span>
      </div>
    </ng-template>
  </ng-select>`,
})
export class SellosProductorSelector {
  @Input() readonly: boolean;
  @Input() config: any;
  @Input()
  selectedSellos: string[];
  @Output() change = new EventEmitter<string[]>();

  @ViewChild(NgSelectComponent) private ngSelect: NgSelectComponent;

  sellos: string[] = SELLOS_PRODUCTORES;

  constructor(private dataService: DataService, private changeDetector: ChangeDetectorRef) {}

  getClassSello(item): string {
    return `sello sello-${item}`;
  }

  getLabel(item: string): string {
    return 'productor-plugin.' + item;
  }

  clear(item: string): void {
    this.selectedSellos = this.selectedSellos.filter(sello => sello !== item);
    this.changeDetector.markForCheck();
    this.change.emit(this.selectedSellos);
  }

  onChange(selected: string[]): void {
    selected = selected || null;
    this.change.emit(selected);
  }
}

export default SellosProductorSelector;
