import { RequestContext } from '@vendure/core';
import { ArrepentimientoEvent } from '../events/ArrepentimientoEvent';

export const mockArrepentimientoEvent = new ArrepentimientoEvent(RequestContext.empty(), {
  name: 'Juan Perez',
  email: 'test@test.com',
  phone: '45669966',
  description: 'me arrepentí',
});
