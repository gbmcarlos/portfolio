FROM nginx:1.15.5

## SYSTEM DEPENDENCIES
### ruby-full includes gem
### bundler to install dependencies from a Gemfile
RUN     apt update \
    &&  apt install -y \
            build-essential \
            ruby-full \
    &&  gem install \
            bundler

WORKDIR /var/www

## GEM DEPENDENCIES
### Copy the Gemfile files and install dependencies with bundler
COPY ./Gemfile* /var/www/
RUN bundler install

## CONFIG FILES
### We just need a very simple nginx config file
COPY ./deploy/config/nginx.conf /etc/nginx/nginx.conf

## SOURCE CODE
COPY ./src /var/www/src

## JEKYLL BUILD
### Build from src to src/public
RUN jekyll build --source /var/www/src --destination /var/www/src/public