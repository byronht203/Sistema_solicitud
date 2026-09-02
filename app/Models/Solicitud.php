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
        'jefe_ids',
        'contabilidad_id',
        'contabilidad_ids',
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
        'contabilidad_ids' => 'array',
        'jefe_ids' => 'array',
    ];

    protected $appends = ['contabilidades_asignadas', 'jefes_asignados'];

    public function getJefesAsignadosAttribute()
    {
        $ids = [];
        if (!empty($this->jefe_ids) && is_array($this->jefe_ids)) {
            $ids = array_merge($ids, $this->jefe_ids);
        }
        if (!empty($this->jefe_id)) {
            $ids[] = $this->jefe_id;
        }
        $ids = array_values(array_unique(array_filter($ids)));
        if (empty($ids)) {
            return [];
        }
        return User::with(['rol', 'empresas'])->whereIn('id', $ids)->get();
    }

    public function getContabilidadesAsignadasAttribute()
    {
        $ids = [];
        if (!empty($this->contabilidad_ids) && is_array($this->contabilidad_ids)) {
            $ids = array_merge($ids, $this->contabilidad_ids);
        }
        if (!empty($this->contabilidad_id)) {
            $ids[] = $this->contabilidad_id;
        }
        $ids = array_values(array_unique(array_filter($ids)));
        if (empty($ids)) {
            return [];
        }
        return User::with(['rol', 'empresas'])->whereIn('id', $ids)->get();
    }

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
