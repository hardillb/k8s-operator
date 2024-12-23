FROM node:20-alpine

WORKDIR /usr/src/app
COPY package*.json .
RUN npm install --omit=dev
COPY webhook.js .
RUN mkdir ca
COPY ca/key.pem ca/key.pem
COPY ca/node-red.pem ca/node-red.pem

CMD [ "node", "webhook.js" ]