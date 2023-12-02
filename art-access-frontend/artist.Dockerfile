FROM node:18-alpine3.16 as build

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/common/package.json packages/common/
COPY packages/artistApp/package.json packages/artistApp/

COPY .npmrc ./

RUN yarn install --frozen-lockfile && npm -w artist-app list @colourbox/ac-server |grep ac-server|grep -o 'ac-server@.*' |cut -f2- -d@ > /ac-server-version 

COPY . ./

RUN NEXT_PUBLIC_API_URL="" \
    NEXT_PUBLIC_SSR_API_URL="http://ac-server" \
    yarn build:artist

EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV=production

CMD ["yarn", "start:artist"]