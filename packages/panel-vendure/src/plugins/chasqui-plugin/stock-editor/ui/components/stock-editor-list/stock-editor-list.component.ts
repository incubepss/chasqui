/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ProductVariant } from '@vendure/core';
import { DataService, NotificationService } from '@vendure/admin-ui/core';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { shareReplay, switchMap, debounceTime, take } from 'rxjs/operators';
import { EXPORT_PRODUCT_VARIANTS, GET_PRODUC_VARIANTS } from './stock-editor-list.graphql';

interface IRawForExport {
  updatedAt: string;
  enabled: boolean;
  name: string;
  priceWithTax;
  stockOnHand;
  stockAllocated;
  sku: string;
  product: {
    enabled: boolean;
    customFields: {
      productor: {
        name: string;
      };
    };
  };
}

@Component({
  selector: 'vsf-stock-editor-list',
  templateUrl: './stock-editor-list.component.html',
  styleUrls: ['./stock-editor-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockEditorListComponent implements OnInit {
  filterOrderState = 'NUEVOS';

  showByProductores = false;

  productVariants$: Observable<any[]>;
  loading$: Observable<boolean>;

  editRecord = null;
  saving = false;
  coping = false;

  filterKeyString = '';
  filterEnabled = '';
  filterStockLowerThan = '';
  sortBy = 'sku';
  sortDirection: 'ASC' | 'DESC' = 'ASC';
  currentPage = 0;
  itemsPerPage = 10;
  totalItems = 0;

  private channelPriceIncludesTax$: Observable<boolean>;
  private channelPriceIncludesTax = true;
  private refresh = new BehaviorSubject<void>(undefined);

  readonly updatePermission = ['UpdateCatalog', 'UpdateProduct'];
  private allowEdit = false;

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.channelPriceIncludesTax$ = this.dataService.settings
      .getActiveChannel('cache-first')
      .refetchOnChannelChange()
      .mapStream(data => data.activeChannel.pricesIncludeTax)
      .pipe(shareReplay(1));

    this.channelPriceIncludesTax$.subscribe(response => {
      this.channelPriceIncludesTax = response;
    });

    this.dataService.client.userStatus().single$.subscribe(result => {
      this.allowEdit = this.updatePermission.reduce<boolean>((tmp, p) => {
        // @ts-ignore
        return tmp && result.userStatus.permissions.indexOf(p) > -1;
      }, true);
    });

    this.productVariants$ = this.refresh.pipe(
      debounceTime(100),
      switchMap(() => {
        const { filter, sort } = this._makeFilterAndSort();

        return this.dataService
          .query(GET_PRODUC_VARIANTS, {
            options: {
              take: this.itemsPerPage,
              skip: this.currentPage * this.itemsPerPage,
              filterOperator: 'AND',
              filter,
              sort,
            },
          })
          .refetchOnChannelChange()
          .mapStream((result: any) => {
            this.totalItems = result.productVariants.totalItems;
            return result.productVariants.items;
          });
      }),
    );
  }

  _makeFilterAndSort(): { filter: any; sort: any } {
    const filter: any = {};
    const sort: any = {};
    if (this.filterKeyString) {
      filter.key = { contains: this.filterKeyString };
    }

    if (this.filterEnabled) {
      filter.enabled = { eq: this.filterEnabled === 'true' };
    }

    if (this.filterStockLowerThan) {
      filter.stockOnHand = { lt: parseInt(this.filterStockLowerThan) };
    }

    if (this.sortBy) {
      sort[this.sortBy] = this.sortDirection;
    }

    return {
      sort,
      filter,
    };
  }

  onChangePage(page: number) {
    this.currentPage = page;
    this.refresh.next();
  }

  onChangePerPage(count: any) {
    this.currentPage = 0;
    this.itemsPerPage = parseInt(count) || 10;
    this.refresh.next();
  }

  edit(pv: any, autoSelect?: string) {
    if (!this.allowEdit) {
      return;
    }

    this.editRecord = pv ? { ...pv } : null;
    this.changeDetector.markForCheck();

    if (autoSelect) {
      setTimeout(() => {
        let elem = document.querySelector(`input[name="${autoSelect}"]`);
        if (!elem) {
          elem = document.querySelector(`vdr-currency-input[name="${autoSelect}"] input`);
        }

        if (elem instanceof HTMLInputElement) {
          elem.focus();
          elem.select();
        }
      });
    }
  }

  applyFilters() {
    this.currentPage = 0;
    this.refresh.next();
  }

  clearFilters() {
    this.currentPage = 0;
    this.filterEnabled = '';
    this.filterKeyString = '';
    this.filterStockLowerThan = '';
    this.sortBy = 'sku';
    this.sortDirection = 'ASC';
    this.refresh.next();
  }

  async toClipboard() {
    // buscar los registros sin paginar
    this.coping = true;
    this.changeDetector.markForCheck();
    const { filter, sort } = this._makeFilterAndSort();
    const records = await this.dataService
      .query(EXPORT_PRODUCT_VARIANTS, {
        options: {
          filterOperator: 'AND',
          filter,
          sort,
        },
      })
      .mapSingle((result: any) => result.productVariants.items)
      .toPromise();

    // preparar to clipboard
    const rows = this.to2DPlainArray(records);

    // copiar
    const rowsTxt = rows.map(lines => lines.join('\t')).join('\n');
    this.copyTextToClipboard(rowsTxt);

    // listo
    this.coping = false;
    this.changeDetector.markForCheck();
  }

  applySortBy(fieldName: string) {
    this.currentPage = 0;
    if (this.sortBy === fieldName) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortDirection = 'ASC';
    }
    this.sortBy = fieldName;
    this.refresh.next();
  }

  cancel() {
    this.edit(null);
  }

  async save() {
    if (!this.editRecord) {
      return;
    }

    const channelPriceIncludesTax = this.channelPriceIncludesTax$.pipe(take(1));

    const record = this.editRecord;

    this.saving = true;
    this.changeDetector.markForCheck();

    // @ts-ignore
    await this.saveMakeSureEnabledProduct(record);

    await this.dataService.product
      .updateProductVariants([
        {
          // @ts-ignore
          id: record.id,
          // @ts-ignore
          price: channelPriceIncludesTax ? record.priceWithTax : record.price,
          // @ts-ignore
          stockOnHand: record.stockOnHand,
          // @ts-ignore
          enabled: record.enabled,
        },
      ])
      .toPromise();

    this.saving = false;
    this.editRecord = null;
    this.changeDetector.markForCheck();
  }

  async saveMakeSureEnabledProduct(productVariant: ProductVariant) {
    // @ts-ignore
    if (productVariant.enabled && !productVariant.product.enabled) {
      await this.dataService.product
        .updateProduct({
          // @ts-ignore
          id: productVariant.product.id,
          enabled: true,
        })
        .toPromise();
    }
  }

  private to2DPlainArray(records: Array<IRawForExport>): string[][] {
    return records.reduce(
      (tmp, item) => {
        tmp.push([
          item.product?.customFields?.productor?.name || '',
          item.sku.toString(),
          item.name,
          (item.priceWithTax / 100).toString(),
          item.stockOnHand.toString(),
          item.stockAllocated.toString(),
          item.enabled ? 'habiltada' : 'no habilitada',
          item.product.enabled ? 'habiltado' : 'no habilitado',
          item.updatedAt,
        ]);
        return tmp;
      },
      [
        [
          'productor',
          'Código del producto',
          'Nombre de variante',
          'Precio',
          'Stock',
          'Reservado',
          'estado Variante',
          'estado Producto',
          'Última modificación',
        ],
      ],
    );
  }

  private copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      this.notificationService.error('El portapapeles no está disponible');
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => {
        this.notificationService.success('Registros copiados en el portapapeles');
      },
      () => {
        this.notificationService.error('No se pudo copiar los registros');
      },
    );
  }
}
