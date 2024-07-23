/* eslint-disable @typescript-eslint/naming-convention */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paymentInstruction',
})
export class PaymentInstructionPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return value;
    }

    return value.replace(/\n/gi, '<br />');
  }
}
