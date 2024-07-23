# Stage 1 · BUILD
FROM node:14-alpine3.14 as build
RUN apk add dumb-init
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package* yarn.lock ./

RUN yarn install

COPY --chown=node:node . . 

RUN yarn run build:ssr:docker

# Stage 2 · SERVE
FROM node:14-alpine3.14
ENV NODE_ENV production

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --from=build /home/node/app/dist /home/node/app/dist

RUN apk add dumb-init
EXPOSE 4000
USER node
CMD ["dumb-init" ,"node", "./dist/server/main.js" ]
