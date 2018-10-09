#!/usr/bin/env bash

set -ex

cd "$(dirname "$0")"

export HOST_PORT=${HOST_PORT:=83}
export PROJECT_NAME=${PROJECT_NAME:=$(basename $(dirname $PWD))}

docker build \
    -t ${PROJECT_NAME}:latest \
    ./..

docker rm -f ${PROJECT_NAME} || true

docker run \
    --name ${PROJECT_NAME} \
    -d \
    -p ${HOST_PORT}:80 \
    -e PROJECT_NAME \
    -v $PWD/../src:/var/www/src \
    ${PROJECT_NAME}:latest \
    /bin/sh -c "jekyll build --source /var/www/src --destination /var/www/src/public && /usr/sbin/nginx -g \"daemon off;\""

docker logs -f ${PROJECT_NAME}
