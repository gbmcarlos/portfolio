SHELL := /bin/bash
.DEFAULT_GOAL := logs
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
    -p ${HOST_PORT}:80 \
    -e PORT \
    -e APP_NAME \
    -e APP_DEBUG \
    -v ${PROJECT_PATH}src:/var/task/src \
    ${APP_NAME}:latest \
    /bin/sh -c "jekyll build --trace --config /var/task/src/config.yml; /opt/bin/entrypoint.sh"

watch: run
	docker exec portfolio /bin/sh -c "jekyll build --trace --config /var/task/src/config.yml --watch"

build:
	docker build -t ${APP_NAME} .