import { Observable } from 'rxjs';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ChannelSelectionService } from './../../../../shared/services/channel-selection.service';

@Component({
  selector: 'vsf-layout-top-nav',
  templateUrl: './layout-top-nav.component.html',
  styleUrls: ['./layout-top-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutTopNavComponent {
  channelToken$: Observable<string>;

  constructor(
    private channelSelectionService: ChannelSelectionService,
    public route: ActivatedRoute,
    private router: Router,
  ) {
    this.channelToken$ = this.channelSelectionService.channelToken$;
  }

  navigateTo(part: string[]) {
    this.router.navigate(part, { relativeTo: this.route.parent });
  }
}
