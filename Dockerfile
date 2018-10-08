FROM nginx:1.15.5

RUN     apt update \
    &&  apt install -y \
            build-essential \
            ruby-full \
    &&  gem install \
            bundler \
            minima \
            jekyll-feed

COPY ./deploy/config/nginx.conf /etc/nginx/nginx.conf

COPY ./src /var/www/src

WORKDIR /var/www/src

RUN jekyll build