import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { gql } from 'apollo-angular';
import { DataService } from '../../core/providers/data/data.service';

const FIND_SELLOS = gql`
  query FindSellos {
    sellos {
      id
      name
      code
      facet {
        id
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class SellosService {
  constructor(private dataService: DataService) {}

  findSellos(): Observable<any[]> {
    return this.dataService.query(FIND_SELLOS).pipe(map(data => data.sellos));
  }
}
