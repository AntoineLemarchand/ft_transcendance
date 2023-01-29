#!/bin/sh

cd /app
npm install --silent
npm run build

$@
