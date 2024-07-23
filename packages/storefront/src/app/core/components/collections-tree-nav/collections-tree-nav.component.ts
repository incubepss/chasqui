import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { GetCollections } from '../../../common/generated-types';
import { GET_COLLECTIONS } from '../../../common/graphql/documents.graphql';
import { DataService } from '../../providers/data/data.service';
import { StateService } from '../../providers/state/state.service';
import { ChannelSelectionService } from '../../../shared/services/channel-selection.service';
import { arrayToTree, RootNode, TreeNode } from '../collections-menu/array-to-tree';

@Component({
  selector: 'vsf-collections-tree-nav',
  templateUrl: './collections-tree-nav.component.html',
  styleUrls: ['./collections-tree-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsTreeNavComponent implements OnInit {
  @HostBinding('class.visible')
  @Input()
  visible = true;

  @Input()
  selectedSlug = '';

  collectionTree$: Observable<RootNode<GetCollections.Items>>;
  selected0: string | null = null;
  selected1: string | null = null;

  sellosMenu$: Observable<any[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private stateService: StateService,
    private dataService: DataService,
    private channelSelectionService: ChannelSelectionService,
  ) {}

  ngOnInit() {
    this.collectionTree$ = this.dataService
      .query<GetCollections.Query, GetCollections.Variables>(GET_COLLECTIONS, {
        options: {},
      })
      .pipe(map(data => arrayToTree(data.collections.items)));

    this.sellosMenu$ = this.stateService.select(state => state.sellosMenu);
  }

  onL0Click(event: TouchEvent, collection: TreeNode<GetCollections.Items>) {
    event.preventDefault();
    event.stopPropagation();
    this.expandOrNavigate(0, event, collection);
  }

  onL1Click(event: TouchEvent, collection: TreeNode<GetCollections.Items>) {
    event.preventDefault();
    event.stopPropagation();
    this.expandOrNavigate(1, event, collection);
  }

  close() {
    this.stateService.setState('mobileCateMenuIsOpen', false);
  }

  get contextChannelPath() {
    return ['/', this.channelSelectionService.getSelectedChannelToken()];
  }

  makeLink(parts: string[]): string[] {
    return this.contextChannelPath.concat(parts);
  }

  navigateItem(item: TreeNode<GetCollections.Items>) {
    this.router.navigate(this.contextChannelPath.concat(['categoria', item.slug]), {
      replaceUrl: true,
    });
  }

  navigateLink(parts: string[]) {
    this.router.navigate(this.contextChannelPath.concat(parts), {
      replaceUrl: true,
    });
    this.close();
  }

  private expandOrNavigate(level: 0 | 1, event: TouchEvent, collection: TreeNode<GetCollections.Items>) {
    if (collection.children.length && this.selected1 !== collection.id) {
      if (level === 0) {
        this.selected0 = collection.id;
        this.selected1 = null;
      } else {
        this.selected1 = collection.id;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    this.navigateItem(collection);
    this.close();
  }
}
