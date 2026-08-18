<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Modificar tabla proveedores: agregar descripcion y hacer opcionales los datos bancarios
        Schema::table('proveedores', function (Blueprint $table) {
            $table->string('descripcion', 255)->nullable()->after('nombre_razon_social');
            $table->string('nit_ci', 50)->nullable()->change();
            $table->string('banco', 100)->nullable()->change();
            $table->string('tipo_cuenta', 50)->nullable()->change();
            $table->string('numero_cuenta', 100)->nullable()->change();
            $table->string('nombre_titular_cuenta', 150)->nullable()->change();
        });

        // 2. Modificar tabla solicitudes: agregar tipo_solicitud
        Schema::table('solicitudes', function (Blueprint $table) {
            $table->string('tipo_solicitud', 50)->default('Pago a Proveedor')->after('solicitante_id');
        });
    }

    public function down(): void
    {
        Schema::table('proveedores', function (Blueprint $table) {
            $table->dropColumn('descripcion');
        });

        Schema::table('solicitudes', function (Blueprint $table) {
            $table->dropColumn('tipo_solicitud');
        });
    }
};
