FROM node:lts-alpine
LABEL maintainer="" description="Breja Bot API"

WORKDIR /usr/src/app
COPY package*.json ./
COPY .env ./


RUN pwd ; \
    npm install  ;
RUN apk upgrade --update \
    && apk add -U tzdata \
    && cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
    && apk del tzdata \
    && rm -rf \
    /var/cache/apk/*

COPY . .
CMD ["npm", "run", "start"]
EXPOSE 3000