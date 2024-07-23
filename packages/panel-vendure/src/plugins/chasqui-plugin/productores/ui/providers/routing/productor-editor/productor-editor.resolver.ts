import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, BaseEntityResolver } from '@vendure/admin-ui/core';

import { GET_PRODUCTOR } from './productor-editor.graphql';

// import { PackageFragment } from '../../../common/fragment.graphql.types';

// import {
//   GetPackageQuery,
//   GetPackageQueryVariables
// } from './package-detail.graphql.types';

@Injectable()
export default class ProductorEditorResolver extends BaseEntityResolver<any /*PackageFragment*/> {
  constructor(router: Router, dataService: DataService) {
    super(
      router,
      {
        __typename: 'Productor',
        id: '',
        nombre: '',
        localidad: '',
        descripcionBreve: '',
        sellos: [],
      },
      id => {
        return dataService
          .query<
            any, // GetPackageQuery,
            any // GetPackageQueryVariables
          >(GET_PRODUCTOR, {
            id: id,
          })
          .mapStream(data => data.productor);
      },
    );
  }
}
