# poc-chasqui-vendure

This project was generated with [`@vendure/create`](https://github.com/vendure-ecommerce/vendure/tree/master/packages/create).

## Directory structure

- `/src` contains the source code of your Vendure server. All your custom code and plugins should reside here.
- `/static` contains static (non-code) files such as assets (e.g. uploaded images) and email templates.

## Development

```
yarn dev
```

will start the Vendure server and [worker](https://www.vendure.io/docs/developer-guide/vendure-worker/) processes from
the `src` directory.

## Build

```
yarn build
# or
npm run build
```

will compile the TypeScript sources into the `/dist` directory.

## Migrations

[Migrations](https://www.vendure.io/docs/developer-guide/migrations/) allow safe updates to the database schema.

The following npm scripts can be used to generate migrations:

```
yarn migration:generate [name]
# or
npm run migration:generate [name]
```

run any pending migrations that have been generated:

```
yarn migration:run
# or
npm run migration:run
```

and revert the most recently-applied migration:

```
yarn migration:revert
# or
npm run migration:revert
```


#### Crear migración manual
```
  npx typeorm migration:create -n <nombre-aca>
```