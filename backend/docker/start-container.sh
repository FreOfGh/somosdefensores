#!/bin/sh
set -eu

PORT="${PORT:-8080}"
case "$PORT" in
    *[!0-9]*|'') echo "PORT must be numeric" >&2; exit 1 ;;
esac

# Railway's PostgreSQL service exposes PG* variables. Laravel uses DB_* variables.
export DB_CONNECTION="${DB_CONNECTION:-pgsql}"
export DB_HOST="${DB_HOST:-${PGHOST:-}}"
export DB_PORT="${DB_PORT:-${PGPORT:-5432}}"
export DB_DATABASE="${DB_DATABASE:-${PGDATABASE:-}}"
export DB_USERNAME="${DB_USERNAME:-${PGUSER:-}}"
export DB_PASSWORD="${DB_PASSWORD:-${PGPASSWORD:-}}"

if [ -z "${APP_KEY:-}" ]; then
    echo "APP_KEY is required" >&2
    exit 1
fi

if [ -z "$DB_HOST" ] || [ -z "$DB_DATABASE" ] || [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ]; then
    echo "PostgreSQL credentials are required" >&2
    exit 1
fi

sed "s/__PORT__/$PORT/g" /etc/nginx/http.d/default.conf > /etc/nginx/http.d/default.conf.tmp
mv /etc/nginx/http.d/default.conf.tmp /etc/nginx/http.d/default.conf

mkdir -p /var/run/php-fpm
chown nginx:nginx /var/run/php-fpm

# storage/app/public should be a mounted volume in production; a fresh mount is owned by root.
mkdir -p storage/app/public
chown -R nginx:nginx storage/app/public

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    php artisan migrate --force --no-interaction
fi

php-fpm -D
exec nginx -g 'daemon off;'