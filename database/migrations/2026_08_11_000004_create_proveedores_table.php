<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proveedores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creado_por_usuario_id')->constrained('usuarios')->onDelete('restrict');
            $table->string('nombre_razon_social', 150);
            $table->string('nit_ci', 50);
            $table->string('banco', 100);
            $table->enum('tipo_cuenta', ['Caja de Ahorro', 'Cuenta Corriente', 'Otro'])->default('Caja de Ahorro');
            $table->string('numero_cuenta', 100);
            $table->string('nombre_titular_cuenta', 150);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proveedores');
    }
};
