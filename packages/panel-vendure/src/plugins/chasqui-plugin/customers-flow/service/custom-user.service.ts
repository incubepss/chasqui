import { Injectable } from '@nestjs/common';
import { RequestContext, TransactionalConnection, User } from '@vendure/core';

@Injectable()
export class CustomUserService {
  constructor(private connection: TransactionalConnection) {}

  async makeSureUserIsVerified(ctx: RequestContext, user: User): Promise<User> {
    if (!user || user.verified) {
      return user;
    }
    user.verified = true;
    return this.connection.getRepository(ctx, User).save(user);
  }
}
