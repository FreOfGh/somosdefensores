<?php

namespace App\Http\Controllers\anon;
use App\Models\casos;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class agregar_caso_controller extends Controller
{
    public function agregar_caso(Request $request)
    {
        // Validar los datos de entrada
        $validatedData = $request->validate([
            'nombre_victima' => 'required|string|max:255',
            'apellido_victima' => 'required|string|max:255',
            'numero_identificacion' => 'required|string|max:255|unique:casos,numero_identificacion',
            'correo_victima' => 'required|email|max:255',
            'numero_whatsapp' => 'nullable|string|max:20',
        ]);

        // Crear un nuevo caso
        $caso = new casos();
        $caso->nombre_victima = $validatedData['nombre_victima'];
        $caso->apellido_victima = $validatedData['apellido_victima'];
        $caso->numero_identificacion = $validatedData['numero_identificacion'];
        $caso->correo_victima = $validatedData['correo_victima'];
        $caso->numero_whatsapp = $validatedData['numero_whatsapp'] ?? null;
        $caso->estado = 'pendiente de revisión';
        $caso->token = bin2hex(random_bytes(16)); // Generar un token aleatorio de 32 caracteres
        $caso->save();

        // Retornar una respuesta exitosa
        return response()->json(['message' => 'Caso agregado exitosamente'], 201);
    } 
    
}