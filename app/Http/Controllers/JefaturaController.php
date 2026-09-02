<?php

namespace App\Http\Controllers;

use App\Models\Solicitud;
use App\Models\Proveedor;
use App\Models\Empresa;
use App\Models\User;
use App\Mail\SolicitudEstadoMail;
use App\Mail\SolicitudNuevaMail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class JefaturaController extends Controller
{
    /**
     * Helper para obtener el Query base filtrado por el Jefe autenticado
     */
    private function getJefaturaQuery()
    {
        $jefeUser = auth()->user();
        if ($jefeUser && $jefeUser->esAdmin()) {
            return Solicitud::query();
        }

        $jefeId = $jefeUser ? $jefeUser->id : 0;
        $empresaIds = $jefeUser ? $jefeUser->empresas()->pluck('empresas.id')->toArray() : [];

        return Solicitud::where(function ($q) use ($jefeId, $empresaIds) {
            $q->where('jefe_id', $jefeId)
              ->orWhereJsonContains('jefe_ids', (int)$jefeId)
              ->orWhereJsonContains('jefe_ids', (string)$jefeId)
              ->orWhere('revisado_por_jefe_id', $jefeId)
              ->orWhere('solicitante_id', $jefeId);

            if (!empty($empresaIds)) {
                $q->orWhere(function ($subQ) use ($empresaIds) {
                    $subQ->whereNull('jefe_id')
                         ->whereIn('empresa_id', $empresaIds);
                });
            }
        });
    }

    /**
     * Dashboard específico para Jefatura y Aprobaciones
     */
    public function dashboard()
    {
        $jefeUser = auth()->user();
        $jefeId = $jefeUser ? $jefeUser->id : 0;
        $baseQuery = $this->getJefaturaQuery();

        // 1. Solicitudes por aprobar (creadas por su equipo de solicitantes)
        $pendientesCount = (clone $baseQuery)->where('estado', 'Pendiente')
            ->where('solicitante_id', '!=', $jefeId)
            ->count();

        // 2. Solicitudes creadas por el propio Jefe
        $misSolicitudesCount = Solicitud::where('solicitante_id', $jefeId)->count();
        $misPendientesPagoCount = Solicitud::where('solicitante_id', $jefeId)->where('estado', 'Aprobado_Jefatura')->count();
        $misPagadasCount = Solicitud::where('solicitante_id', $jefeId)->where('estado', 'Pagado')->count();
        $misObservadasCount = Solicitud::where('solicitante_id', $jefeId)->where('estado', 'Observado')->count();

        // 3. Montos pendientes de aprobación de equipo
        $montoPendienteBOB = (clone $baseQuery)->where('estado', 'Pendiente')
            ->where('solicitante_id', '!=', $jefeId)
            ->where('moneda', 'BOB')
            ->sum('monto');

        $montoPendienteUSD = (clone $baseQuery)->where('estado', 'Pendiente')
            ->where('solicitante_id', '!=', $jefeId)
            ->where('moneda', 'USD')
            ->sum('monto');

        // 4. Montos ya aprobados por jefatura
        $montoAprobadoBOB = (clone $baseQuery)->whereIn('estado', ['Aprobado_Jefatura', 'Pagado'])
            ->where('moneda', 'BOB')
            ->sum('monto');

        $montoAprobadoUSD = (clone $baseQuery)->whereIn('estado', ['Aprobado_Jefatura', 'Pagado'])
            ->where('moneda', 'USD')
            ->sum('monto');

        // 5. Solicitudes prioritarias de equipo pendientes de aprobación (Estado: Pendiente)
        $solicitudesPorAprobar = (clone $baseQuery)->with(['empresa', 'solicitante', 'jefe', 'contabilidad', 'proveedor'])
            ->where('estado', 'Pendiente')
            ->where('solicitante_id', '!=', $jefeId)
            ->orderBy('fecha_solicitud', 'asc')
            ->take(8)
            ->get();

        // 6. Mis Solicitudes realizadas recientemente por este Jefe
        $misSolicitudesRecientes = Solicitud::with(['empresa', 'contabilidad', 'proveedor', 'procesadoPorConta'])
            ->where('solicitante_id', $jefeId)
            ->orderBy('id', 'desc')
            ->take(6)
            ->get();

        // 7. Últimas revisiones hechas por el jefe a solicitudes de terceros
        $ultimasRevisiones = (clone $baseQuery)->with(['empresa', 'solicitante', 'jefe', 'proveedor', 'revisadoPorJefe'])
            ->where('solicitante_id', '!=', $jefeId)
            ->whereIn('estado', ['Aprobado_Jefatura', 'Observado', 'Rechazado'])
            ->orderBy('updated_at', 'desc')
            ->take(6)
            ->get();

        $empresas = Empresa::all();
        $proveedores = Proveedor::orderBy('nombre_razon_social')->get();
        $contabilidades = User::with(['rol', 'empresas'])->whereHas('rol', function ($q) {
            $q->whereIn('nombre', ['Contabilidad', 'Conta', 'Caja Chica', 'Cajachica', 'Contabilidad - Caja Chica', 'Contabilidad-Caja Chica']);
        })->get();
        $jefes = User::with(['rol', 'empresas'])->whereHas('rol', function ($q) {
            $q->whereIn('nombre', ['Jefe', 'Jefatura', 'Gerente', 'Gerencia']);
        })->get();

        return Inertia::render('Jefatura/Dashboard', [
            'stats' => [
                'pendientesCount' => $pendientesCount,
                'misSolicitudesCount' => $misSolicitudesCount,
                'misPendientesPagoCount' => $misPendientesPagoCount,
                'misPagadasCount' => $misPagadasCount,
                'misObservadasCount' => $misObservadasCount,
                'montoPendienteBOB' => (float)$montoPendienteBOB,
                'montoPendienteUSD' => (float)$montoPendienteUSD,
                'montoAprobadoBOB' => (float)$montoAprobadoBOB,
                'montoAprobadoUSD' => (float)$montoAprobadoUSD,
                'totalProveedores' => Proveedor::count(),
            ],
            'solicitudesPorAprobar' => $solicitudesPorAprobar,
            'misSolicitudesRecientes' => $misSolicitudesRecientes,
            'ultimasRevisiones' => $ultimasRevisiones,
            'empresas' => $empresas,
            'proveedores' => $proveedores,
            'contabilidades' => $contabilidades,
            'jefes' => $jefes,
        ]);
    }

    /**
     * Bandeja de Aprobaciones: Exclusivamente solicitudes enviadas por el equipo que requieren revisión del Jefe
     */
    public function solicitudes(Request $request)
    {
        $jefeUser = auth()->user();
        $jefeId = $jefeUser ? $jefeUser->id : 0;
        $estadoFiltro = $request->get('estado', 'Pendiente');

        $query = $this->getJefaturaQuery()
            ->where('solicitante_id', '!=', $jefeId)
            ->with(['empresa', 'solicitante', 'jefe', 'contabilidad', 'proveedor', 'revisadoPorJefe', 'procesadoPorConta'])
            ->orderBy('id', 'desc');

        if ($estadoFiltro !== 'todas') {
            $query->where('estado', $estadoFiltro);
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
                  ->orWhereHas('solicitante', function ($sq) use ($search) {
                      $sq->where('nombre', 'like', "%{$search}%")
                        ->orWhere('apellidos', 'like', "%{$search}%");
                  })
                  ->orWhereHas('proveedor', function ($pq) use ($search) {
                      $pq->where('nombre_razon_social', 'like', "%{$search}%")
                        ->orWhere('nit_ci', 'like', "%{$search}%");
                  });
            });
        }

        $solicitudes = $query->paginate(12)->withQueryString();
        $empresas = Empresa::all();
        $proveedores = Proveedor::all();

        // Conteo de badges para aprobaciones de equipo
        $baseTeamQuery = (clone $this->getJefaturaQuery())->where('solicitante_id', '!=', $jefeId);
        $badgePorAprobar = (clone $baseTeamQuery)->where('estado', 'Pendiente')->count();
        $badgeAprobadas = (clone $baseTeamQuery)->where('estado', 'Aprobado_Jefatura')->count();
        $badgeObservadas = (clone $baseTeamQuery)->where('estado', 'Observado')->count();
        $badgeMisSolicitudes = Solicitud::where('solicitante_id', $jefeId)->count();

        return Inertia::render('Jefatura/Solicitudes/Index', [
            'solicitudes' => $solicitudes,
            'empresas' => $empresas,
            'proveedores' => $proveedores,
            'badgePorAprobar' => $badgePorAprobar,
            'badgeAprobadas' => $badgeAprobadas,
            'badgeObservadas' => $badgeObservadas,
            'badgeMisSolicitudes' => $badgeMisSolicitudes,
            'activeEstado' => $estadoFiltro,
            'filters' => $request->only(['estado', 'empresa_id', 'moneda', 'search']),
        ]);
    }

    /**
     * Bandeja de Mis Solicitudes: Exclusivamente las solicitudes creadas directamente por este Jefe
     */
    public function misSolicitudes(Request $request)
    {
        $jefeUser = auth()->user();
        $jefeId = $jefeUser ? $jefeUser->id : 0;
        $estadoFiltro = $request->get('estado', 'todas');

        $query = Solicitud::where('solicitante_id', $jefeId)
            ->with(['empresa', 'solicitante', 'jefe', 'contabilidad', 'proveedor', 'revisadoPorJefe', 'procesadoPorConta'])
            ->orderBy('id', 'desc');

        if ($estadoFiltro !== 'todas') {
            $query->where('estado', $estadoFiltro);
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
                      $pq->where('nombre_razon_social', 'like', "%{$search}%")
                        ->orWhere('nit_ci', 'like', "%{$search}%");
                  });
            });
        }

        $solicitudes = $query->paginate(12)->withQueryString();
        $empresas = Empresa::all();
        $proveedores = Proveedor::orderBy('nombre_razon_social')->get();
        $contabilidades = User::with(['rol', 'empresas'])->whereHas('rol', function ($q) {
            $q->whereIn('nombre', ['Contabilidad', 'Conta', 'Caja Chica', 'Cajachica', 'Contabilidad - Caja Chica', 'Contabilidad-Caja Chica']);
        })->get();
        $jefes = User::with(['rol', 'empresas'])->whereHas('rol', function ($q) {
            $q->whereIn('nombre', ['Jefe', 'Jefatura', 'Gerente', 'Gerencia']);
        })->get();

        // Badges de Mis Solicitudes
        $baseMisQuery = Solicitud::where('solicitante_id', $jefeId);
        $badgeTodas = (clone $baseMisQuery)->count();
        $badgeEnCola = (clone $baseMisQuery)->where('estado', 'Aprobado_Jefatura')->count();
        $badgePagadas = (clone $baseMisQuery)->where('estado', 'Pagado')->count();
        $badgeObservadas = (clone $baseMisQuery)->where('estado', 'Observado')->count();
        $badgePorAprobar = (clone $this->getJefaturaQuery())->where('solicitante_id', '!=', $jefeId)->where('estado', 'Pendiente')->count();

        return Inertia::render('Jefatura/MisSolicitudes/Index', [
            'solicitudes' => $solicitudes,
            'empresas' => $empresas,
            'proveedores' => $proveedores,
            'contabilidades' => $contabilidades,
            'jefes' => $jefes,
            'badgeTodas' => $badgeTodas,
            'badgeEnCola' => $badgeEnCola,
            'badgePagadas' => $badgePagadas,
            'badgeObservadas' => $badgeObservadas,
            'badgePorAprobar' => $badgePorAprobar,
            'activeEstado' => $estadoFiltro,
            'filters' => $request->only(['estado', 'empresa_id', 'moneda', 'search']),
        ]);
    }

    /**
     * Crear una solicitud emitida directamente por el Jefe (Caja Chica o Regular)
     */
    public function storeSolicitud(Request $request)
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

        $jefeUser = auth()->user();

        // Jefes aprobadores seleccionados (para Eduardo / solicitudes que requieren visto bueno de Gerencia)
        $jefeIds = $request->input('jefe_ids', []);
        if (empty($jefeIds) && !empty($validated['jefe_id'])) {
            $jefeIds = [(int)$validated['jefe_id']];
        }
        $primaryJefeId = !empty($jefeIds) ? $jefeIds[0] : ($validated['jefe_id'] ?? null);

        // Si el usuario es Eduardo o seleccionó a otro aprobador (Gerente):
        $requiereAprobacionGerente = !empty($primaryJefeId) && $primaryJefeId != $jefeUser->id;
        $estadoInicial = $requiereAprobacionGerente ? 'Pendiente' : 'Aprobado_Jefatura';
        $comentarioInicial = $requiereAprobacionGerente 
            ? 'Solicitud emitida por ' . $jefeUser->nombre_completo . ' (' . ($jefeUser->cargo ?: 'Auditoría') . '). En espera de visto bueno y aprobación de Gerencia.'
            : 'Solicitud emitida y aprobada directamente por Jefatura (' . $jefeUser->nombre_completo . '). Lista para desembolso contable.';

        $contaIds = $request->input('contabilidad_ids', []);
        if (empty($contaIds) && !empty($validated['contabilidad_id'])) {
            $contaIds = [(int)$validated['contabilidad_id']];
        }
        $primaryContaId = !empty($contaIds) ? $contaIds[0] : ($validated['contabilidad_id'] ?? null);

        $isCajaChica = ($validated['moneda'] === 'BOB' && (float)$validated['monto'] > 0 && (float)$validated['monto'] <= 300);
        $tipoSolCalculado = $isCajaChica ? 'Caja Chica' : ($validated['tipo_solicitud'] ?? 'Pago a Proveedor');

        $solicitud = Solicitud::create([
            'empresa_id' => $validated['empresa_id'],
            'solicitante_id' => $jefeUser->id,
            'tipo_solicitud' => $tipoSolCalculado,
            'jefe_id' => $primaryJefeId ?: $jefeUser->id,
            'jefe_ids' => !empty($jefeIds) ? $jefeIds : [$primaryJefeId ?: $jefeUser->id],
            'revisado_por_jefe_id' => $requiereAprobacionGerente ? null : $jefeUser->id,
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
            'estado' => $estadoInicial,
            'comentarios_revision' => $comentarioInicial,
        ]);

        if ($requiereAprobacionGerente) {
            SolicitudNuevaMail::notificarJefatura($solicitud);
            $msgSuccess = '¡Solicitud registrada con éxito! Ha sido enviada para su correspondiente revisión y aprobación.';
        } else {
            SolicitudEstadoMail::notificarCambioEstado($solicitud);
            $msgSuccess = '¡Solicitud registrada y autorizada con éxito! Ha sido enviada directamente a Contabilidad para su desembolso.';
        }

        return redirect()->back()->with('success', $msgSuccess);
    }

    /**
     * Actualizar / Subsanar una solicitud realizada por el Jefe
     */
    public function updateSolicitud(Request $request, Solicitud $solicitud)
    {
        $jefeUser = auth()->user();
        if ($solicitud->solicitante_id !== $jefeUser->id && !$jefeUser->esAdmin()) {
            return redirect()->back()->with('error', 'No tienes permiso para editar esta solicitud.');
        }

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
        $primaryJefeId = !empty($jefeIds) ? $jefeIds[0] : ($validated['jefe_id'] ?? null);
        if (!empty($primaryJefeId)) {
            $validated['jefe_id'] = $primaryJefeId;
            $validated['jefe_ids'] = $jefeIds;
        }

        $contaIds = $request->input('contabilidad_ids', []);
        if (empty($contaIds) && !empty($validated['contabilidad_id'])) {
            $contaIds = [(int)$validated['contabilidad_id']];
        }
        $validated['contabilidad_id'] = !empty($contaIds) ? $contaIds[0] : ($validated['contabilidad_id'] ?? null);
        $validated['contabilidad_ids'] = !empty($contaIds) ? $contaIds : null;

        $requiereAprobacionGerente = !empty($primaryJefeId) && $primaryJefeId != $jefeUser->id;

        // Si estaba observada, re-enviar según el flujo
        if ($solicitud->estado === 'Observado') {
            $validated['estado'] = $requiereAprobacionGerente ? 'Pendiente' : 'Aprobado_Jefatura';
            $validated['comentarios_revision'] = 'Subsanado y re-enviado: ' . now()->format('Y-m-d H:i');
        }

        $solicitud->update($validated);

        if ($requiereAprobacionGerente) {
            SolicitudNuevaMail::notificarJefatura($solicitud);
        } else {
            SolicitudEstadoMail::notificarCambioEstado($solicitud);
        }

        return redirect()->back()->with('success', 'Solicitud actualizada correctamente.');
    }

    /**
     * Cancelar solicitud realizada por el Jefe
     */
    public function destroySolicitud(Solicitud $solicitud)
    {
        $jefeUser = auth()->user();
        if ($solicitud->solicitante_id !== $jefeUser->id && !$jefeUser->esAdmin()) {
            return redirect()->back()->with('error', 'No tienes permiso para eliminar esta solicitud.');
        }

        if ($solicitud->estado === 'Pagado') {
            return redirect()->back()->with('error', 'No se puede eliminar una solicitud que ya fue pagada.');
        }

        if ($solicitud->archivo_respaldo_path) {
            Storage::disk('public')->delete($solicitud->archivo_respaldo_path);
        }

        $solicitud->delete();
        return redirect()->back()->with('success', 'Solicitud cancelada y eliminada correctamente.');
    }

    /**
     * APROBAR Solicitud de pago de equipo (Cambia estado a Aprobado_Jefatura y notifica por correo)
     */
    public function aprobar(Request $request, Solicitud $solicitud)
    {
        $validated = $request->validate([
            'comentarios_revision' => 'nullable|string|max:500',
        ]);

        $user = auth()->user();

        $solicitud->update([
            'estado' => 'Aprobado_Jefatura',
            'revisado_por_jefe_id' => $user->id,
            'comentarios_revision' => $validated['comentarios_revision'] ?? 'Aprobado por jefatura sin observaciones.',
        ]);

        // Notificar por correo al Solicitante y a Contabilidad
        SolicitudEstadoMail::notificarCambioEstado($solicitud);

        return redirect()->back()->with('success', "La solicitud #{$solicitud->id} ha sido APROBADA y notificada a Contabilidad y al Solicitante por correo.");
    }

    /**
     * OBSERVAR Solicitud (Cambia estado a Observado y notifica por correo)
     */
    public function observar(Request $request, Solicitud $solicitud)
    {
        $validated = $request->validate([
            'comentarios_revision' => 'required|string|min:5|max:500',
        ]);

        $user = auth()->user();

        $solicitud->update([
            'estado' => 'Observado',
            'revisado_por_jefe_id' => $user->id,
            'comentarios_revision' => $validated['comentarios_revision'],
        ]);

        // Notificar por correo al Solicitante
        SolicitudEstadoMail::notificarCambioEstado($solicitud);

        return redirect()->back()->with('success', "La solicitud #{$solicitud->id} ha sido enviada a OBSERVADA y notificada al solicitante por correo.");
    }

    /**
     * RECHAZAR Solicitud (Cambia estado a Rechazado y notifica por correo)
     */
    public function rechazar(Request $request, Solicitud $solicitud)
    {
        $validated = $request->validate([
            'comentarios_revision' => 'required|string|min:5|max:500',
        ]);

        $user = auth()->user();

        $solicitud->update([
            'estado' => 'Rechazado',
            'revisado_por_jefe_id' => $user->id,
            'comentarios_revision' => $validated['comentarios_revision'],
        ]);

        // Notificar por correo al Solicitante
        SolicitudEstadoMail::notificarCambioEstado($solicitud);

        return redirect()->back()->with('success', "La solicitud #{$solicitud->id} ha sido RECHAZADA y notificada al solicitante por correo.");
    }

    /**
     * Vista de catálogo de proveedores para Jefatura
     */
    public function proveedores(Request $request)
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

        $proveedores = $query->paginate(12)->withQueryString();

        return Inertia::render('Jefatura/Proveedores/Index', [
            'proveedores' => $proveedores,
            'filters' => $request->only(['search']),
        ]);
    }
}
