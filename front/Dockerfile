FROM node:14.17.1-alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY front/package.json ./
COPY front/package-lock.json ./
RUN npm install && npm install -g serve

COPY front/ /app
# RUN 'echo salut > .env'

ENTRYPOINT  ["sh", "entrypoint.sh"]

# CMD ["env | grep REACT_APP > .env"]
# # PROD BUILD
# RUN npm run build
# CMD ["serve", "-s", "build"]

