<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ProteccionColectiva extends Model
{
    use SoftDeletes;

    protected $table = 'proteccion_colectiva';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',

        'fecha_remision_caso',

        'tiene_personeria_juridica',
        'rut',

        'nombre_organizacion',

        'representante_legal',
        'cc_representante',

        'telefono',
        'correo_electronico',

        'departamento_municipio_vereda',

        'descripcion_organizacion',

        'trabajos_realizados',

        'riesgos_seguridad_agresiones',

        'medidas_proteccion_colectiva',

        'justificacion_medidas',

        'representante_nombre',
        'representante_apellido',
        'representante_tipo',
        'cedula',
        'correo',
        'departamento',
        'municipio',
        'vereda',
        'estructura_organizacion',
        'reivindicaciones',
        'derechos_defiende',
        'trabajos_realiza',
        'riesgos_seguridad',
        'incidentes',
        'afectacion_trabajo',
        'actores_riesgo',
        'medidas_proteccion',
        'informacion_adicional',
        'seguimiento',

        'estado',

        'token',
    ];

    protected $casts = [
        'fecha_remision_caso' => 'date',
        'tiene_personeria_juridica' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($modelo) {

            if (!$modelo->id) {
                $modelo->id = (string) Str::uuid();
            }

            if (!$modelo->token) {
                $modelo->token = Str::random(32);
            }
        });
    }
}