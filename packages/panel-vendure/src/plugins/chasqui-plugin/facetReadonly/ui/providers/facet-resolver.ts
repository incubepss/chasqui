import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BaseEntityResolver,
  FacetWithValues,
  getDefaultUiLanguage,
  DataService,
} from '@vendure/admin-ui/core';

@Injectable({
  providedIn: 'root',
})
export class FacetResolver extends BaseEntityResolver<FacetWithValues.Fragment> {
  constructor(router: Router, dataService: DataService) {
    super(
      router,
      {
        __typename: 'Facet' as const,
        id: '',
        createdAt: '',
        updatedAt: '',
        isPrivate: false,
        languageCode: getDefaultUiLanguage(),
        name: '',
        code: '',
        translations: [],
        values: [],
      },
      id => dataService.facet.getFacet(id).mapStream(data => data.facet),
    );
  }
}
