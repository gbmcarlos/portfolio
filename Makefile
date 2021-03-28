SHELL := /bin/bash
.DEFAULT_GOAL := watch
.PHONY: watch logs run build

MAKEFILE_PATH := $(abspath $(lastword ${MAKEFILE_LIST}))
PROJECT_PATH := $(dir ${MAKEFILE_PATH})
PROJECT_NAME := $(notdir $(patsubst %/,%,$(dir ${PROJECT_PATH})))

export DOCKER_BUILDKIT ?= 1
export HOST_PORT ?= 83
export PORT ?= 80
export APP_NAME ?= ${PROJECT_NAME}
export APP_RELEASE ?= latest
export APP_DEBUG ?= true
export BASIC_AUTH_ENABLED ?= false
export BASIC_AUTH_USERNAME ?= admin
export BASIC_AUTH_PASSWORD ?= ${APP_NAME}_password

logs: run
	docker logs -f ${APP_NAME}

run: build

	docker rm -f ${APP_NAME} || true

	docker run \
    --name ${APP_NAME} \
    -d \
    -p ${HOST_PORT}:${PORT} \
    -e PORT \
    -e APP_NAME \
    -e APP_DEBUG \
    -e BASIC_AUTH_ENABLED \
    -e BASIC_AUTH_USERNAME \
    -e BASIC_AUTH_PASSWORD \
    -v ${PROJECT_PATH}src:/var/task/src \
    -v ${PROJECT_PATH}vendor:/opt/vendor \
    ${APP_NAME}:latest

watch: build
	docker rm -f ${APP_NAME} || true

	docker run \
    --name ${APP_NAME} \
    -d \
    -p ${HOST_PORT}:${PORT} \
    -e PORT \
    -e APP_NAME \
    -e APP_DEBUG \
    -e BASIC_AUTH_ENABLED \
    -e BASIC_AUTH_USERNAME \
    -e BASIC_AUTH_PASSWORD \
    -v ${PROJECT_PATH}src:/var/task/src \
    -v ${PROJECT_PATH}vendor:/opt/vendor \
    ${APP_NAME}:latest \
    /bin/sh -c "./configure.sh && jekyll build --source src --destination src/public && /usr/sbin/nginx -g \"daemon off;\""

	docker exec portfolio /bin/sh -c "jekyll build --source src --destination src/public --watch"

build:
	docker build -t ${APP_NAME} .