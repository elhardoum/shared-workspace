FROM node:12.0.0-alpine AS base

WORKDIR /app

COPY web .

RUN npm prune
RUN npm install

CMD [ "sh", "-c", "test -d node_modules || npm install; npm run start" ]