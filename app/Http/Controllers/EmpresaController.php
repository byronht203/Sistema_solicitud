<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmpresaController extends Controller
{
    public function index(Request $request)
    {
        $query = Empresa::withCount('solicitudes')->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('nombre', 'like', "%{$search}%")
                  ->orWhere('nit', 'like', "%{$search}%");
        }

        $empresas = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Empresas/Index', [
            'empresas' => $empresas,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'nit' => 'nullable|string|max:50',
        ]);

        Empresa::create($validated);

        return redirect()->back()->with('success', 'Empresa registrada correctamente.');
    }

    public function update(Request $request, Empresa $empresa)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'nit' => 'nullable|string|max:50',
        ]);

        $empresa->update($validated);

        return redirect()->back()->with('success', 'Empresa actualizada correctamente.');
    }

    public function destroy(Empresa $empresa)
    {
        $empresa->delete();
        return redirect()->back()->with('success', 'Empresa eliminada correctamente.');
    }
}
