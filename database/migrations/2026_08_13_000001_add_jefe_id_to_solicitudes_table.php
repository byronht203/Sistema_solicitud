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
        if (Schema::hasTable('solicitudes') && !Schema::hasColumn('solicitudes', 'jefe_id')) {
            Schema::table('solicitudes', function (Blueprint $table) {
                $table->unsignedBigInteger('jefe_id')->nullable()->after('solicitante_id');
                $table->foreign('jefe_id')->references('id')->on('usuarios')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('solicitudes') && Schema::hasColumn('solicitudes', 'jefe_id')) {
            Schema::table('solicitudes', function (Blueprint $table) {
                $table->dropForeign(['jefe_id']);
                $table->dropColumn('jefe_id');
            });
        }
    }
};
