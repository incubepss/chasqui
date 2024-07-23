/* eslint-disable */
export type Scalars = {
  ID: string | number;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  JSON: any;
  Upload: any;
};

export class ErrorResult {
  readonly __typename: string;
  readonly errorCode: string;
  message: Scalars['String'];
}

export class ProductorUsedError extends ErrorResult {
  readonly __typename = 'ProductorUsedError';
  readonly errorCode = 'PRODUCTOR_USED_ERROR' as any;
  readonly message = 'El productor está en uso en almenos un producto';
  constructor(public refundId: Scalars['ID']) {
    super();
  }
}

export const isResultError = (obj: any): boolean => {
  return obj && 'errorCode' in obj;
};
