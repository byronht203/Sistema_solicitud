<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $table = 'usuarios';

    protected $fillable = [
        'rol_id',
        'nombre',
        'apellidos',
        'ci',
        'cargo',
        'direccion',
        'telefono',
        'correo',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];

    protected $appends = ['nombre_completo'];

    public function rol()
    {
        return $this->belongsTo(Role::class, 'rol_id');
    }

    public function empresas()
    {
        return $this->belongsToMany(Empresa::class, 'usuario_empresa', 'usuario_id', 'empresa_id')
                    ->withPivot('correo_corporativo')
                    ->withTimestamps();
    }

    /**
     * Obtiene el correo corporativo del usuario para una empresa específica.
     * Si no tiene uno asignado para esa empresa, usa en orden:
     * 1. Un correo corporativo de otra empresa asignada.
     * 2. El correo principal de login/usuario.
     */
    public function getCorreoCorporativoParaEmpresa($empresaId)
    {
        if ($empresaId) {
            $pivot = $this->empresas()->where('empresa_id', $empresaId)->first();
            if ($pivot && !empty($pivot->pivot->correo_corporativo)) {
                return $pivot->pivot->correo_corporativo;
            }
        }

        // Fallback 1: Si no tiene para esa empresa específica, usar cualquier otro correo corporativo que tenga registrado
        $otraEmpresa = $this->empresas()
            ->whereNotNull('usuario_empresa.correo_corporativo')
            ->where('usuario_empresa.correo_corporativo', '!=', '')
            ->first();

        if ($otraEmpresa && !empty($otraEmpresa->pivot->correo_corporativo)) {
            return $otraEmpresa->pivot->correo_corporativo;
        }

        // Fallback 2: Retornar correo principal de la cuenta
        return $this->correo;
    }

    public function solicitudes()
    {
        return $this->hasMany(Solicitud::class, 'solicitante_id');
    }

    public function proveedoresCreados()
    {
        return $this->hasMany(Proveedor::class, 'creado_por_usuario_id');
    }

    public function getNombreCompletoAttribute()
    {
        return trim("{$this->nombre} {$this->apellidos}");
    }

    public function esAdmin()
    {
        return $this->rol && in_array(strtolower($this->rol->nombre), ['administrador', 'admin']);
    }

    public function esJefe()
    {
        return $this->rol && in_array(strtolower($this->rol->nombre), ['jefe', 'jefatura']);
    }

    public function esContabilidad()
    {
        return $this->rol && in_array(strtolower($this->rol->nombre), ['contabilidad', 'conta']);
    }

    public function esSolicitante()
    {
        return $this->rol && in_array(strtolower($this->rol->nombre), ['solicitante', 'empleado']);
    }
}
