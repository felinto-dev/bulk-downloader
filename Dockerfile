FROM node:16-alpine AS builder

ENV NODE_ENV=development

# install node-prune (https://github.com/tj/node-prune)
RUN apk add curl bash --no-cache
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnclean ./

# install ALL dependencies
RUN yarn --frozen-lockfile --ignore-optional && yarn autoclean --force

# Copy application
COPY . .

# build application
RUN yarn build

# remove development dependencies
RUN npm prune --production

# run node prune
RUN /usr/local/bin/node-prune

# Build development purposes image
FROM builder AS dev

# Start application in development mode
CMD [ "npm", "run", "start:dev" ]

## Build production-ready image
FROM node:16-alpine AS prod

ENV NODE_ENV=production

RUN apk add dumb-init --no-cache

RUN mkdir -p /usr/src/app && chown node:node /usr/src/app
WORKDIR /usr/src/app

# copy artifacts
COPY --chown=node:node . ./
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist/
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD [ "npm", "run", "start:prod" ]
