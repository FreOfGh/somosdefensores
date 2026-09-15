# Filosofía

la menor cantidad de información pósible en canales inseguros.

# Sistema de alertas.




## Implementacion.

El sistema de alertas se basa en peticiones que realizan al backend

## Estructura.

###

## Alertas

### Ingreso nuevo caso.

#### Petición 
Recibe petición con el tipo de caso.

#### Alerta
Envía correo electrónico con el ingreso de caso, el tipo de caso, y la fecha en la que el caso ingresó al sistema.

## Encuesta de finalización del caso.

Se envía una encuesta de finalización del caso a la persona encargada del caso a su correo electronico, esa encuesta tiene el formato  dominio/anon/token.finalizacion-

## Lógica finalización del caso.

### Token unico de finalización de caso.

Se genera cuando un usuario con el rol `equipo revision de casos` envía el formulario de finalización. El token se guarda como un hash, vence a los siete días y solo puede utilizarse una vez.

### Correo.

Se envía un correo electrónico con el enlace `FRONTEND_URL/finalizacion/{token}`. Configure `FRONTEND_URL` en el archivo `.env` del backend con la URL pública del frontend.

### acceso.

Una vez el usuario ingresa

1. se valida que el token sea válido y no haya expirado
2. se verifica que no se haya utilizado antes

Le aparece el formulario de finalización. Al responderlo, el estado del caso cambia a `finalizado`, se guarda la respuesta y el token se invalida.

### Endpoints

- `POST /api/revision/casos/{tipoCaso}/{casoId}/finalizacion`: genera y envía la invitación. `tipoCaso` puede ser `ayuda_humanitaria` o `pasantia`; acepta opcionalmente `correo_destinatario`.
- `GET /api/publico/finalizacion/{token}`: valida el enlace antes de mostrar el formulario.
- `POST /api/publico/finalizacion/{token}`: registra el campo obligatorio `respuesta`, finaliza el caso e invalida el token.

