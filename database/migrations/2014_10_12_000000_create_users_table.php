<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabla 'users' por defecto de Laravel deshabilitada.
        // El proyecto utiliza exclusivamente la tabla personalizada 'usuarios' (2026_08_11_000003_create_usuarios_table.php).
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
