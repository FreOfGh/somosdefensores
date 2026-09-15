# Despliegue en Railway

Configure `backend` como el **Root Directory** del servicio de la aplicacion. Railway detectara el `Dockerfile` de esta carpeta.

Agregue un servicio PostgreSQL desde Railway. Mantengalo privado: no genere un dominio publico ni exponga un puerto TCP para ese servicio. Railway proporciona las credenciales mediante `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` y `PGPASSWORD`; el contenedor las adapta a las variables de Laravel sin almacenarlas en el repositorio.

En el servicio de la aplicacion configure estas variables:

```text
APP_ENV=production
APP_DEBUG=false
APP_KEY=<generar con php artisan key:generate --show>
RUN_MIGRATIONS=true
```

No defina `DB_PASSWORD` con un valor escrito en el repositorio. Use la referencia a la contraseña generada por Railway (`${{Postgres.PGPASSWORD}}`) o permita que Railway entregue `PGPASSWORD`. Railway genera esta contraseña como secreto seguro al crear el servicio PostgreSQL.

El contenedor solo publica Nginx en el puerto `PORT` asignado por Railway. PHP-FPM usa un socket Unix interno y no queda expuesto en red. Nginx permite cargas de hasta 100 MB.

Tras la primera migracion, cambie `RUN_MIGRATIONS` a `false` para que las migraciones se ejecuten desde un proceso de despliegue controlado.

## Persistencia de los documentos adjuntos

El sistema de archivos del contenedor es efimero: cualquier archivo subido a `storage/app/public` se pierde en cada redeploy o reinicio si no se configura un volumen. Esto provoca error 404 al intentar abrir o descargar documentos que fueron subidos antes del ultimo despliegue.

Para evitar esto, cree un **Volume** en Railway para el servicio de la aplicacion y montelo en la ruta `/var/www/html/storage/app/public`. El script de arranque ajusta automaticamente los permisos de esa ruta (propietario `nginx`) en cada inicio, incluso si el volumen se monta como `root`.
