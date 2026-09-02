<?php

namespace App\Http\Controllers;

use App\Models\Solicitud;
use App\Models\Proveedor;
use App\Models\Empresa;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SolicitanteController extends Controller
{
    /**
     * Helper para obtener el Query base del Solicitante (o todas si es Admin)
     */
    private function getSolicitanteQuery()
    {
        $user = auth()->user();
        if ($user && $user->esAdmin()) {
            return Solicitud::query();
        }
        return Solicitud::where('solicitante_id', $user ? $user->id : 0);
    }

    /**
     * Dashboard específico para el Solicitante / Ejecutivo
     */
    public function dashboard()
    {
        $baseQuery = $this->getSolicitanteQuery();

        // 1. Métricas del solicitante (o globales si es Admin)
        $misSolicitudesCount = (clone $baseQuery)->count();
        $pendientesCount = (clone $baseQuery)->where('estado', 'Pendiente')->count();
        $aprobadasJefeCount = (clone $baseQuery)->where('estado', 'Aprobado_Jefatura')->count();
        $pagadasCount = (clone $baseQuery)->where('estado', 'Pagado')->count();
        $observadasCount = (clone $baseQuery)->where('estado', 'Observado')->count();
        $rechazadasCount = (clone $baseQuery)->where('estado', 'Rechazado')->count();

        // 2. Montos solicitados por el usuario
        $montoSolicitadoBOB = (clone $baseQuery)
            ->where('moneda', 'BOB')
            ->whereNotIn('estado', ['Rechazado'])
            ->sum('monto');

        $montoSolicitadoUSD = (clone $baseQuery)
            ->where('moneda', 'USD')
            ->whereNotIn('estado', ['Rechazado'])
            ->sum('monto');

        // 3. Solicitudes recientes
        $solicitudesRecientes = (clone $baseQuery)->with(['empresa', 'jefe', 'proveedor', 'revisadoPorJefe', 'procesadoPorConta'])
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get();

        $empresas = Empresa::all();
        $proveedores = Proveedor::orderBy('nombre_razon_social')->get();
        $jefes = User::with('empresas')->whereHas('rol', function ($q) {
            $q->whereIn('nombre', ['Jefe', 'Jefatura']);
        })->get();
        $contabilidades = User::with(['rol', 'empresas'])->whereHas('rol', function ($q) {
            $q->whereIn('nombre', ['Contabilidad', 'Conta', 'Caja Chica', 'Cajachica', 'Contabilidad - Caja Chica', 'Contabilidad-Caja Chica']);
        })->get();

        return Inertia::render('Solicitante/Dashboard', [
            'stats' => [
                'misSolicitudesCount' => $misSolicitudesCount,
                'pendientesCount' => $pendientesCount,
                'aprobadasJefeCount' => $aprobadasJefeCount,
                'pagadasCount' => $pagadasCount,
                'observadasCount' => $observadasCount,
                'rechazadasCount' => $rechazadasCount,
                'montoSolicitadoBOB' => (float)$montoSolicitadoBOB,
                'montoSolicitadoUSD' => (float)$montoSolicitadoUSD,
            ],
            'solicitudesRecientes' => $solicitudesRecientes,
            'empresas' => $empresas,
            'proveedores' => $proveedores,
            'jefes' => $jefes,
            'contabilidades' => $contabilidades,
        ]);
    }

    /**
     * Listado y gestión de mis solicitudes de pago
     */
    public function solicitudes(Request $request)
    {
        $baseQuery = $this->getSolicitanteQuery();
        $query = (clone $baseQuery)->with(['empresa', 'solicitante', 'jefe', 'proveedor', 'revisadoPorJefe', 'procesadoPorConta'])
            ->orderBy('id', 'desc');

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('empresa_id')) {
            $query->where('empresa_id', $request->empresa_id);
        }

        if ($request->filled('moneda')) {
            $query->where('moneda', $request->moneda);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('motivo_descripcion', 'like', "%{$search}%")
                  ->orWhereHas('proveedor', function ($pq) use ($search) {
                      $pq->where('nombre_razon_social', 'like', "%{$search}%");
                  });
            });
        }

        $solicitudes = $query->paginate(10)->withQueryString();
        $empresas = Empresa::all();
        $proveedores = Proveedor::orderBy('nombre_razon_social')->get();
        $jefes = User::with('empresas')->whereHas('rol', function ($q) {
            $q->whereIn('nombre', ['Jefe', 'Jefatura']);
        })->get();
        $contabilidades = User::with(['rol', 'empresas'])->whereHas('rol', function ($q) {
            $q->whereIn('nombre', ['Contabilidad', 'Conta', 'Caja Chica', 'Cajachica', 'Contabilidad - Caja Chica', 'Contabilidad-Caja Chica']);
        })->get();

        // Conteo de observadas que requieren acción del solicitante
        $badgeObservadas = (clone $baseQuery)->where('estado', 'Observado')->count();

        return Inertia::render('Solicitante/Solicitudes/Index', [
            'solicitudes' => $solicitudes,
            'empresas' => $empresas,
            'proveedores' => $proveedores,
            'jefes' => $jefes,
            'contabilidades' => $contabilidades,
            'badgeObservadas' => $badgeObservadas,
            'filters' => $request->only(['estado', 'empresa_id', 'moneda', 'search']),
        ]);
    }

    /**
     * Crear una nueva solicitud de pago
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'tipo_solicitud' => 'nullable|string|max:50',
            'jefe_id' => 'nullable|exists:usuarios,id',
            'jefe_ids' => 'nullable|array',
            'jefe_ids.*' => 'exists:usuarios,id',
            'contabilidad_id' => 'nullable|exists:usuarios,id',
            'contabilidad_ids' => 'nullable|array',
            'contabilidad_ids.*' => 'exists:usuarios,id',
            'proveedor_id' => 'required|exists:proveedores,id',
            'motivo_descripcion' => 'required|string|min:5',
            'monto' => 'required|numeric|min:0.01',
            'moneda' => 'required|in:BOB,USD',
            'tipo_documento' => 'required|in:Factura,Recibo,Contrato,Otro',
            'emite_factura' => 'required|boolean',
            'modalidad_pago' => 'required|in:Transferencia,Cheque,Efectivo,QR',
            'fecha_solicitud' => 'required|date',
            'archivo_respaldo' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $filePath = null;
        if ($request->hasFile('archivo_respaldo')) {
            $filePath = $request->file('archivo_respaldo')->store('respaldos', 'public');
        }

        $jefeIds = $request->input('jefe_ids', []);
        if (empty($jefeIds) && !empty($validated['jefe_id'])) {
            $jefeIds = [(int)$validated['jefe_id']];
        }
        $primaryJefeId = !empty($jefeIds) ? $jefeIds[0] : ($validated['jefe_id'] ?? null);

        $contaIds = $request->input('contabilidad_ids', []);
        if (empty($contaIds) && !empty($validated['contabilidad_id'])) {
            $contaIds = [(int)$validated['contabilidad_id']];
        }
        $primaryContaId = !empty($contaIds) ? $contaIds[0] : ($validated['contabilidad_id'] ?? null);

        $isCajaChica = ($validated['moneda'] === 'BOB' && (float)$validated['monto'] > 0 && (float)$validated['monto'] <= 300);
        $tipoSolCalculado = $isCajaChica ? 'Caja Chica' : ($validated['tipo_solicitud'] ?? 'Pago a Proveedor');

        $solicitud = Solicitud::create([
            'empresa_id' => $validated['empresa_id'],
            'solicitante_id' => auth()->id(),
            'tipo_solicitud' => $tipoSolCalculado,
            'jefe_id' => $primaryJefeId,
            'jefe_ids' => !empty($jefeIds) ? $jefeIds : null,
            'contabilidad_id' => $primaryContaId,
            'contabilidad_ids' => !empty($contaIds) ? $contaIds : null,
            'proveedor_id' => $validated['proveedor_id'],
            'motivo_descripcion' => $validated['motivo_descripcion'],
            'monto' => $validated['monto'],
            'moneda' => $validated['moneda'],
            'tipo_documento' => $validated['tipo_documento'],
            'emite_factura' => $validated['emite_factura'],
            'modalidad_pago' => $validated['modalidad_pago'],
            'fecha_solicitud' => $validated['fecha_solicitud'],
            'archivo_respaldo_path' => $filePath,
            'estado' => 'Pendiente',
        ]);

        \App\Mail\SolicitudNuevaMail::notificarJefatura($solicitud);

        return redirect()->back()->with('success', '¡Solicitud registrada exitosamente! Ha ingresado a revisión por tu jefatura.');
    }

    /**
     * Actualizar / Subsanar una solicitud (Especialmente si fue Observada)
     */
    public function update(Request $request, Solicitud $solicitud)
    {
        $validated = $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'tipo_solicitud' => 'nullable|string|max:50',
            'jefe_id' => 'nullable|exists:usuarios,id',
            'jefe_ids' => 'nullable|array',
            'jefe_ids.*' => 'exists:usuarios,id',
            'contabilidad_id' => 'nullable|exists:usuarios,id',
            'contabilidad_ids' => 'nullable|array',
            'contabilidad_ids.*' => 'exists:usuarios,id',
            'proveedor_id' => 'required|exists:proveedores,id',
            'motivo_descripcion' => 'required|string|min:5',
            'monto' => 'required|numeric|min:0.01',
            'moneda' => 'required|in:BOB,USD',
            'tipo_documento' => 'required|in:Factura,Recibo,Contrato,Otro',
            'emite_factura' => 'required|boolean',
            'modalidad_pago' => 'required|in:Transferencia,Cheque,Efectivo,QR',
            'fecha_solicitud' => 'required|date',
            'archivo_respaldo' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($request->hasFile('archivo_respaldo')) {
            if ($solicitud->archivo_respaldo_path) {
                Storage::disk('public')->delete($solicitud->archivo_respaldo_path);
            }
            $validated['archivo_respaldo_path'] = $request->file('archivo_respaldo')->store('respaldos', 'public');
        }

        $jefeIds = $request->input('jefe_ids', []);
        if (empty($jefeIds) && !empty($validated['jefe_id'])) {
            $jefeIds = [(int)$validated['jefe_id']];
        }
        $validated['jefe_id'] = !empty($jefeIds) ? $jefeIds[0] : ($validated['jefe_id'] ?? null);
        $validated['jefe_ids'] = !empty($jefeIds) ? $jefeIds : null;

        $contaIds = $request->input('contabilidad_ids', []);
        if (empty($contaIds) && !empty($validated['contabilidad_id'])) {
            $contaIds = [(int)$validated['contabilidad_id']];
        }
        $validated['contabilidad_id'] = !empty($contaIds) ? $contaIds[0] : ($validated['contabilidad_id'] ?? null);
        $validated['contabilidad_ids'] = !empty($contaIds) ? $contaIds : null;

        $isCajaChica = ($validated['moneda'] === 'BOB' && (float)$validated['monto'] > 0 && (float)$validated['monto'] <= 300);
        $validated['tipo_solicitud'] = $isCajaChica ? 'Caja Chica' : ($validated['tipo_solicitud'] ?? 'Pago a Proveedor');

        // Si estaba observada, al editarla el solicitante se re-envía a revisión en estado Pendiente
        if ($solicitud->estado === 'Observado') {
            $validated['estado'] = 'Pendiente';
            $validated['comentarios_revision'] = 'Subsanado por el solicitante: ' . now()->format('Y-m-d H:i');
        }

        $solicitud->update($validated);

        if ($solicitud->estado === 'Pendiente') {
            \App\Mail\SolicitudNuevaMail::notificarJefatura($solicitud);
        }

        return redirect()->back()->with('success', 'Solicitud actualizada correctamente y re-enviada a revisión.');
    }

    /**
     * Cancelar / Eliminar una solicitud (Solo si está en estado Pendiente)
     */
    public function destroy(Solicitud $solicitud)
    {
        if ($solicitud->estado !== 'Pendiente') {
            return redirect()->back()->with('error', 'Solo se pueden eliminar solicitudes en estado Pendiente.');
        }

        $solicitud->delete();
        return redirect()->back()->with('success', 'Solicitud cancelada y eliminada correctamente.');
    }

    /**
     * Catálogo de Proveedores para el Solicitante
     */
    public function proveedores(Request $request)
    {
        $query = Proveedor::with('creador')->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre_razon_social', 'like', "%{$search}%")
                  ->orWhere('nit_ci', 'like', "%{$search}%")
                  ->orWhere('banco', 'like', "%{$search}%")
                  ->orWhere('numero_cuenta', 'like', "%{$search}%")
                  ->orWhere('nombre_titular_cuenta', 'like', "%{$search}%");
            });
        }

        $proveedores = $query->paginate(12)->withQueryString();

        return Inertia::render('Solicitante/Proveedores/Index', [
            'proveedores' => $proveedores,
            'filters' => $request->only(['search']),
        ]);
    }
}
