import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  HostListener,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import queryParamUtils, { GroupParam } from '../../../common/utils/queryParamGrouped';

import { SearchProducts } from '../../../common/generated-types';
import { getRouteArrayParam } from '../../../common/utils/get-route-array-param';

type FacetValue = SearchProducts.FacetValue;

export interface FacetWithValues {
  id: string;
  name: string;
  code: string;
  values: Array<{
    id: string;
    name: string;
    code: string;
    count: number;
  }>;
}

@Component({
  selector: 'vsf-product-list-controls',
  templateUrl: './product-list-controls.component.html',
  styleUrls: ['./product-list-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListControlsComponent implements OnChanges {
  @Input() sortOptions: Array<{ value: string; label: string }> = [];
  @Input() activeFacetValueIds: string[] = [];
  @Input() activeFacetValueGrouped: GroupParam = queryParamUtils.newGroupParam();
  @Input() facetValues: SearchProducts.FacetValues[] | null;
  @Input() totalResults = 0;
  facets: FacetWithValues[];
  manuallyExpanded = false;
  public isMenuCollapsed = true;

  fragments: any = {};

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('facetValues' in changes) {
      this.facets = this.groupFacetValues(this.facetValues);
    }
  }

  isActive(facet: any, facetValue: FacetValue): boolean {
    return queryParamUtils.isActive(this.activeFacetValueGrouped, facet.id, facetValue.id);
  }

  toggleFacetValueInRoute(facet: any, facetValue: FacetValue) {
    this.activeFacetValueGrouped = queryParamUtils.toggleValue(
      this.activeFacetValueGrouped,
      facet.id,
      facetValue.id,
    );

    this._refresh({ etiqueta: queryParamUtils.serialize(this.activeFacetValueGrouped) });
  }

  sortBy(sortParam: string) {
    this._refresh({ orden: sortParam });
  }

  _refresh(newFramgent: any) {
    newFramgent = { ...this.route.snapshot.params, ...newFramgent };
    delete newFramgent.channelcode;
    this.router.navigate(['./', newFramgent], {
      queryParamsHandling: 'merge',
      relativeTo: this.route,
      state: {
        noScroll: true,
      },
    });
  }

  trackById(index: number, item: { id: string }) {
    return item.id;
  }

  private groupFacetValues(facetValues: SearchProducts.FacetValues[] | null): FacetWithValues[] {
    if (!facetValues) {
      return [];
    }
    const facetMap = new Map<string, FacetWithValues>();
    for (const { count, facetValue } of facetValues) {
      const { id, name, code, facet } = facetValue;
      // @ts-ignore
      if (count === this.totalResults && !this.isActive(facet, facetValue)) {
        // skip FacetValues that do not have any effect on the
        // result set and are not active
        continue;
      }
      const facetFromMap = facetMap.get(facet.id);
      if (facetFromMap) {
        facetFromMap.values.push({ id, name, code, count });
      } else {
        facetMap.set(facet.id, {
          id: facet.id,
          name: facet.name,
          code: facet.code,
          values: [{ id, name, code, count }],
        });
      }
    }
    return Array.from(facetMap.values());
  }
}
