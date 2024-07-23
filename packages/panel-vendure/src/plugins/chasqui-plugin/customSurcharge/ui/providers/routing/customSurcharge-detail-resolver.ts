import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, BaseEntityResolver } from '@vendure/admin-ui/core';

import { CustomSurcharge } from '../../generated-types';

import { GET_CUSTOMSURCHARGE } from './customSurcharge-detail-resolver.graphql';

@Injectable()
export class ExampleDetailResolver extends BaseEntityResolver<CustomSurcharge> {
  constructor(router: Router, dataService: DataService) {
    super(
      router,
      {
        id: '',
        name: '',
        question: '',
        enabled: true,
        options: [],
      },
      id => dataService.query(GET_CUSTOMSURCHARGE, { id }).mapStream((data: any) => data.customSurcharge),
    );
  }
}
