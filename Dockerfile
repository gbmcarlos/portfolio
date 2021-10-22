FROM nginx:1.15.5-alpine

## SYSTEM DEPENDENCIES
### vim and bash are utilities, so that we can work inside the container
### apache2-utils is necessary to use htpasswd to encrypt the password for basic auth
### ruby-rdoc, ruby-dev, ruby-etc and build-base are necessary to instal gems
### bigdecimal is not installed in the alpine ruby environment by default
### bundler to install gem dependencies from a Gemfile
RUN     apk update \
    &&  apk add \
            vim bash \
            apache2-utils \
            ruby-rdoc ruby-dev ruby-etc build-base \
    &&  gem install \
            bigdecimal \
            bundler

WORKDIR /var/task

## GEM DEPENDENCIES
### Copy the Gemfile files and install dependencies with bundler
COPY Gemfile* ./
RUN bundler install

## SCRIPTS
### Make sure all scripts have execution permissions
COPY bin/entrypoint.sh /opt/bin/entrypoint.sh

## CONFIG FILES
### We just need a very simple nginx config file
COPY config/nginx.conf /etc/nginx/nginx.conf

## SOURCE CODE
COPY src ./src

## JEKYLL BUILD
### Build from src to src/public
RUN jekyll build --trace --config /var/task/src/config.yml

CMD ["/opt/bin/entrypoint.sh", "-g", "daemon off;"]
