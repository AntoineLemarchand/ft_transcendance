FROM node:alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

ADD containers/nest-transcendance/package.json /app/package.json
RUN npm install

COPY containers/nest-transcendance/ /app/
COPY .env /app/local.env

CMD ["npm", "start"]
