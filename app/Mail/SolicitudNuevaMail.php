<?php

namespace App\Mail;

use App\Models\Solicitud;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SolicitudNuevaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $solicitud;
    public $urlAprobar;
    public $urlRechazar;
    public $correoReplyTo;

    // Configuración visual adaptativa por empresa
    public $logoBase64;
    public $headerGradient;
    public $primaryColor;
    public $lightBoxBg;
    public $borderColor;

    /**
     * Create a new message instance.
     */
    public function __construct(Solicitud $solicitud)
    {
        $this->solicitud = $solicitud->loadMissing(['empresa', 'solicitante', 'proveedor']);
        
        $solicitante = $this->solicitud->solicitante;
        $empresaId = $this->solicitud->empresa_id;

        // Correo corporativo del solicitante para la empresa seleccionada (Reply-To Dinámico)
        $this->correoReplyTo = $solicitante ? $solicitante->getCorreoCorporativoParaEmpresa($empresaId) : 'sistemas@fralak.com.bo';

        // Rutas firmadas (Signed URLs) para Aprobación y Rechazo directo
        $this->urlAprobar = URL::signedRoute('solicitudes.email-aprobar', ['solicitud' => $this->solicitud->id]);
        $this->urlRechazar = URL::signedRoute('solicitudes.email-rechazar', ['solicitud' => $this->solicitud->id]);

        // Determinar esquema visual y logo por empresa
        $empresaNombre = strtolower($this->solicitud->empresa ? $this->solicitud->empresa->nombre : '');

        if (str_contains($empresaNombre, 'fralak')) {
            // Fralak SRL: Rojo Vino
            $logoFileName = 'Logo_Fralak.PNG';
            $this->headerGradient = 'linear-gradient(135deg, #701a24 0%, #881337 50%, #9f1239 100%)';
            $this->primaryColor = '#881337';
            $this->lightBoxBg = '#fff1f2';
            $this->borderColor = '#fecdd3';
        } elseif (str_contains($empresaNombre, 'dotmed')) {
            // Dotmed SRL: Verde Azulado Oscuro
            $logoFileName = 'Logo_Dotmed.png';
            $this->headerGradient = 'linear-gradient(135deg, #0d4b45 0%, #0f766e 50%, #115e59 100%)';
            $this->primaryColor = '#0f766e';
            $this->lightBoxBg = '#f0fdf4';
            $this->borderColor = '#99f6e4';
        } else {
            // CID SRL u otras: Azul Oscuro
            $logoFileName = 'Logo_CID.PNG';
            $this->headerGradient = 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)';
            $this->primaryColor = '#1e3a8a';
            $this->lightBoxBg = '#eff6ff';
            $this->borderColor = '#bfdbfe';
        }

        $baseUrl = rtrim(config('app.url', 'https://pagos.fralak.com.bo'), '/');
        if (str_contains($baseUrl, 'localhost') || str_contains($baseUrl, '127.0.0.1')) {
            $baseUrl = 'https://pagos.fralak.com.bo';
        }
        $this->logoUrl = $baseUrl . '/images/' . $logoFileName;
        $this->logoBase64 = '';
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $empresaNombre = $this->solicitud->empresa ? $this->solicitud->empresa->nombre : 'Empresa';
        $montoFormateado = number_format($this->solicitud->monto, 2) . ' ' . $this->solicitud->moneda;
        $tagTipo = ($this->solicitud->tipo_solicitud === 'Caja Chica') ? 'CAJA CHICA' : 'PAGO A PROVEEDOR';

        return new Envelope(
            from: new Address(config('mail.from.address', 'sistemas@fralak.com.bo'), config('mail.from.name', 'Sistema de Solicitudes')),
            replyTo: [
                new Address($this->correoReplyTo, $this->solicitud->solicitante ? $this->solicitud->solicitante->nombre_completo : 'Solicitante')
            ],
            subject: "[{$tagTipo} #{$this->solicitud->id}] - {$empresaNombre} - {$montoFormateado}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.solicitud_nueva',
            with: [
                'solicitud' => $this->solicitud,
                'urlAprobar' => $this->urlAprobar,
                'urlRechazar' => $this->urlRechazar,
                'correoReplyTo' => $this->correoReplyTo,
                'logoUrl' => $this->logoUrl,
                'logoBase64' => $this->logoBase64,
                'headerGradient' => $this->headerGradient,
                'primaryColor' => $this->primaryColor,
                'lightBoxBg' => $this->lightBoxBg,
                'borderColor' => $this->borderColor,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        if ($this->solicitud->archivo_respaldo_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($this->solicitud->archivo_respaldo_path)) {
            $fullPath = storage_path('app/public/' . $this->solicitud->archivo_respaldo_path);
            $ext = pathinfo($fullPath, PATHINFO_EXTENSION);
            return [
                \Illuminate\Mail\Mailables\Attachment::fromPath($fullPath)
                    ->as("Justificante_Solicitud_{$this->solicitud->id}.{$ext}")
            ];
        }
        return [];
    }

    /**
     * Alias para notificarJefatura
     */
    public static function notificarNuevaSolicitud(Solicitud $solicitud)
    {
        return self::notificarJefatura($solicitud);
    }

    /**
     * Helper para enviar la notificación por correo al Jefe Asignado específico y a Contabilidad
     */
    public static function notificarJefatura(Solicitud $solicitud)
    {
        try {
            $solicitud->loadMissing(['empresa', 'solicitante', 'jefe']);
            $empresaId = $solicitud->empresa_id;

            $destinatarios = [];

            // 1. Correo corporativo del Solicitante (para que le llegue copia de confirmación de su propia solicitud)
            if ($solicitud->solicitante) {
                $correoSolicitante = $solicitud->solicitante->getCorreoCorporativoParaEmpresa($empresaId);
                if ($correoSolicitante) {
                    $destinatarios[] = $correoSolicitante;
                }
            }

            // 2. Correo corporativo de todos los Jefes asignados (Principal y Copias)
            $jefesList = $solicitud->jefes_asignados;
            if ($jefesList && count($jefesList) > 0) {
                foreach ($jefesList as $ju) {
                    $correoJefe = $ju->getCorreoCorporativoParaEmpresa($empresaId);
                    if ($correoJefe) {
                        $destinatarios[] = $correoJefe;
                    }
                }
            } elseif ($solicitud->jefe) {
                $correoJefe = $solicitud->jefe->getCorreoCorporativoParaEmpresa($empresaId);
                if ($correoJefe) {
                    $destinatarios[] = $correoJefe;
                }
            } else {
                // Si no hay jefe asignado explícito, notificar a los jefes de esa empresa
                $jefes = User::whereHas('rol', function ($q) {
                    $q->whereIn('nombre', ['Jefe', 'Jefatura']);
                })->get();

                foreach ($jefes as $j) {
                    $destinatarios[] = $j->getCorreoCorporativoParaEmpresa($empresaId);
                }
            }

            // 4. Incluir a Contabilidad o Caja Chica según corresponda
            $isFralak = str_contains(strtolower($solicitud->empresa ? $solicitud->empresa->nombre : ''), 'fralak');
            $isCajaChica = ($solicitud->tipo_solicitud === 'Caja Chica') || ($solicitud->moneda === 'BOB' && $solicitud->monto <= 300);

            $contaUsersList = $solicitud->contabilidades_asignadas;
            if ($contaUsersList && count($contaUsersList) > 0) {
                foreach ($contaUsersList as $cu) {
                    $correoConta = $cu->getCorreoCorporativoParaEmpresa($empresaId);
                    if ($correoConta) {
                        $destinatarios[] = $correoConta;
                    }
                }
            } elseif ($solicitud->contabilidad) {
                $correoConta = $solicitud->contabilidad->getCorreoCorporativoParaEmpresa($empresaId);
                if ($correoConta) {
                    $destinatarios[] = $correoConta;
                }
            } elseif ($isFralak && $isCajaChica) {
                // Notificar a la encargada de Caja Chica Fralak
                $cajaUsers = User::whereHas('rol', function ($q) {
                    $q->whereIn('nombre', ['Caja Chica', 'Cajachica', 'Contabilidad - Caja Chica', 'Contabilidad-Caja Chica']);
                })->get();

                foreach ($cajaUsers as $c) {
                    $email = $c->getCorreoCorporativoParaEmpresa($empresaId);
                    if ($email) {
                        $destinatarios[] = $email;
                    }
                }
            } else {
                // Notificar a Contabilidad de esa empresa
                $contaUsers = User::whereHas('rol', function ($q) {
                    $q->whereIn('nombre', ['Contabilidad', 'Conta', 'Contabilidad - Caja Chica', 'Contabilidad-Caja Chica']);
                })->get();

                foreach ($contaUsers as $c) {
                    $email = $c->getCorreoCorporativoParaEmpresa($empresaId);
                    if ($email) {
                        $destinatarios[] = $email;
                    }
                }
            }

            $destinatarios = array_values(array_unique(array_filter($destinatarios)));

            if (empty($destinatarios)) {
                $destinatarios = ['jefe@sistema.com', 'conta@sistema.com'];
            }

            Mail::to($destinatarios)->send(new self($solicitud));
        } catch (\Throwable $e) {
            Log::error("Error enviando correo de notificación de solicitud #{$solicitud->id}: " . $e->getMessage());
        }
    }
}
