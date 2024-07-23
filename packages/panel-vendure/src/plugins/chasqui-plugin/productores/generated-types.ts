/* eslint-disable */
export type Scalars = {
  ID: string | number;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type addProductorInput = {
  nombre: Scalars['String'];
  localidad: Scalars['String'];
  descripcionBreve: Scalars['String'];
};

export type deleteProductorInput = {
  id: Scalars['ID'];
};

export type updateProductorInput = {
  id: Scalars['ID'];
  nombre?: Scalars['String'];
  localidad?: Scalars['String'];
  descripcionBreve?: Scalars['String'];
};

export type assignProductorInput = {
  idProducto: Scalars['ID'];
  idProductor: Scalars['ID'];
};

export type QueryAdministratorArgs = {
  id: Scalars['ID'];
};
