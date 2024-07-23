import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';

import { DataService } from '../../core/providers/data/data.service';
import { CheckoutModule } from '../checkout.module';

import { FIND_SURCHARGES } from './surcharges-resolver.graphql';

@Injectable({ providedIn: CheckoutModule })
export class SurchargesResolver implements Resolve<any[]> {
  constructor(private dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
    const surcharges$ = this.dataService.query(FIND_SURCHARGES).pipe(map(result => result.customSurcharges));

    return surcharges$.pipe(shareReplay(1), take(1));
  }
}
