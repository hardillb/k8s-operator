FROM node:20-alpine

WORKDIR /usr/src/app
COPY package*.json .
RUN npm install --omit=dev
COPY webhook.js .
RUN mkdir ca
COPY ca/key.pem ca/key.pem
COPY ca/ingress.pem ca/ingress.pem

CMD [ "node", "webhook.js" ]