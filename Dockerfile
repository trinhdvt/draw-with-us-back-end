FROM node:16.15-alpine as builder
MAINTAINER "trinhdvt"

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn

COPY . .
RUN yarn build


FROM node:16.15-alpine as runtime
MAINTAINER "trinhdvt"

WORKDIR /app
ENV NODE_ENV="production"

COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/.env .

RUN yarn install --production  \
    && yarn global add pm2 \
    && yarn cache clean

COPY --from=builder /app/target target

CMD ["pm2-runtime", "./target/server.js"]
