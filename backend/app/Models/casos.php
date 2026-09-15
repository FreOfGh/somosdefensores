<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Ramsey\Uuid\Uuid;
/*
* La tabla casos esta compuesta por los campos:
*  -id: Identificador unico de cada caso de tipo uuid
*  -created_at: Fecha de creacion del caso
* -updated_at: Fecha de actualizacion del caso
* -deleted_at: Fecha de eliminacion del caso, utilizando soft delete
* - nombre_victima: Nombre de la victima del caso
* - apellido_victima: Apellido de la victima del caso
* -correo_victima: Correo de la victima del caso
* -estado: Estado del caso, puede ser "pendiente de revisión", "en proceso de validación", "rechazado", "aprobado", "esperando desembolso", "desembolsado", "en proceso de cierre"" 
* El nombre, apellido coreo electronico y numero de whatsapp estan cifrados a nivel de aplicación
* El uuid se genera automaticamente al crear un nuevo caso, utilizando la libreria ramsey/uuid
*/
class casos extends Model
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

    protected $table = 'casos';
    
    protected $fillable = [
        'id',
        'nombre_victima',
        'apellido_victima',
        'correo_victima',
        'estado',
        'numero_whatsapp',
        'token'
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
        'numero_whatsapp' => 'string',
        'estado' => 'string',
        'token' => 'string',
    ];
}
