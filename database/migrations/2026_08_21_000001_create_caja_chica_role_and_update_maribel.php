<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Crear el rol Caja Chica si no existe
        $rolCajaChica = DB::table('roles')->where('nombre', 'Caja Chica')->first();
        if (!$rolCajaChica) {
            $rolId = DB::table('roles')->insertGetId([
                'nombre' => 'Caja Chica',
                'descripcion' => 'Gestión y desembolso exclusivo de solicitudes de Caja Chica (Hasta 300 BOB)',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $rolId = $rolCajaChica->id;
        }

        // 2. Obtener el ID de la empresa Fralak SRL
        $fralak = DB::table('empresas')->where('nombre', 'like', '%Fralak%')->first();
        $fralakId = $fralak ? $fralak->id : 1;

        // 3. Actualizar a Maribel Caero Agreda con el rol de Caja Chica
        $maribel = DB::table('usuarios')
            ->where('correo', 'regente.scz@fralak.com.bo')
            ->orWhere(function ($q) {
                $q->where('nombre', 'like', '%Maribel%')
                  ->where('apellidos', 'like', '%Caero%');
            })
            ->first();

        if ($maribel) {
            DB::table('usuarios')->where('id', $maribel->id)->update([
                'rol_id' => $rolId,
                'cargo' => 'Regente Farmacéutico / Encargada Caja Chica',
                'updated_at' => now(),
            ]);

            // 4. Limpiar asignaciones en otras empresas y vincularla ÚNICAMENTE a Fralak SRL
            DB::table('usuario_empresa')->where('usuario_id', $maribel->id)->delete();

            DB::table('usuario_empresa')->insert([
                'usuario_id' => $maribel->id,
                'empresa_id' => $fralakId,
                'correo_corporativo' => 'regente.scz@fralak.com.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        // En rollback, restaurar rol Contabilidad
        $rolConta = DB::table('roles')->where('nombre', 'Contabilidad')->first();
        if ($rolConta) {
            DB::table('usuarios')
                ->where('correo', 'regente.scz@fralak.com.bo')
                ->update(['rol_id' => $rolConta->id]);
        }
    }
};
