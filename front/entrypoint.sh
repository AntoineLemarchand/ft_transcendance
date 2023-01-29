#!/bin/sh

cd /app
npm install 
npm install -g serve
env | grep REACT_APP > .env

npm run build
# serve -s build
$@
