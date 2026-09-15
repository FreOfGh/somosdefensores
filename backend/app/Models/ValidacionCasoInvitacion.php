<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ValidacionCasoInvitacion extends Model
{
    protected $table = 'validacion_caso_invitaciones';

    protected $fillable = [
        'tipo_caso', 'caso_id', 'validador_id', 'token_hash', 'expires_at',
        'responded_at', 'decision', 'comentarios', 'respuesta_revisor', 'reopened_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'responded_at' => 'datetime',
        'reopened_at' => 'datetime',
    ];

    public function validador()
    {
        return $this->belongsTo(User::class, 'validador_id');
    }
}