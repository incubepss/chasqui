import { Observable } from 'rxjs';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { GetCollection } from '../../../common/generated-types';
import { StateService } from './../../providers/state/state.service';

@Component({
  selector: 'vsf-collection-breadcrumbs',
  templateUrl: './collection-breadcrumbs.component.html',
  styleUrls: ['./collection-breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionBreadcrumbsComponent implements OnInit {
  @Input() breadcrumbs: GetCollection.Breadcrumbs[] = [];
  @Input() linkLast = false;

  channelName$: Observable<string>;

  constructor(private stateService: StateService) {}

  ngOnInit(): void {
    this.channelName$ = this.stateService.select(s => s.activeChannelName);
  }

  tail<T>(arr: T[] | null): T[] {
    return arr ? arr.slice(1) : [];
  }
}
