<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Ramsey\Uuid\Uuid;


class ayuda_humanitaria extends Model
{
    use SoftDeletes, HasFactory;
    

    protected $table = 'ayuda_humanitaria';
    
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
        'pago_unico',
        'fecha_remision',
        'edad',
        'genero',
        'grupo_etnico',
        'tiene_discapacidad',
        'cual_discapacidad',
        'tiene_condicion_salud',
        'cual_condicion_salud',
        'procedencia_departamento',
        'procedencia_municipio',
        'procedencia_vereda_comunidad',
        'procedencia_resguardo',
        'residencia_departamento',
        'residencia_municipio',
        'residencia_vereda_comunidad',
        'residencia_resguardo',
        'nombre_organizacion',
        'tipo_liderazgo',
        'tipo_liderazgo_otro',
        'organizacion_remite',
        'persona_organizacion_nombre',
        'persona_organizacion_correo',
        'persona_organizacion_celular',
        'motivo_solicitud',
        'estado_civil',
        'otra_composicion_familiar',
        'tiene_hijos',
        'numero_hijos',
        'edades_hijos',
        'personas_conviven',
        'total_grupo_familiar',
        'fecha_lugar_descripcion_caso',
        'riesgo_motivos_amenaza',
        'agresiones',
        'concepto_equipo_proteccion',
        'seguimiento',
        'documentos_adjuntos',

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
        'pago_unico' => 'string',
        'fecha_remision' => 'date',
        'edades_hijos' => 'array',
        'personas_conviven' => 'array',
        'documentos_adjuntos' => 'array',
        'agresiones' => 'array',
    ];
}
