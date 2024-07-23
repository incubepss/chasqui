import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { TYPE_RRSS } from './link-rrss';

const detectRRSS = (rrss: string): TYPE_RRSS => {
  if (!rrss) {
    return 'unknown';
  }

  if (rrss.match(/instagram/i)) {
    return 'instagram';
  }

  if (rrss.match(/facebook/i)) {
    return 'facebook';
  }

  if (rrss.match(/twitter/i)) {
    return 'twitter';
  }

  if (rrss.match(/wa.me/i) || rrss.match(/whatsapp/i)) {
    return 'whatsapp';
  }

  if (rrss.match(/t.me/i) || rrss.match(/telegram/i)) {
    return 'telegram';
  }

  if (rrss.match(/youtube/i)) {
    return 'youtube';
  }

  return 'unknown';
};

@Component({
  selector: 'vsf-link-rrss',
  templateUrl: './link-rrss.component.html',
  styleUrls: ['./link-rrss.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkRrssComponent implements OnInit {
  @Input()
  value!: string;

  @Input()
  type: TYPE_RRSS = 'unknown';

  imageSrc: string;

  ngOnInit(): void {
    if (this.type === 'unknown') {
      this.type = detectRRSS(this.value);
    }
  }

  getIconByType(): string | string[] {
    let icon: string = this.type;
    let prefix = 'fab';
    switch (this.type) {
      case 'facebook':
        icon = 'facebook-f';
        break;
      case 'unknown':
        prefix = 'fas';
        icon = 'people-arrows';
    }
    return [prefix, icon];
  }
}
