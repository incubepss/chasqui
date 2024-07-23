import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedFilterState {
  protected _filterShippingMethod: any = null;
  public set filterShippingMethod(value: any) {
    this._filterShippingMethod = value;
    const toStore = value ? JSON.stringify(value) : '';
    localStorage.setItem('flowOrders_filterShippingMethod', toStore);
  }

  public get filterShippingMethod(): any {
    if (this._filterShippingMethod === null) {
      const tmp = localStorage.getItem('flowOrders_filterShippingMethod');
      if (tmp) {
        try {
          this._filterShippingMethod = JSON.parse(tmp);
          // eslint-disable-next-line no-empty
        } catch (e) {}
      }
    }
    return this._filterShippingMethod;
  }
}
