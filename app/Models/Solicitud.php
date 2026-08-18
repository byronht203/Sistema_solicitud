<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Solicitud extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'solicitudes';

    protected $fillable = [
        'empresa_id',
        'solicitante_id',
        'tipo_solicitud',
        'jefe_id',
        'contabilidad_id',
        'proveedor_id',
        'motivo_descripcion',
        'monto',
        'moneda',
        'tipo_documento',
        'emite_factura',
        'modalidad_pago',
        'archivo_respaldo_path',
        'estado',
        'comentarios_revision',
        'revisado_por_jefe_id',
        'procesado_por_conta_id',
        'fecha_solicitud',
    ];

    protected $casts = [
        'emite_factura' => 'boolean',
        'monto' => 'decimal:2',
        'fecha_solicitud' => 'date:Y-m-d',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitante_id');
    }

    public function jefe()
    {
        return $this->belongsTo(User::class, 'jefe_id');
    }

    public function contabilidad()
    {
        return $this->belongsTo(User::class, 'contabilidad_id');
    }

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'proveedor_id');
    }

    public function revisadoPorJefe()
    {
        return $this->belongsTo(User::class, 'revisado_por_jefe_id');
    }

    public function procesadoPorConta()
    {
        return $this->belongsTo(User::class, 'procesado_por_conta_id');
    }
}
