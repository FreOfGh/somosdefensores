<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\admin\casos;
use App\Http\Controllers\admin\pagos;
use App\Http\Controllers\anon\agregar_caso_controller;
use App\Http\Controllers\anon\consultar_estado_caso_controller;
use App\Http\Controllers\anon\consultar_metricas_controller;
use App\Mail\ayudaHumanitaria\desembolso;
use App\Http\Controllers\anon\ProteccionColectivaController;
use App\Http\Controllers\FinalizacionCasoController;
use App\Http\Controllers\SeguimientoCasoController;
use App\Http\Controllers\ValidacionCasoController;
use App\Http\Controllers\AdminMetricasController;
use App\Http\Controllers\Publico\MapasController;
use \App\Http\Controllers\admin\ajustes\usuarios;
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::prefix('publico')->group(function () {
    Route::prefix('mapas')->group(function () {
        Route::get('/departamentos', [MapasController::class, 'departamentos']);
        Route::get('/municipios', [MapasController::class, 'municipios']);
        Route::get('/departamentos/{departamento}/municipios', [MapasController::class, 'municipiosPorDepartamento']);
    });

    Route::get('/finalizacion/{token}', [FinalizacionCasoController::class, 'validar']);
    Route::post('/finalizacion/{token}', [FinalizacionCasoController::class, 'finalizar']);
    Route::get('/seguimiento/{token}', [SeguimientoCasoController::class, 'validar']);
    Route::post('/seguimiento/{token}', [SeguimientoCasoController::class, 'responder']);
    Route::get('/validacion/{token}', [ValidacionCasoController::class, 'mostrar']);
    Route::get('/validacion/{token}/documentos/{documento}', [ValidacionCasoController::class, 'documento']);
    Route::post('/validacion/{token}/responder', [ValidacionCasoController::class, 'responder']);

    Route::prefix('casos')->group(function () {
        Route::prefix('ayuda_humanitaria')->group(function () {
            Route::post('/agregar', [casos::class, 'agregar_caso_ayuda_humanitaria']);
            Route::get('/estado/{token}', [consultar_estado_caso_controller::class, 'consultar_estado_caso_ayuda_humanitaria']);
        });

        Route::prefix('pasantia')->group(function () {
            Route::post('/agregar', [casos::class, 'agregar_caso_pasantia']);
            Route::get('/estado/{token}', [consultar_estado_caso_controller::class, 'consultar_estado_caso_pasantia']);
        });

        Route::prefix('proteccion_colectiva')->group(function () {
            Route::post('/agregar', [ProteccionColectivaController::class, 'store']);
            Route::get('/estado/{token}', [consultar_estado_caso_controller::class, 'consultar_estado_caso_proteccion_colectiva']);
        });

    });

});

Route::middleware(['auth:sanctum', 'role:revisor|equipo revision de casos'])->prefix('admin')->group(function () {
    Route::get('/dashboard/metricas', [AdminMetricasController::class, 'index']);
    Route::get('/listar/humanitaria', [casos::class, 'listar_todas_las_ayudas_humanitarias']);
    Route::get('/listar/pasantia', [casos::class, 'listar_todas_las_pasantias']);
    Route::get('/humanitaria/{id}', [casos::class, 'obtener_ayuda_humanitaria']);
    Route::patch('/humanitaria/{id}', [casos::class, 'actualizar_ayuda_humanitaria']);
    Route::get('/pasantia/{id}', [casos::class, 'obtener_pasantia']);
    Route::patch('/pasantia/{id}', [casos::class, 'actualizar_pasantia']);
    Route::get('/listar/proteccion_colectiva', [ProteccionColectivaController::class, 'index']);
    Route::get('/proteccion_colectiva/{id}', [ProteccionColectivaController::class, 'show']);
    Route::patch('/proteccion_colectiva/{id}', [ProteccionColectivaController::class, 'update']);
    Route::get('/listar/humanitaria/{estado}', [casos::class, 'listar_ayudas_humanitarias_por_estado']);
    Route::get('/listar/pasantia/{estado}', [casos::class, 'listar_pasantias_por_estado']);
    Route::post('/actualizar_estado/humanitaria/{id}', [casos::class, 'actualizar_estado_ayuda_humanitaria']);
    Route::post('/actualizar_estado/pasantia/{id}', [casos::class, 'actualizar_estado_pasantia']);
    Route::post('/pagos/humanitaria/{id}', [pagos::class, 'cambiar_estado_pago_ayuda_humanitaria']);
    Route::post('/pagos/pasantia/{id}', [pagos::class, 'cambiar_estado_pago_pasantia']);
    Route::get('/exportar/{tipoCaso}/campos', [casos::class, 'camposExportacion']);
    Route::get('/exportar/{tipoCaso}/csv', [casos::class, 'exportarCsv']);
    Route::get('/graficos/{tipoCaso}/campos', [casos::class, 'camposGraficos']);
    Route::get('/graficos/{tipoCaso}/valores', [casos::class, 'valoresCampo']);
    Route::get('/graficos/{tipoCaso}/datos', [casos::class, 'datosGrafico']);
    Route::prefix('emails')->group(function () {
        Route::prefix('ayuda_humanitaria')->group(function () {
            Route::post('/desembolso', [casos::class, 'enviar_correo_desembolso']);
        });
    });

    Route::prefix('usuarios')->group(function () {
        Route::post('/crear', [usuarios::class, 'crear_usuario']);
        Route::get('/consultar', [usuarios::class, 'obtener_correo_rol']);
        Route::get('/', [usuarios::class, 'listar_usuarios']);
        Route::patch('/{usuario}/contrasena', [usuarios::class, 'actualizar_contrasena']);
        Route::delete('/{usuario}', [usuarios::class, 'eliminar_usuario']);
    });
});

