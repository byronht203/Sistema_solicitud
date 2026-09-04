<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $statusTitle }} - Solicitud #{{ $solicitud->id }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #1e293b;
        }
        .container {
            max-width: 650px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
            border: 1px solid #e2e8f0;
        }
        .header {
            background: {{ $headerGradient }};
            color: #ffffff;
            padding: 35px 25px 30px 25px;
            text-align: center;
        }
        .logo-container {
            background: #ffffff;
            display: inline-block;
            padding: 12px 24px;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin-bottom: 18px;
        }
        .logo-img {
            max-height: 55px;
            width: auto;
            max-width: 260px;
            display: block;
            margin: 0 auto;
            object-fit: contain;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #ffffff;
        }
        .header p {
            margin: 6px 0 0 0;
            opacity: 0.95;
            font-size: 13px;
        }
        .badge-status {
            display: inline-block;
            background: {{ $statusColor }};
            color: #ffffff;
            padding: 6px 18px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 800;
            margin-top: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .body-content {
            padding: 30px 25px;
        }
        .info-card {
            background-color: #f8fafc;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            padding: 20px;
            margin-bottom: 25px;
        }
        .amount-box {
            background: {{ $lightBoxBg }};
            border: 1px solid {{ $borderColor }};
            border-radius: 14px;
            padding: 18px;
            text-align: center;
            margin-bottom: 25px;
        }
        .amount-box .label {
            font-size: 12px;
            text-transform: uppercase;
            color: {{ $primaryColor }};
            font-weight: 800;
            letter-spacing: 0.5px;
        }
        .amount-box .value {
            font-size: 32px;
            font-weight: 800;
            color: {{ $primaryColor }};
            margin-top: 4px;
        }
        .grid {
            display: table;
            width: 100%;
            border-collapse: collapse;
        }
        .row {
            display: table-row;
        }
        .cell-label {
            display: table-cell;
            padding: 9px 0;
            font-size: 13px;
            color: #64748b;
            font-weight: 600;
            width: 38%;
            border-bottom: 1px dashed #f1f5f9;
        }
        .cell-value {
            display: table-cell;
            padding: 9px 0;
            font-size: 14px;
            color: #0f172a;
            font-weight: 600;
            border-bottom: 1px dashed #f1f5f9;
        }
        .comments-box {
            background-color: #fefce8;
            border: 1px solid #fef08a;
            border-radius: 14px;
            padding: 16px;
            margin-bottom: 25px;
            font-size: 13px;
            color: #854d0e;
        }
        .footer {
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 20px 25px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header con Logo Institucional -->
        <div class="header">
            @if(!empty($logoUrl))
                <div class="logo-container">
                    <img src="{{ $logoUrl }}" alt="{{ $solicitud->empresa ? $solicitud->empresa->nombre : 'Logo Empresa' }}" class="logo-img">
                </div>
            @elseif(!empty($logoBase64))
                <div class="logo-container">
                    <img src="{{ $logoBase64 }}" alt="{{ $solicitud->empresa ? $solicitud->empresa->nombre : 'Logo Empresa' }}" class="logo-img">
                </div>
            @endif
            <h1>{{ $solicitud->empresa ? $solicitud->empresa->nombre : 'Sistema de Solicitudes' }}</h1>
            <p>Notificación Oficial de Estado de Solicitud de Desembolso</p>
            <div class="badge-status">{{ $statusTitle }} • Solicitud #{{ $solicitud->id }}</div>
        </div>

        <!-- Body -->
        <div class="body-content">
            <p style="font-size: 15px; margin-top: 0;">Estimado(a) <strong>{{ $solicitud->solicitante ? $solicitud->solicitante->nombre_completo : 'Usuario' }}</strong>,</p>
            
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                @if($solicitud->estado === 'Aprobado_Jefatura')
                    Tu solicitud de pago #<strong>{{ $solicitud->id }}</strong> ha sido <strong>APROBADA POR JEFATURA</strong> y ha pasado al módulo de Contabilidad para la gestión del desembolso correspondiente.
                @elseif($solicitud->estado === 'Pagado')
                    ¡Buenas noticias! Tu solicitud de pago #<strong>{{ $solicitud->id }}</strong> ha sido <strong>PAGADA Y DESEMBOLSADA CON ÉXITO</strong> por el departamento de Contabilidad.
                @elseif($solicitud->estado === 'Observado')
                    Tu solicitud de pago #<strong>{{ $solicitud->id }}</strong> ha sido marcada como <strong>OBSERVADA</strong> y requiere corrección o subsanación de tu parte para continuar el proceso.
                @elseif($solicitud->estado === 'Rechazado')
                    Tu solicitud de pago #<strong>{{ $solicitud->id }}</strong> ha sido <strong>RECHAZADA</strong> por Jefatura.
                @else
                    El estado de tu solicitud de pago #<strong>{{ $solicitud->id }}</strong> ha sido actualizado a <strong>{{ $solicitud->estado }}</strong>.
                @endif
            </p>

            <!-- Monto Destacado -->
            <div class="amount-box">
                <div class="label">Monto Solicitado</div>
                <div class="value">{{ number_format($solicitud->monto, 2) }} {{ $solicitud->moneda }}</div>
            </div>

            @if($solicitud->comentarios_revision)
                <div class="comments-box">
                    <strong>📝 Comentarios / Observaciones Registradas:</strong><br>
                    <span style="font-style: italic;">"{{ $solicitud->comentarios_revision }}"</span>
                </div>
            @endif

            <!-- Ficha de la Solicitud -->
            <div class="info-card">
                <div class="grid">
                    <div class="row">
                        <div class="cell-label">Empresa Beneficiaria:</div>
                        <div class="cell-value"><strong style="color: {{ $primaryColor }};">{{ $solicitud->empresa ? $solicitud->empresa->nombre : 'N/A' }}</strong></div>
                    </div>
                    <div class="row">
                        <div class="cell-label">Proveedor / Beneficiario:</div>
                        <div class="cell-value">{{ $solicitud->proveedor ? $solicitud->proveedor->nombre_razon_social : 'N/A' }}</div>
                    </div>
                    <div class="row">
                        <div class="cell-label">Banco & Cuenta:</div>
                        <div class="cell-value">{{ $solicitud->proveedor ? $solicitud->proveedor->banco . ' - N° ' . $solicitud->proveedor->numero_cuenta : 'N/A' }}</div>
                    </div>
                    <div class="row">
                        <div class="cell-label">Tipo Documento:</div>
                        <div class="cell-value">{{ $solicitud->tipo_documento }} {{ $solicitud->emite_factura ? '(Con Factura SÍ)' : '(Sin Factura)' }}</div>
                    </div>
                    <div class="row">
                        <div class="cell-label">Modalidad Pago:</div>
                        <div class="cell-value">{{ $solicitud->modalidad_pago }}</div>
                    </div>
                    <div class="row">
                        <div class="cell-label">Revisado Por (Jefe):</div>
                        <div class="cell-value">{{ $solicitud->revisadoPorJefe ? $solicitud->revisadoPorJefe->nombre_completo : 'N/A' }}</div>
                    </div>
                    @if($solicitud->procesadoPorConta)
                        <div class="row">
                            <div class="cell-label">Procesado Por (Conta):</div>
                            <div class="cell-value">{{ $solicitud->procesadoPorConta->nombre_completo }}</div>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            Sistema Corporativo de Solicitudes de Pago (Fralak SRL • Dotmed SRL • CID SRL).<br>
            © {{ date('Y') }} Todos los derechos reservados.
        </div>
    </div>
</body>
</html>
