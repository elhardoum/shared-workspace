FROM node:12.0.0-alpine AS base

COPY web/package.json .

RUN npm prune && npm install

CMD [ "npm", "start" ]