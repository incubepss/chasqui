# Stage 1 · BUILD
FROM node:14-alpine as base
COPY ["package.json", "yarn.lock", "tsconfig.json","tsconfig.prod.json", "/app/"]
WORKDIR /app/


#
# ---- Dependencies ----
FROM base AS dependencies
# install node packages
# RUN yarn set progress=false && yarn config set depth 0
WORKDIR /tmp
COPY --from=base /app ./
RUN yarn install --production 
# copy production node_modules aside
RUN cp -R node_modules ../prod_node_modules
# install ALL node_modules, including 'devDependencies'
RUN yarn install


#
# ---- Build ----
FROM dependencies AS build
ENV NODE_ENV production
COPY ./src ./src
RUN yarn build

#
# ----- SERVE ----
FROM base as serve
ENV NODE_ENV production

RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

COPY --from=build /tmp/dist /app/dist
COPY --from=build /tmp/admin-ui /app/admin-ui
COPY ./src/emails/templates /app/static/email/templates
COPY ["package.json", "yarn.lock", "tsconfig.json", "/app/"]

COPY --from=dependencies /prod_node_modules ./node_modules

EXPOSE 3000
CMD [ "./dist/run-prod.sh"]
