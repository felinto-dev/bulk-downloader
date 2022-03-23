FROM node:16-alpine as DEV
ENV NODE_ENV=development
WORKDIR /opt/node_app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN npm run build

FROM node:16-alpine as PROD
ENV NODE_ENV=production
RUN mkdir /opt/node_app && chown node:node /opt/node_app
WORKDIR /opt/node_app
USER node
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-optional --production && yarn cache clean
COPY --chown=node:node --from=DEV /opt/node_app/dist ./
CMD [ "node", "./src/main.js" ]
