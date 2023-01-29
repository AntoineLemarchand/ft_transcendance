FROM node:alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY containers/react-transcendence/package.json ./
COPY containers/react-transcendence/package-lock.json ./
RUN npm install && npm install -g serve

COPY containers/react-transcendence/ /app
COPY .env /app

RUN npm run build
CMD ["serve", "-s", "build"]

