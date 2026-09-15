<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * La tabla casos esta compuesta por los campos:
     *  -id: Identificador unico de cada caso de tipo uuid
     *  -created_at: Fecha de creacion del caso
     * -updated_at: Fecha de actualizacion del caso
     * -deleted_at: Fecha de eliminacion del caso, utilizando soft delete
     * - nombre_victima: Nombre de la victima del caso
     * - apellido_victima: Apellido de la victima del caso
     * -correo_victima: Correo de la victima del caso
     * -numero_whatsapp: Numero de whatsapp de la victima del caso
     * -estado: Estado del caso, puede ser "pendiente de revisión", "en proceso de validación", "rechazado", "aprobado", "esperando desembolso", "desembolsado", "en proceso de cierre","cerrado"
     * -token: token aleatorio de 32 caracteres y de uso único para generar un link de acceso al caso, para cambiar el estado del caso, este token se genera al momento de crear el caso y se almacena en la base de datos, y se envia al correo de la victima para que pueda acceder al caso y cambiar su estado
     * -tipo_caso: El tipo de caso, puede ser "asistencia humanitaria", "pasantía"
     * si es tipo "asistencia humannitaria" se debe crear un registro en la tabla asistencia_humanitaria, si es tipo "pasantía" se debe crear un registro en la tabla pasantia
     * -El nombre, apellido, correo electronico y numero de whatsapp estan cifrados a nivel de aplicación 
    */ 
    public function up(): void
    {
        Schema::create('casos', function (Blueprint $table) {
            $table->uuid('id')->primary()->required();
            $table->string('nombre_victima');
            $table->string('apellido_victima');
            $table->string('numero_identificacion')->unique();
            $table->string('correo_victima');
            $table->string('numero_whatsapp')->nullable();
            $table->string('estado')->default('pendiente de revisión');
            $table->string('token', 32)->unique();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('casos');
    }
};
