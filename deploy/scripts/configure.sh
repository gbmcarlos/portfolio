#!/usr/bin/env bash

set -ex

export PROJECT_NAME=${PROJECT_NAME=localhost}
export BASIC_AUTH_ENABLED=${BASIC_AUTH_ENABLED:=true}
export BASIC_AUTH_USERNAME=${BASIC_AUTH_USERNAME:=admin}
export BASIC_AUTH_PASSWORD=${BASIC_AUTH_PASSWORD:=${PROJECT_NAME}_password}

## BASIC AUTH
### If BASIC_AUTH_ENABLED is anything different than "true", set it to "off",
### then replace it from the nginx config file with envsubst (gettext)
if
    [ ${BASIC_AUTH_ENABLED} = "true" ] ;
then
    htpasswd -cb -B -C 10 /etc/nginx/.htpasswd ${BASIC_AUTH_USERNAME} ${BASIC_AUTH_PASSWORD} ;
else
    export BASIC_AUTH_ENABLED=off ;
fi
envsubst '${BASIC_AUTH_ENABLED}${PROJECT_NAME}' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.tmp
mv /etc/nginx/nginx.conf.tmp /etc/nginx/nginx.conf