FROM node:alpine

WORKDIR /app
VOLUME /app

ENV PATH /app/node_modules/.bin:$PATH

RUN apk add curl 

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD /entrypoint.sh
