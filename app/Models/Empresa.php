<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Empresa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'empresas';

    protected $fillable = [
        'nombre',
        'nit',
    ];

    public function solicitudes()
    {
        return $this->hasMany(Solicitud::class, 'empresa_id');
    }

    public function usuarios()
    {
        return $this->belongsToMany(User::class, 'usuario_empresa', 'empresa_id', 'usuario_id')
                    ->withPivot('correo_corporativo')
                    ->withTimestamps();
    }
}
