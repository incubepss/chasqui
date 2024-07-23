# Chasqui v2 - tecnología Vendure

Monorepo - Repositorio unificado

[¿Qué es Vendure?](https://www.vendure.io/blog/2019/02/introducing-vendure)

[Vendure docs getting-started](https://www.vendure.io/docs/getting-started/)

#### Links Interes

[https://reactive.how/](https://reactive.how/)

# Paquetes

```
packages
  panel-vendure
  storefront
```

## Panel-vendure

El proyecto administrador de vendure con apis de graphql

## Storefront

El frontend para comprar

(El repositorio original https://github.com/Proyecto-Chasqui/storefront.git)

# Correr para desarrollo

## Paso 0

Copiar y configurar .env.example

## Correr DB

```
docker-compose up -d chasqui-db
```

## Correr Panel-vendure

1. Configurar .env de packages/panel-vendure \
   (Seguir packages/panel-vendure/.env.example)

2. Correr

```
cd packages/panel-vendure
yarn install
yarn dev
```

http://localhost:3000/panel

_Alternativas:_

-   `yarn dev:server` Para correr sin workers
-   `yarn dev-plugins` Para correr con livereloading para plugins

## Correr Storefront

```
cd packages/storefront
yarn install
yarn dev
```

http://localhost:4000

# Correr para QA

1. Crear .env (seguir .env.example)

2. Elija una rama

3. Levantar

```
 docker-compose up -d
```

4. Entrar a \
   [http://localhost](http://localhost) (storefront) \
   [http://lochalost/admin](http://lochalost/admin) (panel administrador)

# Buildear imagenes

## Panel-vendure

**Opción A**

```
  cd packages/panel-vendure
  make build-image
```

## Storefront

**Opción A**

```
  cd packages/storefront
  make build-image
```

**Opción B**

```
  docker build ./packages/storefront -f ./packages/storefront/Dockerfile.nginx -t  chasqui2-front-nginx
```

# Para deployar en cloud

Se recomienda usar docker-compose separado para el proxy-reverso (traefik) y otro para los servicios

### En local

Buildear las imagenes y pushear a docker.pkg.github.com \

1. Configurar version en archivo Makefile
2. Buildear imagenes `make build-images`
3. Tagear imagenes `make tag-for-github`
4. Pushear `make push-images`

Para poder pushear debes tener un token:

Crear token en https://github.com/settings/tokens con los siguientes permisos: read/write packages

En la consola: `docker login docker.pkg.github.com/ -u username -p ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

Reemplazar `username` y `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` por lo que corresponda.

### En el cloud

1. Crear network docker
   `docker network create traefik-public`

2. Levantar el proxy reverso
   `docker-compose -f ./docker-compose.proxy.yml up -d`

3. Configurar .env

4. Configurar versiones de imagenes en docker-compose.yml

5. Bajar imagenes

```
docker-compose -f ./docker-compose.prod.yml pull
```

5. Levantar servicios

```
docker-compose -f ./docker-compose.prod.yml up -d
```

## Migraciones

De forma automática se corre una migración para activar la extensión `unaccent` en postgresql que ya viene en el core y permite que funcionen los caracteres latinos pra la búsqueda.

Documentación oficial de vendure: [https://www.vendure.io/docs/developer-guide/migrations/](https://www.vendure.io/docs/developer-guide/migrations/)

> Leer la documentación sobre el uso de la variable de `synchronize`
> packages/panel-vendure/src/config/common/dbConnectionConfig.ts

```
migration:generate
```

En la carpeta `src/migration_db/old` están las migraciones que se corrieron en producción.

Comando para crear migraciones manuales:

```
npx typeorm migration:create ./path-to-migrations-dir/PostRefactoring
```

## Backups

### Correr backups de la DB

0. Elegir carpeta para almacenar backups, por ejemplo "/backups"
1. `mkdir -p /backups && chown -R 999:999 /backups` - Crear carpeta de backups y setear permisos
2. Setear/usar carpeta del punto 0 como volumen en docker-compose.yml de backup-db-chasqui
3. `docker-compose up -d backup-db-chasqui` - Levantar scheduler

Nota: `docker exec $(docker ps | grep postgres-backup | awk '{print $1}') ./backup.sh` - Para correr a mano un backup

### Restaurar backup de DB

Utilizar el script de bash de devops/restor-db.sh

### Backup de imagenes de productos

1. `cd  devops`
2. `./backups-assets.sh`

### Convenciones de commit

[https://www.conventionalcommits.org/es/v1.0.0/#especificaci%c3%b3n](https://www.conventionalcommits.org/es/v1.0.0/#especificaci%c3%b3n)

> tipos distintos a fix: y feat: están permitidos, por ejemplo @commitlint/config-conventional (basados en la convención de Angular) que recomienda build:, chore:, ci:, docs:, style:, refactor:, perf:, test:, y otros.

### Github login

> docker login -u USERNAME -p TOKEN docker.pkg.github.com
