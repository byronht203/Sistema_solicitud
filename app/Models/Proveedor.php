<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Proveedor extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'proveedores';

    protected $fillable = [
        'creado_por_usuario_id',
        'nombre_razon_social',
        'nit_ci',
        'banco',
        'tipo_cuenta',
        'numero_cuenta',
        'nombre_titular_cuenta',
    ];

    public function creador()
    {
        return $this->belongsTo(User::class, 'creado_por_usuario_id');
    }

    public function solicitudes()
    {
        return $this->hasMany(Solicitud::class, 'proveedor_id');
    }
}
