<?php

namespace App\Http\Controllers;

use App\Models\Solicitud;
use App\Models\User;
use App\Models\Proveedor;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $totalSolicitudes = Solicitud::count();
        $pendientes = Solicitud::where('estado', 'Pendiente')->count();
        $aprobadasJefe = Solicitud::where('estado', 'Aprobado_Jefatura')->count();
        $pagadas = Solicitud::where('estado', 'Pagado')->count();
        $observadas = Solicitud::where('estado', 'Observado')->count();
        $rechazadas = Solicitud::where('estado', 'Rechazado')->count();

        $montoBOB = Solicitud::where('moneda', 'BOB')
            ->whereNotIn('estado', ['Rechazado'])
            ->sum('monto');

        $montoUSD = Solicitud::where('moneda', 'USD')
            ->whereNotIn('estado', ['Rechazado'])
            ->sum('monto');

        $totalUsuarios = User::count();
        $totalProveedores = Proveedor::count();
        $totalEmpresas = Empresa::count();

        $solicitudesRecientes = Solicitud::with(['empresa', 'solicitante', 'proveedor'])
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get();

        $solicitudesPorEmpresa = Solicitud::select('empresa_id', DB::raw('count(*) as total'))
            ->groupBy('empresa_id')
            ->with('empresa')
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalSolicitudes' => $totalSolicitudes,
                'pendientes' => $pendientes,
                'aprobadasJefe' => $aprobadasJefe,
                'pagadas' => $pagadas,
                'observadas' => $observadas,
                'rechazadas' => $rechazadas,
                'montoBOB' => (float)$montoBOB,
                'montoUSD' => (float)$montoUSD,
                'totalUsuarios' => $totalUsuarios,
                'totalProveedores' => $totalProveedores,
                'totalEmpresas' => $totalEmpresas,
            ],
            'solicitudesRecientes' => $solicitudesRecientes,
            'solicitudesPorEmpresa' => $solicitudesPorEmpresa,
        ]);
    }
}
