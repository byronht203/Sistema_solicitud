<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['rol', 'empresas'])->orderBy('id', 'desc');

        if ($request->filled('rol_id')) {
            $query->where('rol_id', $request->rol_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellidos', 'like', "%{$search}%")
                  ->orWhere('correo', 'like', "%{$search}%")
                  ->orWhere('cargo', 'like', "%{$search}%");
            });
        }

        $usuarios = $query->paginate(10)->withQueryString();
        $roles = Role::all();
        $empresas = Empresa::all();

        return Inertia::render('Admin/Usuarios/Index', [
            'usuarios' => $usuarios,
            'roles' => $roles,
            'empresas' => $empresas,
            'filters' => $request->only(['rol_id', 'search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'rol_id' => 'required|exists:roles,id',
            'nombre' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'cargo' => 'nullable|string|max:100',
            'correo' => 'required|email|max:150|unique:usuarios,correo',
            'password' => 'required|string|min:6',
            'correos_empresas' => 'nullable|array',
            'correos_empresas.*' => 'nullable|email|max:150',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $correosEmpresas = $validated['correos_empresas'] ?? [];
        unset($validated['correos_empresas']);

        $user = User::create($validated);

        // Guardar correos corporativos por empresa en la tabla pivote usuario_empresa
        if (!empty($correosEmpresas)) {
            $syncData = [];
            foreach ($correosEmpresas as $empresaId => $correoCorp) {
                if (!empty($correoCorp)) {
                    $syncData[$empresaId] = ['correo_corporativo' => $correoCorp];
                }
            }
            if (!empty($syncData)) {
                $user->empresas()->sync($syncData);
            }
        }

        return redirect()->back()->with('success', 'Usuario registrado exitosamente con sus credenciales y correos corporativos.');
    }

    public function update(Request $request, User $usuario)
    {
        $validated = $request->validate([
            'rol_id' => 'required|exists:roles,id',
            'nombre' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'cargo' => 'nullable|string|max:100',
            'correo' => ['required', 'email', 'max:150', Rule::unique('usuarios', 'correo')->ignore($usuario->id)],
            'password' => 'nullable|string|min:6',
            'correos_empresas' => 'nullable|array',
            'correos_empresas.*' => 'nullable|email|max:150',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $correosEmpresas = $validated['correos_empresas'] ?? [];
        unset($validated['correos_empresas']);

        $usuario->update($validated);

        // Actualizar correos corporativos en tabla pivote
        if (is_array($correosEmpresas)) {
            $syncData = [];
            foreach ($correosEmpresas as $empresaId => $correoCorp) {
                if (!empty($correoCorp)) {
                    $syncData[$empresaId] = ['correo_corporativo' => $correoCorp];
                }
            }
            $usuario->empresas()->sync($syncData);
        }

        return redirect()->back()->with('success', 'Usuario y correos corporativos actualizados correctamente.');
    }

    public function destroy(User $usuario)
    {
        if ($usuario->id === auth()->id()) {
            return redirect()->back()->with('error', 'No puedes eliminar tu propio usuario en sesión.');
        }

        $usuario->delete();
        return redirect()->back()->with('success', 'Usuario eliminado correctamente.');
    }
}
