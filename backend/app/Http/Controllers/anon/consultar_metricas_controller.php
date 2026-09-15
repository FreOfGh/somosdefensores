<?php

namespace App\Http\Controllers\anon;

// consultar casos atendidos entiendase cantidad de casos con estado diferente a pendiente de validacion y cantidad de casos totales.

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\casos;
class consultar_metricas_controller extends Controller
{
    public function obtener_metricas_publicas()
    {
        $casos_totales = casos::count();
        $casos_atendidos = casos::where('estado', '!=', 'pendiente de revisión')->count();

        return response()->json([
            'casos_totales' => $casos_totales,
            'casos_atendidos' => $casos_atendidos,
        ]);
    }
}