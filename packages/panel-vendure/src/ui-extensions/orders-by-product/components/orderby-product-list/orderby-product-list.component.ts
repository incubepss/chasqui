import { DataService, NotificationService } from '@vendure/admin-ui/core';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable, BehaviorSubject, merge } from 'rxjs';
import { map, switchMap, mapTo, debounceTime, take } from 'rxjs/operators';

import { SharedFilterState } from '../../../shared/services/sharedFilter-state';

import { FIND_ORDERS_BY_PRODUCT } from './orderby-product-list.graphql';

type StockStatus = 'suficiente' | 'limitado' | 'faltante';

interface IRawByProducto {
  productorId: string;
  productorNombre: string;
  productoNombre: string;
  productoSku: string;
  cantidad: number;
  stockOnHand: number;
  stockAllocated: number;
  listPrice: number;
  subTotallistPrice: number;
}

interface IGroupedByProductor {
  countUnidades: number;
  countProductos: number;
  subTotal: number;
  name: string;
  id: string;
  stockStatus: StockStatus;
  productos: Array<IByProducto>;
}

interface IByProducto extends IRawByProducto {
  stockDiff: number;
  stockStatus: StockStatus;
}

@Component({
  selector: 'vsf-orderby-product-list',
  templateUrl: './orderby-product-list.component.html',
  styleUrls: ['./orderby-product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderbyProductListComponent implements OnInit {
  filterOrderState = 'NUEVOS';

  showByProductores = false;

  byProducts$: Observable<IRawByProducto[]>;
  byProductor$: Observable<IGroupedByProductor[]>;
  loading$: Observable<boolean>;

  detailState = null;

  private refresh = new BehaviorSubject<void>(undefined);

  public get filterShippingMethod() {
    return this.sharedState.filterShippingMethod;
  }

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private sharedState: SharedFilterState,
  ) {}

  ngOnInit(): void {
    this.byProducts$ = this.refresh.pipe(
      debounceTime(200),
      switchMap(() => {
        const inputFilter: any = {
          orderState: this.filterOrderState,
        };

        if (this.filterShippingMethod) {
          inputFilter.shippingMethodId = this.filterShippingMethod.id;
        }
        return this.dataService
          .query(FIND_ORDERS_BY_PRODUCT, {
            input: inputFilter,
          })
          .refetchOnChannelChange()
          .mapStream((result: any) => {
            return result.ordersByProduct.map(item => this.transformRawProducto(item));
          });
      }),
    );

    this.byProductor$ = this.byProducts$.pipe(
      map(item => {
        return this.groupByProductor(item);
      }),
    );

    this.loading$ = merge(this.refresh.pipe(mapTo(true)), this.byProducts$.pipe(mapTo(false)));
  }

  openDetail(item: any) {
    this.detailState = item;
  }

  onFilterState(nextState: string) {
    this.filterOrderState = nextState;
    this.refresh.next();
  }

  onFilterShippingMethod(shippingMethod: any) {
    this.sharedState.filterShippingMethod = shippingMethod;
    this.refresh.next();
  }

  onRefresh() {
    this.refresh.next();
  }

  protected groupByProductor(raw: Array<IRawByProducto>): Array<IGroupedByProductor> {
    const mapByProductor = raw?.reduce((map, rawItem) => {
      let productor = map.get(rawItem.productorId);

      if (!productor) {
        productor = {
          id: rawItem.productorId,
          name: rawItem.productorNombre,
          countUnidades: 0,
          countProductos: 0,
          subTotal: 0,
          stockStatus: 'suficiente',
          productos: [],
        };

        map.set(rawItem.productorId, productor);
      }

      const item = this.transformRawProducto(rawItem);
      productor.productos.push(item);
      productor.countProductos += 1;
      productor.countUnidades += item.cantidad;
      productor.subTotal += item.subTotallistPrice;
      productor.stockStatus = this.calcNewStockStatus(productor.stockStatus, item.stockStatus);

      return map;
    }, new Map<string, IGroupedByProductor>());

    const productores = [...mapByProductor.values()];
    return productores;
  }

  async toClipboard() {
    const records = await this.byProducts$.pipe(take(1)).toPromise();
    const rows = this.to2DPlainArray(records);

    const rowsTxt = rows.map(lines => lines.join('\t')).join('\n');
    this.copyTextToClipboard(rowsTxt);
  }

  private to2DPlainArray(records: Array<IRawByProducto>): string[][] {
    if (this.filterOrderState === 'NUEVOS') {
      // CON STOCK
      return records.reduce(
        (tmp, item) => {
          tmp.push([
            item.productorNombre,
            item.productoNombre,
            item.productoSku,
            (item.listPrice / 100).toString(),
            item.stockOnHand.toString(),
            item.cantidad.toString(),
            (item.subTotallistPrice / 100).toString(),
            this.filterOrderState,
          ]);
          return tmp;
        },
        [
          [
            'Nombre del productor',
            'Nombre del producto',
            'Código del producto',
            'Precio unitario',
            'Stock',
            'Cantidad pedida',
            'SubTotal',
            'Estado',
          ],
        ],
      );
    }

    // SIN STOCK
    return records.reduce(
      (tmp, item) => {
        tmp.push([
          item.productorNombre,
          item.productoNombre,
          item.productoSku,
          (item.listPrice / 100).toString(),
          item.cantidad.toString(),
          (item.subTotallistPrice / 100).toString(),
          this.filterOrderState,
        ]);
        return tmp;
      },
      [
        [
          'Nombre del productor',
          'Nombre del producto',
          'Código del producto',
          'Precio unitario',
          'Cantidad pedida',
          'SubTotal',
          'Estado',
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

  protected transformRawProducto(producto: IRawByProducto): IByProducto {
    const stockDiff = producto.stockOnHand - producto.cantidad;
    let stockStatus: StockStatus = 'suficiente';
    if (stockDiff <= 0) {
      stockStatus = 'faltante';
    } else if (stockDiff / producto.stockOnHand < 0.15) {
      stockStatus = 'limitado';
    }

    return {
      ...producto,
      stockDiff,
      stockStatus,
    };
  }

  protected calcNewStockStatus(currentStatus: StockStatus, nextStatus: StockStatus): StockStatus {
    if (nextStatus === 'faltante' || currentStatus === 'faltante') {
      return 'faltante';
    }

    if (nextStatus === 'limitado') {
      return 'limitado';
    }

    return currentStatus;
  }
}
