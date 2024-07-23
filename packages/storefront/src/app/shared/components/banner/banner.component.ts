import { Component, ChangeDetectionStrategy, AfterViewInit, Input } from '@angular/core';
import Swiper, { Autoplay } from 'swiper';
import { environment } from '../../../../../src/environments/environment';

@Component({
  selector: 'vsf-landing-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerComponent implements AfterViewInit {
  mySwiper: Swiper;
  environment: any = environment;

  @Input() images: string[] = [];

  ngAfterViewInit() {
    Swiper.use([Autoplay]);
    this.mySwiper = new Swiper('.swiper', {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      autoplay: { delay: 3000 },
    });
  }
}
