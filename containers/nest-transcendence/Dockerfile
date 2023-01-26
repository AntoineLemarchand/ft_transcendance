FROM node:alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

ADD package.json /app/package.json
RUN npm install

COPY . /app

CMD ["npm", "start"]
