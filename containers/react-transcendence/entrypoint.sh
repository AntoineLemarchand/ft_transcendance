#!/bin/sh


env | grep REACT_APP > .env

npm run build
serve -s build

# DEV BUILD
# CMD ["npm","run","start"]

