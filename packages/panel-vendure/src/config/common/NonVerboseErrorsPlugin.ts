import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { GraphQLError } from 'graphql';

export class NonVerboseErrorsPlugin implements ApolloServerPlugin {
  requestDidStart(): GraphQLRequestListener {
    return {
      willSendResponse: requestContext => {
        const { errors } = requestContext;

        if (errors) {
          (requestContext.response as any).errors = errors.map(err => {
            return new GraphQLError('uy! ' + err.message);
          });
        }
      },
    };
  }
}
