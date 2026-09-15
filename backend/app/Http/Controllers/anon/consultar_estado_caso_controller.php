<?php
namespace App\Http\Controllers\anon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


class consultar_estado_caso_controller extends Controller
{
    public function obtener_estado_del_caso_por_numero_de_identificacion($numero_identificacion)
    {
        // Buscar el caso por su número de identificación
        $caso = \App\Models\casos::where('numero_identificacion', $numero_identificacion)->first();

        if (!$caso) {
            return response()->json(['message' => 'Caso no encontrado'], 404);
        }

        return response()->json(['estado' => $caso->estado], 200);
    }
}