<?php

namespace App\Http\Controllers;

use App\Models\Solicitud;
use App\Models\Proveedor;
use App\Models\Empresa;
use App\Models\User;
use App\Mail\SolicitudEstadoMail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ContabilidadController extends Controller
{
    /**
     * Helper para obtener el Query base filtrado por el rol de Contabilidad autenticado
     * - Caja Chica: Solo solicitudes <= 300 BOB de su empresa
     * - Contabilidad: Solo solicitudes normales / mayores a 300 BOB (o USD) de sus empresas
     * - Contabilidad - Caja Chica: Ambas (todas las solicitudes de sus empresas asignadas)
     */
    private function getContabilidadQuery()
    {
        $contaUser = auth()->user();
        if ($contaUser && $contaUser->esAdmin()) {
            return Solicitud::query();
        }

        $empresaIds = $contaUser ? $contaUser->empresas()->pluck('empresas.id')->toArray() : [];
        if (empty($empresaIds)) {
            return Solicitud::whereRaw('1 = 0');
        }

        // AISLAMIENTO ESTRICTO: Solo solicitudes pertenecientes a las empresas asignadas al usuario contable
        $query = Solicitud::whereIn('empresa_id', $empresaIds);

        // 1. Rol Caja Chica exclusivo (ej: Maribel Caero): Solo <= 300 BOB
        if ($contaUser && $contaUser->esCajaChica()) {
            return $query->where('moneda', 'BOB')->where('monto', '<=', 300);
        }

        // 2. Rol Contabilidad regular (ej: contabilidad@fralak.com.bo): Solo > 300 BOB o cualquier monto en USD
        if ($contaUser && $contaUser->esContabilidad()) {
            return $query->where(function ($q) {
                $q->where('moneda', '!=', 'BOB')
                  ->orWhere('monto', '>', 300);
            });
        }

        // 3. Rol Contabilidad - Caja Chica (Ambas): Ve todas las solicitudes de sus empresas
        return $query;
    }

    /**
     * Dashboard específico para Contabilidad y Finanzas
     */
    public function dashboard()
    {
        $contaUser = auth()->user();
        $isCajaChica = $contaUser && $contaUser->esCajaChica();
        $isSoloMayores = $contaUser && $contaUser->esContabilidad();
        $isMixto = $contaUser && ($contaUser->esContabilidadCajaChica() || $contaUser->esAdmin());
        $baseQuery = $this->getContabilidadQuery();

        // 1. Métricas clave generales
        $pendientesPagoCount = (clone $baseQuery)->where('estado', 'Aprobado_Jefatura')->count();
        $pagadasCount = (clone $baseQuery)->where('estado', 'Pagado')->count();
        $observadasCount = (clone $baseQuery)->where('estado', 'Observado')->count();
        $pendientesJefeCount = (clone $baseQuery)->where('estado', 'Pendiente')->count();

        // 2. Métricas diferenciadas: Caja Chica (<= 300 BOB) vs Solicitudes Regulares (> 300 BOB / USD)
        $cajaChicaPendientesCount = $isSoloMayores ? 0 : (clone $baseQuery)->where('estado', 'Aprobado_Jefatura')
            ->where('moneda', 'BOB')
            ->where('monto', '<=', 300)
            ->count();

        $cajaChicaMontoBOB = $isSoloMayores ? 0 : (clone $baseQuery)->where('estado', 'Aprobado_Jefatura')
            ->where('moneda', 'BOB')
            ->where('monto', '<=', 300)
            ->sum('monto');

        $regularesPendientesCount = $isCajaChica ? 0 : (clone $baseQuery)->where('estado', 'Aprobado_Jefatura')
            ->where(function ($q) {
                $q->where('moneda', '!=', 'BOB')
                  ->orWhere('monto', '>', 300);
            })
            ->count();

        $regularesMontoBOB = $isCajaChica ? 0 : (clone $baseQuery)->where('estado', 'Aprobado_Jefatura')
            ->where('moneda', 'BOB')
            ->where('monto', '>', 300)
            ->sum('monto');

        $regularesMontoUSD = $isCajaChica ? 0 : (clone $baseQuery)->where('estado', 'Aprobado_Jefatura')
            ->where('moneda', 'USD')
            ->sum('monto');

        // 3. Montos globales desembolsados/pagados
        $montoPagadoBOB = (clone $baseQuery)->where('estado', 'Pagado')
            ->where('moneda', 'BOB')
            ->sum('monto');

        $montoPagadoUSD = $isCajaChica ? 0 : (clone $baseQuery)->where('estado', 'Pagado')
            ->where('moneda', 'USD')
            ->sum('monto');

        // 4. Bloque 1: Solicitudes de Caja Chica por desembolsar (<= 300 BOB) (Omitido para rol Contabilidad regular)
        $solicitudesCajaChica = $isSoloMayores ? [] : (clone $baseQuery)->with(['empresa', 'solicitante', 'jefe', 'contabilidad', 'proveedor', 'revisadoPorJefe'])
            ->where('estado', 'Aprobado_Jefatura')
            ->where('moneda', 'BOB')
            ->where('monto', '<=', 300)
            ->orderBy('fecha_solicitud', 'asc')
            ->take(8)
            ->get();

        // 5. Bloque 2: Solicitudes Regulares / Mayores por desembolsar (> 300 BOB o USD) (Omitido para rol Caja Chica)
        $solicitudesRegulares = $isCajaChica ? [] : (clone $baseQuery)->with(['empresa', 'solicitante', 'jefe', 'contabilidad', 'proveedor', 'revisadoPorJefe'])
            ->where('estado', 'Aprobado_Jefatura')
            ->where(function ($q) {
                $q->where('moneda', '!=', 'BOB')
                  ->orWhere('monto', '>', 300);
            })
            ->orderBy('fecha_solicitud', 'asc')
            ->take(8)
            ->get();

        // 6. Historial reciente de solicitudes pagadas
        $ultimosPagos = (clone $baseQuery)->with(['empresa', 'solicitante', 'jefe', 'contabilidad', 'proveedor', 'procesadoPorConta'])
            ->where('estado', 'Pagado')
            ->orderBy('updated_at', 'desc')
            ->take(6)
            ->get();

        $totalProveedores = Proveedor::count();

        return Inertia::render('Contabilidad/Dashboard', [
            'stats' => [
                'pendientesPagoCount' => $pendientesPagoCount,
                'pagadasCount' => $pagadasCount,
                'observadasCount' => $observadasCount,
                'pendientesJefeCount' => $pendientesJefeCount,
                'cajaChicaPendientesCount' => $cajaChicaPendientesCount,
                'cajaChicaMontoBOB' => (float)$cajaChicaMontoBOB,
                'regularesPendientesCount' => $regularesPendientesCount,
                'regularesMontoBOB' => (float)$regularesMontoBOB,
                'regularesMontoUSD' => (float)$regularesMontoUSD,
                'montoPagadoBOB' => (float)$montoPagadoBOB,
                'montoPagadoUSD' => (float)$montoPagadoUSD,
                'totalProveedores' => $totalProveedores,
            ],
            'solicitudesCajaChica' => $solicitudesCajaChica,
            'solicitudesRegulares' => $solicitudesRegulares,
            'ultimosPagos' => $ultimosPagos,
            'isCajaChica' => $isCajaChica,
            'isSoloMayores' => $isSoloMayores,
            'isMixto' => $isMixto,
        ]);
    }

    /**
     * Listado y gestión de solicitudes para Contabilidad con filtro de Caja Chica / Regular
     */
    public function solicitudes(Request $request)
    {
        $contaUser = auth()->user();
        $isCajaChica = $contaUser && $contaUser->esCajaChica();
        $isSoloMayores = $contaUser && $contaUser->esContabilidad();
        $isMixto = $contaUser && ($contaUser->esContabilidadCajaChica() || $contaUser->esAdmin());

        $query = $this->getContabilidadQuery()
            ->with(['empresa', 'solicitante', 'jefe', 'contabilidad', 'proveedor', 'revisadoPorJefe', 'procesadoPorConta'])
            ->orderBy('id', 'desc');

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if (!$isCajaChica && $request->filled('empresa_id')) {
            $query->where('empresa_id', $request->empresa_id);
        }

        if (!$isCajaChica && $request->filled('moneda')) {
            $query->where('moneda', $request->moneda);
        }

        // Filtro específico para Caja Chica vs Regulares (solo para rol Mixto / Admin que ve ambas)
        if ($isMixto && $request->filled('tipo_monto')) {
            if ($request->tipo_monto === 'caja_chica') {
                $query->where('moneda', 'BOB')->where('monto', '<=', 300);
            } elseif ($request->tipo_monto === 'regular') {
                $query->where(function ($q) {
                    $q->where('moneda', '!=', 'BOB')
                      ->orWhere('monto', '>', 300);
                });
            }
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
                        ->orWhere('nit_ci', 'like', "%{$search}%")
                        ->orWhere('banco', 'like', "%{$search}%")
                        ->orWhere('numero_cuenta', 'like', "%{$search}%");
                  });
            });
        }

        $solicitudes = $query->paginate(12)->withQueryString();
        $empresas = $isCajaChica
            ? Empresa::where('nombre', 'like', '%Fralak%')->get()
            : ($contaUser && $contaUser->esAdmin() ? Empresa::all() : $contaUser->empresas);
        $proveedores = Proveedor::all();

        // Conteos para Badges de Pestañas
        $baseBadgeQuery = $this->getContabilidadQuery();
        $badgePorPagar = (clone $baseBadgeQuery)->where('estado', 'Aprobado_Jefatura')->count();
        $badgeCajaChica = $isSoloMayores ? 0 : (clone $baseBadgeQuery)->where('estado', 'Aprobado_Jefatura')
            ->where('moneda', 'BOB')
            ->where('monto', '<=', 300)
            ->count();
        $badgeRegulares = $isCajaChica ? 0 : (clone $baseBadgeQuery)->where('estado', 'Aprobado_Jefatura')
            ->where(function ($q) {
                $q->where('moneda', '!=', 'BOB')
                  ->orWhere('monto', '>', 300);
            })
            ->count();

        return Inertia::render('Contabilidad/Solicitudes/Index', [
            'solicitudes' => $solicitudes,
            'empresas' => $empresas,
            'proveedores' => $proveedores,
            'badgePorPagar' => $badgePorPagar,
            'badgeCajaChica' => $badgeCajaChica,
            'badgeRegulares' => $badgeRegulares,
            'isCajaChica' => $isCajaChica,
            'isSoloMayores' => $isSoloMayores,
            'isMixto' => $isMixto,
            'filters' => $request->only(['estado', 'empresa_id', 'moneda', 'tipo_monto', 'search']),
        ]);
    }

    /**
     * Marcar solicitud como PAGADO (Procesar Desembolso y notificar por correo)
     */
    public function procesarPago(Request $request, Solicitud $solicitud)
    {
        $validated = $request->validate([
            'comentarios_revision' => 'nullable|string|max:500',
            'numero_comprobante' => 'nullable|string|max:100',
        ]);

        $user = auth()->user();

        $comentarioFinal = $validated['comentarios_revision'] ?? 'Pago efectuado y procesado por Contabilidad.';
        if (!empty($validated['numero_comprobante'])) {
            $comentarioFinal .= " [Nro. Comprobante/Transacción: {$validated['numero_comprobante']}]";
        }

        $solicitud->update([
            'estado' => 'Pagado',
            'comentarios_revision' => $comentarioFinal,
            'procesado_por_conta_id' => $user->id,
        ]);

        // Notificar por correo al Solicitante y a Jefatura
        SolicitudEstadoMail::notificarCambioEstado($solicitud);

        return redirect()->back()->with('success', "Desembolso registrado correctamente. La solicitud #{$solicitud->id} ha sido marcada como PAGADA y notificada por correo.");
    }

    /**
     * Marcar solicitud como OBSERVADO (Devolver con correcciones y notificar por correo)
     */
    public function observarSolicitud(Request $request, Solicitud $solicitud)
    {
        $validated = $request->validate([
            'comentarios_revision' => 'required|string|min:5|max:500',
        ]);

        $user = auth()->user();

        $solicitud->update([
            'estado' => 'Observado',
            'comentarios_revision' => $validated['comentarios_revision'],
            'procesado_por_conta_id' => $user->id,
        ]);

        // Notificar por correo al Solicitante
        SolicitudEstadoMail::notificarCambioEstado($solicitud);

        return redirect()->back()->with('success', "La solicitud #{$solicitud->id} ha sido enviada a OBSERVADA y notificada al solicitante por correo.");
    }

    /**
     * Vista de proveedores y verificación bancaria para Contabilidad
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

        return Inertia::render('Contabilidad/Proveedores/Index', [
            'proveedores' => $proveedores,
            'filters' => $request->only(['search']),
        ]);
    }
}
