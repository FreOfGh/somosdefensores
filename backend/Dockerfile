FROM composer:2 AS dependencies

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --prefer-dist --optimize-autoloader

FROM php:8.3-fpm-alpine

RUN apk add --no-cache nginx libpng libjpeg-turbo freetype libzip icu-libs postgresql-libs \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev icu-dev postgresql-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" gd intl opcache pdo_pgsql pgsql zip \
    && apk del .build-deps \
    && rm -rf /var/cache/apk/* /etc/nginx/http.d/default.conf

WORKDIR /var/www/html

COPY --from=dependencies /app/vendor ./vendor
COPY . .
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/railway.ini
COPY docker/start-container.sh /usr/local/bin/start-container

RUN mkdir -p /run/nginx /var/run/php-fpm \
    && sed -i 's!^user = .*!user = nginx!' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's!^group = .*!group = nginx!' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's!^listen = .*!listen = /var/run/php-fpm/php-fpm.sock!' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's!^;listen.owner =.*!listen.owner = nginx!' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's!^;listen.group =.*!listen.group = nginx!' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's!^;listen.mode =.*!listen.mode = 0660!' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's!^;clear_env =.*!clear_env = no!' /usr/local/etc/php-fpm.d/www.conf \
    && chown -R nginx:nginx storage bootstrap/cache /var/run/php-fpm \
    && chmod +x /usr/local/bin/start-container

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr

EXPOSE 8080

CMD ["/usr/local/bin/start-container"]