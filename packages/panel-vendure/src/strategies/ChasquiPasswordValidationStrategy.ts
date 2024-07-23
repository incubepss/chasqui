import { PasswordValidationStrategy, RequestContext } from '@vendure/core';

export class ChasquiPasswordValidationStrategy implements PasswordValidationStrategy {
  protected regexp = /^(?=.*\d)(?=.*[a-z]).{6,}$/;

  messageFriendly = 'La contraseña debe tener al menos 6 caracteres, letras y números';

  validate(ctx: RequestContext, password: string): boolean | string {
    if (!this.regexp.test(password)) {
      return this.messageFriendly;
    }
    return true;
  }
}
