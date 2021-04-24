FROM node:12.0.0-alpine

COPY web/package.json .

RUN npm prune && npm install

CMD [ "npm", "start" ]