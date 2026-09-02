<?php

namespace App\Http\Controllers;

use App\Models\Solicitud;
use App\Models\Empresa;
use App\Models\Proveedor;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SolicitudController extends Controller
{
    public function index(Request $request)
    {
        $query = Solicitud::with(['empresa', 'solicitante', 'jefe', 'contabilidad', 'proveedor', 'revisadoPorJefe', 'procesadoPorConta'])
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
                      $pq->where('nombre_razon_social', 'like', "%{$search}%");
                  });
            });
        }

        $solicitudes = $query->paginate(10)->withQueryString();
        $empresas = Empresa::all();
        $proveedores = Proveedor::all();
        $usuarios = User::with(['rol', 'empresas'])->get();
        $contabilidades = User::with(['rol', 'empresas'])->whereHas('rol', function ($q) {
            $q->whereIn('nombre', ['Contabilidad', 'Conta', 'Caja Chica', 'Cajachica', 'Contabilidad - Caja Chica', 'Contabilidad-Caja Chica']);
        })->get();

        return Inertia::render('Admin/Solicitudes/Index', [
            'solicitudes' => $solicitudes,
            'empresas' => $empresas,
            'proveedores' => $proveedores,
            'usuarios' => $usuarios,
            'contabilidades' => $contabilidades,
            'filters' => $request->only(['estado', 'empresa_id', 'moneda', 'search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'solicitante_id' => 'required|exists:usuarios,id',
            'tipo_solicitud' => 'nullable|string|max:50',
            'jefe_id' => 'nullable|exists:usuarios,id',
            'jefe_ids' => 'nullable|array',
            'jefe_ids.*' => 'exists:usuarios,id',
            'contabilidad_id' => 'nullable|exists:usuarios,id',
            'contabilidad_ids' => 'nullable|array',
            'contabilidad_ids.*' => 'exists:usuarios,id',
            'proveedor_id' => 'required|exists:proveedores,id',
            'motivo_descripcion' => 'required|string',
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

        $solicitud = Solicitud::create([
            'empresa_id' => $validated['empresa_id'],
            'solicitante_id' => $validated['solicitante_id'],
            'tipo_solicitud' => $validated['tipo_solicitud'] ?? 'Pago a Proveedor',
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

        return redirect()->back()->with('success', 'Solicitud creada correctamente y notificada por correo.');
    }

    public function update(Request $request, Solicitud $solicitud)
    {
        $validated = $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'tipo_solicitud' => 'nullable|string|max:50',
            'solicitante_id' => 'required|exists:usuarios,id',
            'jefe_id' => 'nullable|exists:usuarios,id',
            'jefe_ids' => 'nullable|array',
            'jefe_ids.*' => 'exists:usuarios,id',
            'contabilidad_id' => 'nullable|exists:usuarios,id',
            'contabilidad_ids' => 'nullable|array',
            'contabilidad_ids.*' => 'exists:usuarios,id',
            'proveedor_id' => 'required|exists:proveedores,id',
            'motivo_descripcion' => 'required|string',
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

        $solicitud->update($validated);

        return redirect()->back()->with('success', 'Solicitud actualizada correctamente.');
    }

    public function cambiarEstado(Request $request, Solicitud $solicitud)
    {
        $validated = $request->validate([
            'nuevo_estado' => 'required|in:Pendiente,Observado,Aprobado_Jefatura,Pagado,Rechazado',
            'comentarios_revision' => 'nullable|string',
        ]);

        $user = auth()->user();
        $nuevoEstado = $validated['nuevo_estado'];

        $updateData = [
            'estado' => $nuevoEstado,
            'comentarios_revision' => $validated['comentarios_revision'] ?? $solicitud->comentarios_revision,
        ];

        if (in_array($nuevoEstado, ['Aprobado_Jefatura', 'Observado', 'Rechazado'])) {
            $updateData['revisado_por_jefe_id'] = $user->id;
        }

        if ($nuevoEstado === 'Pagado') {
            $updateData['procesado_por_conta_id'] = $user->id;
        }

        $solicitud->update($updateData);

        if ($nuevoEstado === 'Pendiente') {
            \App\Mail\SolicitudNuevaMail::notificarJefatura($solicitud);
        } else {
            \App\Mail\SolicitudEstadoMail::notificarCambioEstado($solicitud);
        }

        return redirect()->back()->with('success', "Estado cambiado a '{$nuevoEstado}' correctamente y notificado por correo.");
    }

    public function destroy(Solicitud $solicitud)
    {
        $solicitud->delete();
        return redirect()->back()->with('success', 'Solicitud eliminada correctamente.');
    }
}
