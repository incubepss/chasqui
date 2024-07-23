import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { GetCollections } from '../../../common/generated-types';
import { GET_COLLECTIONS } from '../../../common/graphql/documents.graphql';
import { DataService } from '../../providers/data/data.service';
import { StateService } from '../../providers/state/state.service';
import { ChannelSelectionService } from '../../../shared/services/channel-selection.service';
import { arrayToTree, RootNode, TreeNode } from '../collections-menu/array-to-tree';

@Component({
  selector: 'vsf-collections-menu-mobile',
  templateUrl: './collections-menu-mobile.component.html',
  styleUrls: ['./collections-menu-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsMenuMobileComponent implements OnInit, OnChanges {
  @HostBinding('class.visible') get visible() {
    return this.navMenu || this.cateMenu;
  }

  @Input()
  navMenu = false;

  @Input()
  cateMenu = false;

  collectionTree$: Observable<RootNode<GetCollections.Items>>;
  selected0: string | null = null;
  selected1: string | null = null;

  sellosMenu$: Observable<any[]>;

  constructor(
    private router: Router,
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

  ngOnChanges(changes: SimpleChanges) {
    if ('navMenu' in changes || 'cateMenu' in changes) {
      if (this.visible && !window.history?.state?.sliderMenu) {
        const modalState = {
          sliderMenu: true,
          desc: 'Fake state for the slider menu',
        };
        history.pushState(modalState, 'sliderMenuOpened');
      }
    }
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

  close(cancelForwardNav = false) {
    this.stateService.setState('mobileNavMenuIsOpen', false);
    this.stateService.setState('mobileCateMenuIsOpen', false);
    if (cancelForwardNav && window.history?.state?.sliderMenu) {
      history.back();
    }
  }

  closeAndCancel() {
    this.close(true);
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
    } else {
      this.navigateItem(collection);
      this.close();
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    if (!this.visible) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.close();
  }
}
