import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Channel } from '../../../common/generated-types';

@Component({
  selector: 'vsf-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements OnInit {
  channel: Channel;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.channel = this.route.snapshot.data.channel;
  }

  getImages(): string[] {
    return (this.channel.customFields?.bannersAboutUs || []).map((img: any) => img.preview);
  }
}
