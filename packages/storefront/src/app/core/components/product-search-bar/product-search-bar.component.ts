import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { StateService } from '../../providers/state/state.service';
import { ChannelSelectionService } from './../../../shared/services/channel-selection.service';

@Component({
  selector: 'vsf-product-search-bar',
  templateUrl: './product-search-bar.component.html',
  styleUrls: ['./product-search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSearchBarComponent implements OnInit, OnDestroy {
  /** If true, searches as you type */
  @Input() autoSearch = false;

  searchTerm = new FormControl('');
  private subscription: Subscription;

  channelName$: Observable<string>;

  constructor(
    private router: Router,
    private stateService: StateService,
    private channelSelectionService: ChannelSelectionService,
  ) {}

  ngOnInit() {
    if (this.autoSearch) {
      this.subscription = this.searchTerm.valueChanges
        .pipe(debounceTime(250))
        .subscribe(term => this.doSearch(term));
    }

    this.channelName$ = this.stateService.select(state => state.activeChannelName);
  }

  doSearch(term: string) {
    this.router.navigate(['/', this.channelSelectionService.getSelectedChannelToken(), 'catalogo'], {
      queryParams: { search: term },
      queryParamsHandling: 'merge',
    });
    this.searchTerm.setValue('', { emitEvent: false });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
