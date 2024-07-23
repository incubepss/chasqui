import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DataService, NotificationService, ModalService } from '@vendure/admin-ui/core';
import { Observable, EMPTY } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { GET_ODOO_PRODUCTS, IMPORT_PRODUCTS_TO_CHANNEL } from './importer-ui.graphql';

type Product = any;

@Component({
  selector: 'importer-ui',
  templateUrl: './importer-ui.html',
  styleUrls: ['./importer-ui.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ImporterUiComponent implements OnInit {
  products$: Observable<Product[]>;
  currencyCode$: Observable<string | undefined>;
  selected: boolean;
  resultMsg: string;
  private _products: Product[] = [];

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private modalService: ModalService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.products$ = this.dataService.query(GET_ODOO_PRODUCTS).stream$.pipe(
      map((result: any) => {
        this.selected = true;
        this._products = result.getOdooProducts;
        return result.getOdooProducts;
      }),
    );
    this.currencyCode$ = this.dataService.settings
      .getActiveChannel()
      .refetchOnChannelChange()
      .mapStream(data => data.activeChannel.currencyCode || undefined);
  }

  refreshGrid(): void {
    this.selected = false;
    this.ngOnInit();
  }

  price(price: string) {
    return parseFloat(price) * 100;
  }

  doImport() {
    if (this._products.length < 1) {
      this.notificationService.error('No hay productos para importar.');
      return;
    }

    this.modalService
      .dialog({
        title: 'Confirmar la importación',
        body: `Se importarán ${this._products.length} productos`,
        buttons: [
          { type: 'secondary', label: 'common.cancel' },
          { type: 'primary', label: 'Importar', returnValue: true },
        ],
      })
      .pipe(
        switchMap(response =>
          response
            ? this.dataService.mutate(IMPORT_PRODUCTS_TO_CHANNEL, {
                odooProducts: this._products,
              })
            : EMPTY,
        ),
      )
      .subscribe((response: any) => {
        const msg = response.importProductsOdooToChannel;
        this.notificationService.info(msg);
        this.selected = false;
        this.resultMsg = msg;
      });
  }
}
