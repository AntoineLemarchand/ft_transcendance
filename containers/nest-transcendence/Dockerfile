FROM node:alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

ADD containers/nest-transcendence/package.json /app/package.json
RUN npm install
RUN npm upgrade

COPY containers/nest-transcendence/ /app/

# PROD BUILD
#CMD [ "npm", "run", "start:dev" ]
#ENTRYPOINT "sleep -1"

# DEV BUILD
# CMD [ "npm", "run", start"]

#RUN "/bin/bash npm run typeorm:run-migrations"
RUN npm run typeorm:run-migrations

CMD [ "npm", "run", "start:dev"]
