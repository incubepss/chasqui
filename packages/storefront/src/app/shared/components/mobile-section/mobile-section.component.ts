import { Location } from '@angular/common';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'vsf-mobile-section',
  templateUrl: './mobile-section.component.html',
  styleUrls: ['./mobile-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileSectionComponent {
  @Input()
  title = '';

  @Input()
  backRouterLink = '';

  @Input()
  hideHeader = false;

  @Input()
  showHeaderDropdown = false;

  @Input()
  styleBody = '';

  constructor(private location: Location) {}

  back() {
    this.location.back();
  }
}