Route::middleware(['auth:sanctum', 'role:revisor|equipo revision de casos'])->prefix('admin/casos')->group(function () {
    Route::get('/obtener_token/{id}', [casos::class, 'obterner_token_del_caso']);
    Route::post('/generar_nuevo_token/{id}', [casos::class, 'generar_nuevo_token']);
    Route::post('/cambiar_estado_caso/{token}', [casos::class, 'cambiar_estado']);
});

Route::middleware(['auth:sanctum', 'role:validador|equipo validacion de casos'])->prefix('validacion/casos')->group(function () {
    Route::post('/cambiar_estado_caso/{token}', [\App\Http\Controllers\admin\casos::class, 'cambiar_estado']);
});

Route::middleware(['auth:sanctum', 'role:revisor|equipo revision de casos'])->prefix('revision/casos')->group(function () {
    Route::post('/cambiar_estado_caso/{token}', [\App\Http\Controllers\admin\casos::class, 'cambiar_estado']);
    Route::post('/{tipoCaso}/{casoId}/finalizacion', [FinalizacionCasoController::class, 'crear']);
    Route::get('/{tipoCaso}/{casoId}/finalizacion', [FinalizacionCasoController::class, 'respuestas']);
    Route::post('/{tipoCaso}/{casoId}/finalizacion/enlace', [FinalizacionCasoController::class, 'enlace']);
    Route::post('/{tipoCaso}/{casoId}/seguimiento', [SeguimientoCasoController::class, 'crear']);
    Route::post('/{tipoCaso}/{casoId}/seguimiento/enlace', [SeguimientoCasoController::class, 'enlace']);
    Route::get('/{tipoCaso}/{casoId}/seguimiento', [SeguimientoCasoController::class, 'respuestas']);
    Route::get('/{tipoCaso}/{casoId}/pdf', [ValidacionCasoController::class, 'exportarPdf']);
    Route::post('/{tipoCaso}/{casoId}/iniciar-validacion', [ValidacionCasoController::class, 'iniciar']);
    Route::get('/{tipoCaso}/{casoId}/validaciones', [ValidacionCasoController::class, 'historial']);
    Route::post('/validaciones/{invitacionId}/responder', [ValidacionCasoController::class, 'responderValidador']);
    Route::post('/{tipoCaso}/{casoId}/decision-final', [ValidacionCasoController::class, 'decisionFinal']);
});

Route::middleware(['auth:sanctum', 'role:revisor|equipo revision de casos'])->prefix('admin/casos')->group(function () {
    Route::get('/{tipoCaso}/{casoId}/documentos', [ValidacionCasoController::class, 'documentosAdministrativos']);
    Route::post('/{tipoCaso}/{casoId}/documentos', [ValidacionCasoController::class, 'agregarDocumentoAdministrativo']);
    Route::post('/{tipoCaso}/{casoId}/documentos/{documento}', [ValidacionCasoController::class, 'reemplazarDocumentoAdministrativo']);
});

Route::get('/admin/casos/{tipoCaso}/{casoId}/documentos/{documento}', [ValidacionCasoController::class, 'documentoAdministrativo'])
    ->middleware('signed')
    ->name('admin.case.document-preview');

Route::get('/admin/casos/{tipoCaso}/{casoId}/documentos-zip', [ValidacionCasoController::class, 'documentosZipAdministrativo'])
    ->middleware('signed')
    ->name('admin.case.documents-zip');