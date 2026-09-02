<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Asegurar que existe el nuevo Rol 'Contabilidad - Caja Chica'
        $exists = DB::table('roles')->where('nombre', 'Contabilidad - Caja Chica')->first();
        if (!$exists) {
            DB::table('roles')->insert([
                'nombre' => 'Contabilidad - Caja Chica',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Asignar rol Contabilidad a contabilidad@fralak.com.bo si existe
        $rolConta = DB::table('roles')->whereIn('nombre', ['Contabilidad', 'Conta'])->first();
        if ($rolConta) {
            DB::table('usuarios')
                ->where('correo', 'contabilidad@fralak.com.bo')
                ->update(['rol_id' => $rolConta->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('roles')->where('nombre', 'Contabilidad - Caja Chica')->delete();
    }
};
