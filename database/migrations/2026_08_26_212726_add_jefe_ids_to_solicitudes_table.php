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
        if (Schema::hasTable('solicitudes') && !Schema::hasColumn('solicitudes', 'jefe_ids')) {
            Schema::table('solicitudes', function (Blueprint $table) {
                $table->json('jefe_ids')->nullable()->after('jefe_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('solicitudes') && Schema::hasColumn('solicitudes', 'jefe_ids')) {
            Schema::table('solicitudes', function (Blueprint $table) {
                $table->dropColumn('jefe_ids');
            });
        }
    }
};
