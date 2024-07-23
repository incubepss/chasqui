import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';

/**
 * @description
 * Convierte una fecha en un formato del estilo "Hace 3 minutos", "Hace 5 horas" etc.
 *
 * @example
 * ```HTML
 * {{ order.orderPlacedAt | timeAgo }}
 * ```
 *
 * @docsCategory pipes
 */
@Pipe({
  name: 'timeAgo',
  pure: false,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date, nowVal?: string | Date): string {
    const then = dayjs(value);
    const now = dayjs(nowVal || new Date());
    const secondsDiff = now.diff(then, 'second');
    const durations: Array<[number, string]> = [
      [60, 'segundo'],
      [3600, 'minuto'],
      [86400, 'hora'],
      [31536000, 'día'],
      //[Number.MAX_SAFE_INTEGER, 'año'],
    ];

    let lastUpperBound = 1;
    for (const [upperBound, unitToken] of durations) {
      if (secondsDiff < upperBound) {
        const count = Math.max(0, Math.floor(secondsDiff / lastUpperBound));
        let unit = unitToken;
        if (count !== 1) {
          unit += 's';
        }
        return `Hace ${count} ${unit}`;
      }
      lastUpperBound = upperBound;
    }
    return then.format();
  }
}
