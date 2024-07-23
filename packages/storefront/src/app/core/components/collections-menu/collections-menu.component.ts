import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { GetCollections } from '../../../common/generated-types';
import { GET_COLLECTIONS } from '../../../common/graphql/documents.graphql';
import { DataService } from '../../../core/providers/data/data.service';

import { arrayToTree, RootNode, TreeNode } from './array-to-tree';

@Component({
  selector: 'vsf-collections-menu',
  templateUrl: './collections-menu.component.html',
  styleUrls: ['./collections-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsMenuComponent implements OnInit, OnDestroy {
  collectionTree$: Observable<RootNode<GetCollections.Items>>;
  activeCollection: TreeNode<GetCollections.Items> | null;

  private overlayIsOpen$ = new Subject<boolean>();
  private destroy$ = new Subject();

  private timeoutToClose: NodeJS.Timeout;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private dataService: DataService,
    private viewContainerRef: ViewContainerRef,
  ) {}

  ngOnInit() {
    this.collectionTree$ = this.dataService
      .query<GetCollections.Query, GetCollections.Variables>(GET_COLLECTIONS, {
        options: {},
      })
      .pipe(map(data => arrayToTree(data.collections.items)));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMouseEnter() {
    if (this.timeoutToClose) {
      clearTimeout(this.timeoutToClose);
    }
    this.overlayIsOpen$.next(true);
  }

  close() {
    if (this.timeoutToClose) {
      clearTimeout(this.timeoutToClose);
    }
    this.timeoutToClose = setTimeout(() => {
      this.overlayIsOpen$.next(false);
    }, 200);
  }
}
