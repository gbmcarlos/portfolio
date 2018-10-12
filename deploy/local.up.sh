#!/usr/bin/env bash

set -ex

cd "$(dirname "$0")"

export HOST_PORT=${HOST_PORT:=83}
export PROJECT_NAME=${PROJECT_NAME:=$(basename $(dirname $PWD))}
export BASIC_AUTH_ENABLED=${BASIC_AUTH_ENABLED:=false}
export BASIC_AUTH_USERNAME=${BASIC_AUTH_USERNAME:=admin}
export BASIC_AUTH_PASSWORD=${BASIC_AUTH_PASSWORD:=${PROJECT_NAME}_password}

docker build \
    -t ${PROJECT_NAME}:latest \
    ./..

docker rm -f ${PROJECT_NAME} || true

docker run \
    --name ${PROJECT_NAME} \
    -d \
    -p ${HOST_PORT}:80 \
    -e PROJECT_NAME \
    -e BASIC_AUTH_ENABLED \
    -e BASIC_AUTH_USERNAME \
    -e BASIC_AUTH_PASSWORD \
    -v $PWD/../src:/var/www/src \
    ${PROJECT_NAME}:latest \
    /bin/sh -c "/var/www/configure.sh && jekyll build --source /var/www/src --destination /var/www/src/public && /usr/sbin/nginx -g \"daemon off;\""

docker logs -f ${PROJECT_NAME}
