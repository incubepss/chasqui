import { RequestContext } from '@vendure/core';
import { ChasquiPasswordValidationStrategy } from './ChasquiPasswordValidationStrategy';

describe('ChasquiPasswordValidationStrategy', () => {
  test('contraseñas validas', () => {
    const validator = new ChasquiPasswordValidationStrategy();
    const ctx: RequestContext = RequestContext.empty();

    expect(validator.validate(ctx, 'abc123')).toBe(true);
    expect(validator.validate(ctx, 'prueba232')).toBe(true);
    expect(validator.validate(ctx, 'Prueba1234')).toBe(true);
    expect(validator.validate(ctx, 'Prueñ%b/2a1234')).toBe(true);
  });

  test('contraseñas no validas', () => {
    const validator = new ChasquiPasswordValidationStrategy();
    const ctx: RequestContext = RequestContext.empty();

    expect(validator.validate(ctx, '')).toBe(validator.messageFriendly);
    expect(validator.validate(ctx, '3')).toBe(validator.messageFriendly);
    expect(validator.validate(ctx, 'c')).toBe(validator.messageFriendly);
    expect(validator.validate(ctx, 'c3p')).toBe(validator.messageFriendly);
    expect(validator.validate(ctx, 'corto')).toBe(validator.messageFriendly);
    expect(validator.validate(ctx, 'solotextolargo')).toBe(validator.messageFriendly);
    expect(validator.validate(ctx, '4323243242342')).toBe(validator.messageFriendly);
  });
});
