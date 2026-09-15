<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * el pago unico  tiene estados "pendiente de desembolso" y "desembolsado", si el estado es "pendiente de desembolso" indica que todavía no se ha desembolsado el dinero, si el estado es "desembolsado" indica que ya se ha desembolsado el dinero
     * la pasantíatien un total de 3 pagos, primer pago, segundo pago y tercer pago, cada pago tiene un estado, si el estado es "pendiente de desembolso" indica que todavía no se ha desembolsado el dinero, si el estado es "desembolsado" indica que ya se ha desembolsado el dinero 
    */
    public function up(): void
    {
        Schema::create('ayuda_humanitaria', function (Blueprint $table) {
            $table->uuid('id')->primary()->required();
            $table->string('nombre_victima');
            $table->string('apellido_victima');
            $table->string('numero_identificacion')->unique();
            $table->string('correo_victima');
            $table->string('numero_whatsapp')->nullable();
            $table->string('estado')->default('pendiente de revisión');
            $table->string('token', 32)->unique();
            $table->timestamps();
            $table->string('pago_unico')->default('pendiente de desembolso');
            $table->softDeletes();
        });

        Schema::create('pasantia', function (Blueprint $table) {
            $table->uuid('id')->primary()->required();
            $table->string('nombre_victima');
            $table->string('apellido_victima');
            $table->string('numero_identificacion')->unique();
            $table->string('correo_victima');
            $table->string('numero_whatsapp')->nullable();
            $table->string('estado')->default('pendiente de revisión');
            $table->string('token', 32)->unique();
            $table->string('primer_pago')->default('pendiente de desembolso');
            $table->string('segundo_pago')->default('pendiente de desembolso');
            $table->string('tercer_pago')->default('pendiente de desembolso');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ayuda_humanitaria');
        Schema::dropIfExists('pasantia');
    }
};
