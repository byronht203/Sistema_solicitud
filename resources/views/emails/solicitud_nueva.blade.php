<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitud de Pago #{{ $solicitud->id }}</title>
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
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(4px);
            padding: 5px 16px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            margin-top: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
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
        .actions-box {
            text-align: center;
            padding: 22px 0 10px 0;
            border-top: 1px solid #e2e8f0;
            margin-top: 25px;
        }
        .btn {
            display: inline-block;
            padding: 14px 28px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 14px;
            text-decoration: none;
            text-align: center;
            margin: 6px 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
        }
        .btn-approve {
            background-color: #10b981;
            color: #ffffff;
        }
        .btn-reject {
            background-color: #ef4444;
            color: #ffffff;
        }
        .reply-info {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 12px 16px;
            margin-top: 25px;
            font-size: 13px;
            color: #166534;
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
        <!-- Header con Logo Institucional Centrado -->
        <div class="header">
            @if($logoBase64)
                <div class="logo-container">
                    <img src="{{ $logoBase64 }}" alt="{{ $solicitud->empresa ? $solicitud->empresa->nombre : 'Logo Empresa' }}" class="logo-img">
                </div>
            @endif
            <h1>{{ $solicitud->empresa ? $solicitud->empresa->nombre : 'Sistema de Solicitudes' }}</h1>
            <p>Revisión y Aprobación de Solicitud de Desembolso de Fondos</p>
            <div class="badge-status">Solicitud #{{ $solicitud->id }} • {{ $solicitud->estado }}</div>
        </div>

        <!-- Body -->
        <div class="body-content">
            <p style="font-size: 15px; margin-top: 0;">Estimados <strong>Jefe de Área y Equipo de Contabilidad</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                Se ha registrado una nueva solicitud de desembolso de fondos para la empresa <strong>{{ $solicitud->empresa ? $solicitud->empresa->nombre : 'Corporativa' }}</strong>. El Jefe de Área debe dar la autorización correspondiente para habilitar el pago por parte de Contabilidad.
            </p>

            <!-- Monto Destacado -->
            <div class="amount-box">
                <div class="label">Monto Solicitado</div>
                <div class="value">{{ number_format($solicitud->monto, 2) }} {{ $solicitud->moneda }}</div>
            </div>

            <!-- Ficha de la Solicitud -->
            <div class="info-card">
                <div class="grid">
                    <div class="row">
                        <div class="cell-label">Empresa Beneficiaria:</div>
                        <div class="cell-value"><strong style="color: {{ $primaryColor }};">{{ $solicitud->empresa ? $solicitud->empresa->nombre : 'N/A' }}</strong></div>
                    </div>
                    <div class="row">
                        <div class="cell-label">Solicitante:</div>
                        <div class="cell-value">{{ $solicitud->solicitante ? $solicitud->solicitante->nombre_completo : 'N/A' }}</div>
                    </div>
                    <div class="row">
                        <div class="cell-label">Correo Corporativo:</div>
                        <div class="cell-value"><code style="color: {{ $primaryColor }}; font-weight: bold;">{{ $correoReplyTo }}</code></div>
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
                        <div class="cell-label">Fecha Solicitud:</div>
                        <div class="cell-value">{{ \Carbon\Carbon::parse($solicitud->fecha_solicitud)->format('d/m/Y') }}</div>
                    </div>
                    <div class="row">
                        <div class="cell-label" style="border-bottom: none;">Motivo / Descripción:</div>
                        <div class="cell-value" style="color: #334155; font-weight: normal; padding-top: 10px; border-bottom: none;">
                            {{ $solicitud->motivo_descripcion }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Botones de Acción Directa vía Signed URLs (Solo visibles mientras la solicitud esté Pendiente de revisión) -->
            @if($solicitud->estado === 'Pendiente')
                <div class="actions-box">
                    <p style="font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 15px;">
                        ACCIONES RÁPIDAS DE JEFATURA (Haga clic en la opción deseada):
                    </p>
                    <div>
                        <a href="{{ $urlAprobar }}" class="btn btn-approve">
                            ✅ APROBAR SOLICITUD
                        </a>
                        <a href="{{ $urlRechazar }}" class="btn btn-reject">
                            ❌ RECHAZAR SOLICITUD
                        </a>
                    </div>
                </div>
            @endif

            <!-- Información Dynamic Reply-To -->
            <div class="reply-info">
                ℹ️ <strong>Nota de Correspondencia:</strong> Al responder a este correo desde su cliente de email o Zoho Mail, su mensaje será dirigido automáticamente al correo corporativo del solicitante: <strong>{{ $correoReplyTo }}</strong>.
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
