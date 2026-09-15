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

# storage/ (and any subpath mounted as a Railway volume) must stay writable by the php-fpm user.
mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chown -R nginx:nginx storage bootstrap/cache

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "Running database migrations..."
    if ! php artisan migrate --force --no-interaction; then
        echo "Migrations failed, continuing startup anyway so the app can report the error over HTTP" >&2
    fi
fi

echo "Starting php-fpm..."
php-fpm --nodaemonize &
FPM_PID=$!

# Give php-fpm a chance to start listening on 127.0.0.1:9000 before nginx starts proxying to it.
i=0
while ! nc -z 127.0.0.1 9000 2>/dev/null; do
    if ! kill -0 "$FPM_PID" 2>/dev/null; then
        echo "php-fpm exited before it was ready" >&2
        exit 1
    fi
    i=$((i + 1))
    if [ "$i" -ge 30 ]; then
        echo "Timed out waiting for php-fpm to listen on port 9000" >&2
        exit 1
    fi
    sleep 1
done

echo "php-fpm ready, starting nginx on port $PORT..."
exec nginx -g 'daemon off;'