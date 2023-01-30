FROM node:alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

ADD containers/nest-transcendence/package.json /app/package.json
RUN npm install
RUN npm upgrade

COPY containers/nest-transcendence/ /app/

# PROD BUILD
CMD [ "npm", "run", "start:dev" ]

# DEV BUILD
# CMD [ "npm", "run", start"]
