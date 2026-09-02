<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('solicitudes') && !Schema::hasColumn('solicitudes', 'contabilidad_ids')) {
            Schema::table('solicitudes', function (Blueprint $table) {
                $table->json('contabilidad_ids')->nullable()->after('contabilidad_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('solicitudes') && Schema::hasColumn('solicitudes', 'contabilidad_ids')) {
            Schema::table('solicitudes', function (Blueprint $table) {
                $table->dropColumn('contabilidad_ids');
            });
        }
    }
};
