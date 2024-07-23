import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { map, take } from 'rxjs/operators';

import { GetActiveChannel } from '../../common/generated-types';
import { DataService } from '../../core/providers/data/data.service';

import { GET_ACTIVE_CHANNEL } from './get-active-channel.graphql';

/**
 * Cache the resolved promise so that the activeChannel only needs
 * to be fetched once on the first invocation of the pipe.
 */
let channelDataPromise: Promise<any>;

/**
 * A pipe which formats a price (always given as an integer by Venure) according
 * to the currencyCode of the current Channel.
 */
@Pipe({
  name: 'formatPrice',
  pure: false,
})
export class FormatPricePipe implements PipeTransform {
  private latestValue: any = null;
  private latestReturnedValue: any = null;

  constructor(private changeDetector: ChangeDetectorRef, private dataService: DataService) {}

  transform(value: number) {
    if (this.latestValue !== value) {
      this.latestValue = value;
      this.formatCurrency(value);
    }
    return this.latestReturnedValue;
  }

  private formatCurrency(value: number) {
    this.getActiveChannel().then(channel => {
      const fixedLanguageCode = channel.defaultLanguageCode === 'es' ? 'es-AR' : channel.defaultLanguageCode;
      const formatter = Intl.NumberFormat(fixedLanguageCode, {
        style: 'currency',
        currency: channel.currencyCode,
      });
      const formattedNumber = formatter.format(value / 100);
      if (formattedNumber.slice(-3) === ',00') {
        this.latestReturnedValue = formattedNumber.slice(0, -3);
      } else {
        this.latestReturnedValue = formattedNumber;
      }
      this.changeDetector.markForCheck();
    });
  }

  private getActiveChannel(): Promise<GetActiveChannel.ActiveChannel> {
    if (!channelDataPromise) {
      channelDataPromise = this.dataService
        .query<GetActiveChannel.Query>(GET_ACTIVE_CHANNEL)
        .pipe(
          take(1),
          map(data => data.activeChannel),
        )
        .toPromise();
    }
    return channelDataPromise;
  }
}
