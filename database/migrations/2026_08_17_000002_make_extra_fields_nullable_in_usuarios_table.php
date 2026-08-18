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
        Schema::table('usuarios', function (Blueprint $table) {
            $table->string('ci', 50)->nullable()->change();
            $table->string('cargo', 100)->nullable()->change();
            $table->string('direccion', 255)->nullable()->change();
            $table->string('telefono', 50)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->string('ci', 50)->nullable(false)->change();
            $table->string('cargo', 100)->nullable(false)->change();
        });
    }
};
