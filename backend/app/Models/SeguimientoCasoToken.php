<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeguimientoCasoToken extends Model
{
    protected $table = 'seguimiento_caso_tokens';

    protected $fillable = [
        'tipo_caso',
        'caso_id',
        'correo_destinatario',
        'token_hash',
        'expires_at',
        'used_at',
        'respuesta',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'respuesta' => 'array',
    ];
}
