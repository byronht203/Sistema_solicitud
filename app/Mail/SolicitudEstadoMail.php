<?php

namespace App\Mail;

use App\Models\Solicitud;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SolicitudEstadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $solicitud;
    public $correoReplyTo;

    // Configuración visual por empresa
    public $logoBase64;
    public $headerGradient;
    public $primaryColor;
    public $lightBoxBg;
    public $borderColor;
    public $statusColor;
    public $statusTitle;

    /**
     * Create a new message instance.
     */
    public function __construct(Solicitud $solicitud)
    {
        $this->solicitud = $solicitud->loadMissing(['empresa', 'solicitante', 'jefe', 'proveedor', 'revisadoPorJefe', 'procesadoPorConta']);
        
        $solicitante = $this->solicitud->solicitante;
        $empresaId = $this->solicitud->empresa_id;

        // Correo corporativo del solicitante para la empresa (Reply-To)
        $this->correoReplyTo = $solicitante ? $solicitante->getCorreoCorporativoParaEmpresa($empresaId) : 'sistemas@fralak.com.bo';

        // Esquema visual por empresa
        $empresaNombre = strtolower($this->solicitud->empresa ? $this->solicitud->empresa->nombre : '');

        if (str_contains($empresaNombre, 'fralak')) {
            $logoFileName = 'Logo_Fralak.PNG';
            $this->headerGradient = 'linear-gradient(135deg, #701a24 0%, #881337 50%, #9f1239 100%)';
            $this->primaryColor = '#881337';
            $this->lightBoxBg = '#fff1f2';
            $this->borderColor = '#fecdd3';
        } elseif (str_contains($empresaNombre, 'dotmed')) {
            $logoFileName = 'Logo_Dotmed.png';
            $this->headerGradient = 'linear-gradient(135deg, #0d4b45 0%, #0f766e 50%, #115e59 100%)';
            $this->primaryColor = '#0f766e';
            $this->lightBoxBg = '#f0fdf4';
            $this->borderColor = '#99f6e4';
        } else {
            $logoFileName = 'Logo_CID.PNG';
            $this->headerGradient = 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)';
            $this->primaryColor = '#1e3a8a';
            $this->lightBoxBg = '#eff6ff';
            $this->borderColor = '#bfdbfe';
        }

        $logoPath = public_path('images/' . $logoFileName);
        if (file_exists($logoPath)) {
            $this->logoBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
        } else {
            $this->logoBase64 = '';
        }

        // Título y colores por Estado
        switch ($this->solicitud->estado) {
            case 'Aprobado_Jefatura':
                $this->statusTitle = 'SOLICITUD APROBADA POR JEFATURA';
                $this->statusColor = '#059669'; // Emerald
                break;
            case 'Pagado':
                $this->statusTitle = 'DESEMBOLSO COMPLETADO - PAGADO';
                $this->statusColor = '#10b981'; // Bright Green
                break;
            case 'Observado':
                $this->statusTitle = 'SOLICITUD EN OBSERVACIÓN';
                $this->statusColor = '#d97706'; // Amber / Orange
                break;
            case 'Rechazado':
                $this->statusTitle = 'SOLICITUD RECHAZADA';
                $this->statusColor = '#dc2626'; // Red
                break;
            default:
                $this->statusTitle = 'ACTUALIZACIÓN DE ESTADO';
                $this->statusColor = '#2563eb';
                break;
        }
    }

    /**
     * Envelope definition.
     */
    public function envelope(): Envelope
    {
        $empresaNombre = $this->solicitud->empresa ? $this->solicitud->empresa->nombre : 'Empresa';
        $montoFormateado = number_format($this->solicitud->monto, 2) . ' ' . $this->solicitud->moneda;

        return new Envelope(
            from: new Address(config('mail.from.address', 'sistemas@fralak.com.bo'), config('mail.from.name', 'Sistema de Solicitudes')),
            replyTo: [
                new Address($this->correoReplyTo, $this->solicitud->solicitante ? $this->solicitud->solicitante->nombre_completo : 'Solicitante')
            ],
            subject: "[{$this->statusTitle} #{$this->solicitud->id}] - {$empresaNombre} - {$montoFormateado}",
        );
    }

    /**
     * Content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.solicitud_estado',
            with: [
                'solicitud' => $this->solicitud,
                'correoReplyTo' => $this->correoReplyTo,
                'logoBase64' => $this->logoBase64,
                'headerGradient' => $this->headerGradient,
                'primaryColor' => $this->primaryColor,
                'lightBoxBg' => $this->lightBoxBg,
                'borderColor' => $this->borderColor,
                'statusTitle' => $this->statusTitle,
                'statusColor' => $this->statusColor,
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
     * Helper estático para notificar el cambio de estado por correo a las partes interesadas
     */
    public static function notificarCambioEstado(Solicitud $solicitud)
    {
        try {
            $solicitud->loadMissing(['empresa', 'solicitante', 'jefe']);
            $empresaId = $solicitud->empresa_id;
            $destinatarios = [];

            // 1. Siempre incluir al Solicitante (su correo corporativo para esa empresa)
            if ($solicitud->solicitante) {
                $correoSolicitante = $solicitud->solicitante->getCorreoCorporativoParaEmpresa($empresaId);
                if ($correoSolicitante) {
                    $destinatarios[] = $correoSolicitante;
                }
            }

            // 2. Si el estado es "Aprobado_Jefatura", notificar a la persona o personas de Contabilidad/Caja Chica asignadas
            if ($solicitud->estado === 'Aprobado_Jefatura') {
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
                        $correo = $c->getCorreoCorporativoParaEmpresa($empresaId);
                        if ($correo) {
                            $destinatarios[] = $correo;
                        }
                    }
                } else {
                    $contaUsers = User::whereHas('rol', function ($q) {
                        $q->whereIn('nombre', ['Contabilidad', 'Conta', 'Contabilidad - Caja Chica', 'Contabilidad-Caja Chica']);
                    })->get();
                    foreach ($contaUsers as $c) {
                        $correoConta = $c->getCorreoCorporativoParaEmpresa($empresaId);
                        if ($correoConta) {
                            $destinatarios[] = $correoConta;
                        }
                    }
                }
            }

            // 3. Notificar también al Jefe Aprobador y jefes en copia para su conocimiento
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
            }

            $destinatarios = array_values(array_unique(array_filter($destinatarios)));

            if (!empty($destinatarios)) {
                Mail::to($destinatarios)->send(new self($solicitud));
                Log::info("Correo de cambio de estado ({$solicitud->estado}) enviado a: " . implode(', ', $destinatarios));
            }
        } catch (\Throwable $e) {
            Log::error("Error enviando correo de cambio de estado para solicitud #{$solicitud->id}: " . $e->getMessage());
        }
    }
}
