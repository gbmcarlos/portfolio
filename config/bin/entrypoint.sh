#!/usr/bin/env bash

export PROJECT_NAME=${PROJECT_NAME=localhost}
export BASIC_AUTH_ENABLED=${BASIC_AUTH_ENABLED:=true}
export BASIC_AUTH_USERNAME=${BASIC_AUTH_USERNAME:=admin}
export BASIC_AUTH_PASSWORD=${BASIC_AUTH_PASSWORD:=${PROJECT_NAME}_password}

/bin/sh /opt/bin/configure.sh

/usr/sbin/nginx -g "daemon off;"