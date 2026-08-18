<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitudes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('restrict');
            $table->foreignId('solicitante_id')->constrained('usuarios')->onDelete('restrict');
            $table->foreignId('proveedor_id')->constrained('proveedores')->onDelete('restrict');
            
            $table->text('motivo_descripcion');
            $table->decimal('monto', 10, 2);
            $table->enum('moneda', ['BOB', 'USD'])->default('BOB');
            
            $table->enum('tipo_documento', ['Factura', 'Recibo', 'Contrato', 'Otro']);
            $table->boolean('emite_factura')->default(false);
            $table->enum('modalidad_pago', ['Transferencia', 'Cheque', 'Efectivo', 'QR']);
            $table->string('archivo_respaldo_path', 255)->nullable();
            
            $table->enum('estado', ['Pendiente', 'Observado', 'Aprobado_Jefatura', 'Pagado', 'Rechazado'])->default('Pendiente');
            $table->text('comentarios_revision')->nullable();
            
            $table->foreignId('revisado_por_jefe_id')->nullable()->constrained('usuarios')->onDelete('set null');
            $table->foreignId('procesado_por_conta_id')->nullable()->constrained('usuarios')->onDelete('set null');
            $table->date('fecha_solicitud');
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes');
    }
};
