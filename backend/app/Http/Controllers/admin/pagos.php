<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ayuda_humanitaria;
use App\Models\pasantia;
class pagos extends Controller
{
    private function cambiar_estado_pago($id, $tipo_ayuda, $nuevo_estado)
    {
        if ($tipo_ayuda === 'ayuda_humanitaria') {
            $caso = ayuda_humanitaria::find($id);
            if (!$caso) {
                return response()->json(['message' => 'Caso de ayuda humanitaria no encontrado'], 404);
            }
            $estadoPago = is_array($nuevo_estado) ? ($nuevo_estado['estado'] ?? null) : $nuevo_estado;
            if ($estadoPago === 'desembolsado' && $caso->estado !== 'aprobado') {
                return response()->json(['message' => 'Solo se puede marcar como desembolsado un caso aprobado.'], 422);
            }
            $caso->pago_unico = $estadoPago;
            $caso->save();
        } elseif ($tipo_ayuda === 'pasantia') {
            $caso = pasantia::find($id);
            if (!$caso) {
                return response()->json(['message' => 'Caso de pasantía no encontrado'], 404);
            }
            // Cambiar el estado del pago correspondiente
            if ($nuevo_estado['pago'] === 'primer_pago') {
                $caso->primer_pago = $nuevo_estado['estado'];
            } elseif ($nuevo_estado['pago'] === 'segundo_pago') {
                $caso->segundo_pago = $nuevo_estado['estado'];
            } elseif ($nuevo_estado['pago'] === 'tercer_pago') {
                $caso->tercer_pago = $nuevo_estado['estado'];
            } else {
                return response()->json(['message' => 'Tipo de pago inválido'], 400);
            }
            $caso->save();
        } else {
            return response()->json(['message' => 'Tipo de ayuda inválido'], 400);
        }

        return response()->json(['message' => 'Estado del pago actualizado exitosamente'], 200);
    }
    public function cambiar_estado_pago_ayuda_humanitaria(Request $request, $id)
    {
        $nuevo_estado = $request->input('estado');
        return $this->cambiar_estado_pago($id, 'ayuda_humanitaria', ['estado' => $nuevo_estado]);
    }
    public function cambiar_estado_pago_pasantia(Request $request, $id)
    {
        $nuevo_estado = $request->input('estado');
        $pago = $request->input('pago'); // primer_pago, segundo_pago o tercer_pago
        return $this->cambiar_estado_pago($id, 'pasantia', ['estado' => $nuevo_estado, 'pago' => $pago]);
    }
    
    
}
