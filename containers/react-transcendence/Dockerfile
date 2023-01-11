FROM node:alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./
RUN npm install && npm install -g serve

COPY . ./

RUN npm run build

CMD ["serve", "-s", "build"]
