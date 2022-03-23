FROM node:16-alpine AS builder

ENV NODE_ENV=development

# install node-prune (https://github.com/tj/node-prune)
RUN apk add curl bash --no-cache
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnclean ./

# install dependencies
RUN yarn --frozen-lockfile --ignore-optional && yarn autoclean --force

# Copy application
COPY . .

# build application
RUN yarn build

# remove development dependencies
RUN npm prune --production

# run node prune
RUN /usr/local/bin/node-prune

## Start a new stage
FROM node:16-alpine

ENV NODE_ENV=production

RUN apk add dumb-init --no-cache

RUN mkdir -p /usr/src/app && chown node:node /usr/src/app
WORKDIR /usr/src/app

# copy from build image
COPY --chown=node:node --from=builder /usr/src/app/dist ./
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 3000

CMD [ "dumb-init", "node", "./src/main.js" ]
