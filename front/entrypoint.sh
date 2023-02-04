#!/bin/sh


env | grep REACT_APP > .env

npm run build
serve -s build >/dev/null 2>&1

# DEV BUILD
# CMD ["npm","run","start"]

