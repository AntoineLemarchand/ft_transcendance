FROM node:alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

ADD containers/nest-transcendence/package.json /app/package.json
RUN npm install
RUN npm upgrade

COPY containers/nest-transcendence/ /app/
COPY .env /app/local.env

CMD ["npm", "start"]
