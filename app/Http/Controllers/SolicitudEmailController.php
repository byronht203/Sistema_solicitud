<?php

namespace App\Http\Controllers;

use App\Models\Solicitud;
use App\Mail\SolicitudNuevaMail;
use App\Mail\SolicitudEstadoMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class SolicitudEmailController extends Controller
{
    /**
     * Aprobar solicitud vía Signed URL (Desde botón en Zoho Mail)
     */
    public function aprobar(Request $request, Solicitud $solicitud)
    {
        if (!$request->hasValidSignature()) {
            return response()->view('emails.resultado_accion', [
                'tipo' => 'error',
                'titulo' => 'Enlace Inválido o Expirado',
                'mensaje' => 'La firma digital de este enlace no es válida o ha caducado por motivos de seguridad.',
                'solicitud' => $solicitud,
            ], 403);
        }

        if (in_array($solicitud->estado, ['Aprobado_Jefatura', 'Pagado'])) {
            return response()->view('emails.resultado_accion', [
                'tipo' => 'info',
                'titulo' => 'Solicitud Ya Procesada',
                'mensaje' => "Esta solicitud ya se encuentra aprobada/procesada en el sistema con el estado actual: {$solicitud->estado}.",
                'solicitud' => $solicitud,
            ]);
        }

        if ($solicitud->estado === 'Rechazado') {
            return response()->view('emails.resultado_accion', [
                'tipo' => 'info',
                'titulo' => 'Solicitud Previamente Rechazada',
                'mensaje' => 'Esta solicitud fue marcada como Rechazada anteriormente.',
                'solicitud' => $solicitud,
            ]);
        }

        $solicitud->update([
            'estado' => 'Aprobado_Jefatura',
            'comentarios_revision' => 'Aprobado directamente desde correo electrónico (Signed URL) por Jefatura.',
        ]);

        // Notificar por correo al Solicitante y Contabilidad
        SolicitudEstadoMail::notificarCambioEstado($solicitud);

        return response()->view('emails.resultado_accion', [
            'tipo' => 'success',
            'titulo' => '¡Solicitud Aprobada Exitosamente!',
            'mensaje' => "La solicitud #{$solicitud->id} ha sido aprobada correctamente y ha ingresado a la cola de desembolsos de Contabilidad. El solicitante y contabilidad han sido notificados por correo.",
            'solicitud' => $solicitud,
        ]);
    }

    /**
     * Rechazar solicitud vía Signed URL (Desde botón en Zoho Mail)
     */
    public function rechazar(Request $request, Solicitud $solicitud)
    {
        if (!$request->hasValidSignature()) {
            return response()->view('emails.resultado_accion', [
                'tipo' => 'error',
                'titulo' => 'Enlace Inválido o Expirado',
                'mensaje' => 'La firma digital de este enlace no es válida o ha caducado por motivos de seguridad.',
                'solicitud' => $solicitud,
            ], 403);
        }

        if ($solicitud->estado === 'Rechazado') {
            return response()->view('emails.resultado_accion', [
                'tipo' => 'info',
                'titulo' => 'Solicitud Ya Rechazada',
                'mensaje' => 'Esta solicitud ya había sido rechazada previamente.',
                'solicitud' => $solicitud,
            ]);
        }

        $solicitud->update([
            'estado' => 'Rechazado',
            'comentarios_revision' => 'Rechazado directamente desde correo electrónico (Signed URL) por Jefatura.',
        ]);

        // Notificar por correo al Solicitante
        SolicitudEstadoMail::notificarCambioEstado($solicitud);

        return response()->view('emails.resultado_accion', [
            'tipo' => 'error',
            'titulo' => 'Solicitud Rechazada',
            'mensaje' => "La solicitud #{$solicitud->id} ha sido RECHAZADA. El solicitante ha sido notificado por correo.",
            'solicitud' => $solicitud,
        ]);
    }

    /**
     * Endpoint para renderizar la vista previa del comprobante de correo en HTML (Para Modal en React)
     */
    public function comprobanteCorreo(Solicitud $solicitud)
    {
        $solicitud->loadMissing(['empresa', 'solicitante', 'jefe', 'proveedor', 'revisadoPorJefe', 'procesadoPorConta']);
        
        if ($solicitud->estado === 'Pendiente') {
            $mailable = new SolicitudNuevaMail($solicitud);
        } else {
            $mailable = new SolicitudEstadoMail($solicitud);
        }

        return response($mailable->render(), 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
}
