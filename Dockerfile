FROM node:slim

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV
ARG PORT=3000
ENV PORT $PORT

RUN mkdir /opt/node_app && chown node:node /opt/node_app
WORKDIR /opt/node_app

USER node
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-optional && yarn cache clean

ENV PATH /opt/node_app/node_modules/.bin:$PATH
WORKDIR /opt/node_app/app
COPY --chown=node:node . .

CMD [ "node", "./dist/src/main.js" ]
