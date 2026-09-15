<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class AdminMetricasController extends Controller
{
    public function index()
    {
        return response()->json([
            'por_tipo' => DB::table('vista_metricas_casos_por_tipo')->orderBy('tipo_caso')->get(),
            'por_estado' => DB::table('vista_metricas_casos_por_estado')->orderBy('estado')->get(),
        ]);
    }
}