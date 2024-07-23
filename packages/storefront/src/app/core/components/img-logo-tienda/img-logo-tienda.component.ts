import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Channel } from '../../../common/generated-types';
import { StateService } from '../../providers/state/state.service';

@Component({
  selector: 'vsf-img-logo-tienda',
  templateUrl: './img-logo-tienda.component.html',
  styleUrls: ['./img-logo-tienda.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImgLogoTiendaComponent implements OnInit {
  channel$: Observable<Channel | null>;
  channelName$: Observable<string>;
  imgLogo$: Observable<any>;

  constructor(private stateService: StateService) {}

  ngOnInit(): void {
    this.channel$ = this.stateService.select(state => state.activeChannel);

    this.channelName$ = this.channel$.pipe(map(channel => channel?.customFields?.nombre || ''));

    this.imgLogo$ = this.channel$.pipe(map(channel => channel?.customFields?.imgLogo || ''));
  }
}
