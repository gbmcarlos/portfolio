#!/usr/bin/env bash

export PORT=${PORT=80}
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
    htpasswd -cb -B -C 10 /etc/nginx/.htpasswd ${BASIC_AUTH_USERNAME} ${BASIC_AUTH_PASSWORD} > /dev/null 2>&1 ;
else
    export BASIC_AUTH_ENABLED=off ;
fi
### Replace these env vars in the nginx config file
envsubst '${PORT}${BASIC_AUTH_ENABLED}${PROJECT_NAME}${PORT}' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.tmp
mv /etc/nginx/nginx.conf.tmp /etc/nginx/nginx.conf