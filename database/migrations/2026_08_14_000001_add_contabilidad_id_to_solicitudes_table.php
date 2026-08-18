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
        if (Schema::hasTable('solicitudes') && !Schema::hasColumn('solicitudes', 'contabilidad_id')) {
            Schema::table('solicitudes', function (Blueprint $table) {
                $table->unsignedBigInteger('contabilidad_id')->nullable()->after('jefe_id');
                $table->foreign('contabilidad_id')->references('id')->on('usuarios')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('solicitudes') && Schema::hasColumn('solicitudes', 'contabilidad_id')) {
            Schema::table('solicitudes', function (Blueprint $table) {
                $table->dropForeign(['contabilidad_id']);
                $table->dropColumn('contabilidad_id');
            });
        }
    }
};
