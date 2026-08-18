<?php

namespace App\Http\Controllers;

use App\Models\Solicitud;
use App\Models\Proveedor;
use App\Models\Empresa;
use App\Models\User;
use App\Mail\SolicitudEstadoMail;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JefaturaController extends Controller
{
    /**
     * Helper para obtener el Query base filtrado estrictamente por el Jefe autenticado
     */
    private function getJefaturaQuery()
    {
        $jefeUser = auth()->user();
        if ($jefeUser && $jefeUser->esAdmin()) {
            return Solicitud::query();
        }

        $jefeId = $jefeUser->id;
        $empresaIds = $jefeUser->empresas()->pluck('empresas.id')->toArray();

        return Solicitud::where(function ($q) use ($jefeId, $empresaIds) {
            $q->where('jefe_id', $jefeId)
              ->orWhere('revisado_por_jefe_id', $jefeId);

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
        $baseQuery = $this->getJefaturaQuery();

        // 1. Métricas de solicitudes por estado asignadas a este jefe
        $pendientesCount = (clone $baseQuery)->where('estado', 'Pendiente')->count();
        $aprobadasCount = (clone $baseQuery)->where('estado', 'Aprobado_Jefatura')->count();
        $pagadasCount = (clone $baseQuery)->where('estado', 'Pagado')->count();
        $observadasCount = (clone $baseQuery)->where('estado', 'Observado')->count();
        $rechazadasCount = (clone $baseQuery)->where('estado', 'Rechazado')->count();

        // 2. Montos pendientes de aprobación por el jefe
        $montoPendienteBOB = (clone $baseQuery)->where('estado', 'Pendiente')
            ->where('moneda', 'BOB')
            ->sum('monto');

        $montoPendienteUSD = (clone $baseQuery)->where('estado', 'Pendiente')
            ->where('moneda', 'USD')
            ->sum('monto');

        // 3. Montos ya aprobados por jefatura
        $montoAprobadoBOB = (clone $baseQuery)->whereIn('estado', ['Aprobado_Jefatura', 'Pagado'])
            ->where('moneda', 'BOB')
            ->sum('monto');

        $montoAprobadoUSD = (clone $baseQuery)->whereIn('estado', ['Aprobado_Jefatura', 'Pagado'])
            ->where('moneda', 'USD')
            ->sum('monto');

        // 4. Solicitudes prioritarias pendientes de aprobación (Estado: Pendiente)
        $solicitudesPorAprobar = (clone $baseQuery)->with(['empresa', 'solicitante', 'jefe', 'proveedor'])
            ->where('estado', 'Pendiente')
            ->orderBy('fecha_solicitud', 'asc')
            ->take(8)
            ->get();

        // 5. Últimas solicitudes revisadas por el jefe
        $ultimasRevisiones = (clone $baseQuery)->with(['empresa', 'solicitante', 'jefe', 'proveedor', 'revisadoPorJefe'])
            ->whereIn('estado', ['Aprobado_Jefatura', 'Observado', 'Rechazado'])
            ->orderBy('updated_at', 'desc')
            ->take(6)
            ->get();

        // 6. Conteo de proveedores
        $totalProveedores = Proveedor::count();

        return Inertia::render('Jefatura/Dashboard', [
            'stats' => [
                'pendientesCount' => $pendientesCount,
                'aprobadasCount' => $aprobadasCount,
                'pagadasCount' => $pagadasCount,
                'observadasCount' => $observadasCount,
                'rechazadasCount' => $rechazadasCount,
                'montoPendienteBOB' => (float)$montoPendienteBOB,
                'montoPendienteUSD' => (float)$montoPendienteUSD,
                'montoAprobadoBOB' => (float)$montoAprobadoBOB,
                'montoAprobadoUSD' => (float)$montoAprobadoUSD,
                'totalProveedores' => $totalProveedores,
            ],
            'solicitudesPorAprobar' => $solicitudesPorAprobar,
            'ultimasRevisiones' => $ultimasRevisiones,
        ]);
    }

    /**
     * Listado y bandeja de aprobación de solicitudes para el Jefe autenticado
     */
    public function solicitudes(Request $request)
    {
        $query = $this->getJefaturaQuery()
            ->with(['empresa', 'solicitante', 'jefe', 'proveedor', 'revisadoPorJefe', 'procesadoPorConta'])
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

        // Conteo de solicitudes pendientes asignadas para el Badge
        $badgePendientes = (clone $this->getJefaturaQuery())->where('estado', 'Pendiente')->count();

        return Inertia::render('Jefatura/Solicitudes/Index', [
            'solicitudes' => $solicitudes,
            'empresas' => $empresas,
            'proveedores' => $proveedores,
            'badgePendientes' => $badgePendientes,
            'filters' => $request->only(['estado', 'empresa_id', 'moneda', 'search']),
        ]);
    }

    /**
     * APROBAR Solicitud de pago (Cambia estado a Aprobado_Jefatura y notifica por correo)
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
