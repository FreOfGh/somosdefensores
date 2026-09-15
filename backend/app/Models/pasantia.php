<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Ramsey\Uuid\Uuid;
/*
* La tabla pasantía  esta compuesta por los campos:
*  -id: Identificador unico de cada caso de tipo uuid
*  -created_at: Fecha de creacion del caso
* -updated_at: Fecha de actualizacion del caso
* -deleted_at: Fecha de eliminacion del caso, utilizando soft delete
* - nombre_victima: Nombre de la victima del caso
* - apellido_victima: Apellido de la victima del caso
* -correo_victima: Correo de la victima del caso
* -estado: Estado del caso, puede ser "pendiente de revisión", "en proceso de validación", "rechazado", "aprobado", "esperando desembolso", "desembolsado", "en proceso de cierre"" 
- -primer pago: Estado del primer pago, puede ser "pendiente de desembolso" o "desembolsado"
- -segundo pago: Estado del segundo pago, puede ser "pendiente de desembolso" o "desembolsado"
- -tercer pago: Estado del tercer pago, puede ser "pendiente de desembolso" o "desembolsado"

* El nombre, apellido coreo electronico y numero de whatsapp estan cifrados a nivel de aplicación
* El uuid se genera automaticamente al crear un nuevo caso, utilizando la libreria ramsey/uuid
*/
class pasantia extends Model
{
    use HasFactory, SoftDeletes;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Uuid::uuid4()->toString();
            }
        });
    }

    protected $table = 'pasantia';
    
    protected $fillable = [
        'id',
        'nombre_victima',
        'apellido_victima',
        'numero_identificacion',
        'tipo_documento',
        'correo_victima',
        'estado',
        'numero_whatsapp',
        'token',
        'primer_pago',
        'segundo_pago',
        'tercer_pago'
        ,'fecha_remision'
        ,'edad'
        ,'genero'
        ,'grupo_etnico'
        ,'tiene_discapacidad'
        ,'cual_discapacidad'
        ,'tiene_condicion_salud'
        ,'cual_condicion_salud'
        ,'procedencia_departamento'
        ,'procedencia_municipio'
        ,'procedencia_vereda_comunidad'
        ,'procedencia_resguardo'
        ,'residencia_departamento'
        ,'residencia_municipio'
        ,'residencia_vereda_comunidad'
        ,'residencia_resguardo'
        ,'nombre_organizacion'
        ,'tipo_liderazgo'
        ,'tipo_liderazgo_otro'
        ,'organizacion_remite'
        ,'persona_organizacion_nombre'
        ,'persona_organizacion_correo'
        ,'persona_organizacion_celular'
        ,'motivo_solicitud'
        ,'tipo_pasantia'
        ,'estado_civil'
        ,'otra_composicion_familiar'
        ,'tiene_hijos'
        ,'numero_hijos'
        ,'edades_hijos'
        ,'personas_conviven'
        ,'total_grupo_familiar'
        ,'fecha_lugar_descripcion_caso'
        ,'riesgo_motivos_amenaza'
        ,'agresiones'
        ,'concepto_equipo_proteccion'
        ,'seguimiento'
        ,'documentos_adjuntos'
    ];

    protected $dates = ['deleted_at'];
    protected $casts = [
        'id' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'nombre_victima' => 'string',
        'apellido_victima' => 'string',
        'correo_victima' => 'string',
        'numero_identificacion' => 'string',
        'numero_whatsapp' => 'string',
        'estado' => 'string',
        'token' => 'string',
        'primer_pago' => 'string',
        'segundo_pago' => 'string',
        'tercer_pago' => 'string',
        'fecha_remision' => 'date',
        'edades_hijos' => 'array',
        'personas_conviven' => 'array',
        'documentos_adjuntos' => 'array',
        'agresiones' => 'array',
    ];
}
