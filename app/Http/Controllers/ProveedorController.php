<?php

namespace App\Http\Controllers;

use App\Models\Proveedor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProveedorController extends Controller
{
    public function index(Request $request)
    {
        $query = Proveedor::with('creador')->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre_razon_social', 'like', "%{$search}%")
                  ->orWhere('descripcion', 'like', "%{$search}%")
                  ->orWhere('nit_ci', 'like', "%{$search}%")
                  ->orWhere('banco', 'like', "%{$search}%")
                  ->orWhere('numero_cuenta', 'like', "%{$search}%")
                  ->orWhere('nombre_titular_cuenta', 'like', "%{$search}%");
            });
        }

        $proveedores = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Proveedores/Index', [
            'proveedores' => $proveedores,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_razon_social' => 'required|string|max:150',
            'descripcion' => 'nullable|string|max:255',
            'nit_ci' => 'nullable|string|max:50',
            'banco' => 'nullable|string|max:100',
            'tipo_cuenta' => 'nullable|in:Caja de Ahorro,Cuenta Corriente,Otro',
            'numero_cuenta' => 'nullable|string|max:100',
            'nombre_titular_cuenta' => 'nullable|string|max:150',
        ]);

        $validated['creado_por_usuario_id'] = auth()->id();

        $nombre = trim($validated['nombre_razon_social']);
        $nit = !empty($validated['nit_ci']) ? trim($validated['nit_ci']) : null;
        $numCuenta = !empty($validated['numero_cuenta']) ? trim($validated['numero_cuenta']) : null;

        // Evitar duplicados globales en todo el sistema
        $existing = Proveedor::where(function ($q) use ($nombre, $nit, $numCuenta) {
            $q->whereRaw('LOWER(TRIM(nombre_razon_social)) = ?', [strtolower($nombre)]);
            if ($nit) {
                $q->orWhere('nit_ci', $nit);
            }
            if ($numCuenta) {
                $q->orWhere('numero_cuenta', $numCuenta);
            }
        })->first();

        if ($existing) {
            $updateData = array_filter($validated, fn($v) => !is_null($v) && $v !== '');
            $existing->update($updateData);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'proveedor' => $existing,
                    'message' => 'El proveedor ya se encuentra registrado y sus datos fueron actualizados.'
                ]);
            }
            return redirect()->back()->with('success', 'El proveedor ya se encontraba registrado y fue actualizado.');
        }

        $proveedor = Proveedor::create($validated);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'proveedor' => $proveedor, 'message' => 'Proveedor registrado']);
        }

        return redirect()->back()->with('success', 'Proveedor registrado exitosamente.');
    }

    public function update(Request $request, Proveedor $proveedor)
    {
        $validated = $request->validate([
            'nombre_razon_social' => 'required|string|max:150',
            'descripcion' => 'nullable|string|max:255',
            'nit_ci' => 'nullable|string|max:50',
            'banco' => 'nullable|string|max:100',
            'tipo_cuenta' => 'nullable|in:Caja de Ahorro,Cuenta Corriente,Otro',
            'numero_cuenta' => 'nullable|string|max:100',
            'nombre_titular_cuenta' => 'nullable|string|max:150',
        ]);

        $proveedor->update($validated);

        return redirect()->back()->with('success', 'Proveedor actualizado correctamente.');
    }

    public function destroy(Proveedor $proveedor)
    {
        $proveedor->delete();
        return redirect()->back()->with('success', 'Proveedor eliminado correctamente.');
    }
}
