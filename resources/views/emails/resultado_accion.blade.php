<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $titulo ?? 'Resultado de Acción' }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 40px 15px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
        }
        .card {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.01);
            border: 1px solid #e2e8f0;
            max-width: 520px;
            width: 100%;
            padding: 40px;
            text-align: center;
        }
        .icon-box {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px auto;
            font-size: 36px;
        }
        .icon-success {
            background-color: #d1fae5;
            color: #059669;
        }
        .icon-error {
            background-color: #fee2e2;
            color: #dc2626;
        }
        .icon-info {
            background-color: #dbeafe;
            color: #2563eb;
        }
        h2 {
            font-size: 22px;
            color: #0f172a;
            margin: 0 0 10px 0;
            font-weight: 700;
        }
        p {
            font-size: 15px;
            color: #475569;
            line-height: 1.6;
            margin: 0 0 25px 0;
        }
        .solicitud-details {
            background-color: #f1f5f9;
            border-radius: 10px;
            padding: 16px;
            text-align: left;
            margin-bottom: 25px;
            font-size: 14px;
        }
        .solicitud-details div {
            margin-bottom: 6px;
        }
        .solicitud-details div:last-child {
            margin-bottom: 0;
        }
        .btn-home {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="card">
        @if($tipo === 'success')
            <div class="icon-box icon-success">✅</div>
        @elseif($tipo === 'error')
            <div class="icon-box icon-error">❌</div>
        @else
            <div class="icon-box icon-info">ℹ️</div>
        @endif

        <h2>{{ $titulo }}</h2>
        <p>{{ $mensaje }}</p>

        @if(isset($solicitud))
            <div class="solicitud-details">
                <div><strong>Solicitud ID:</strong> #{{ $solicitud->id }}</div>
                <div><strong>Empresa:</strong> {{ $solicitud->empresa ? $solicitud->empresa->nombre : 'N/A' }}</div>
                <div><strong>Monto:</strong> {{ number_format($solicitud->monto, 2) }} {{ $solicitud->moneda }}</div>
                <div><strong>Estado Actual:</strong> <span style="font-weight:700;">{{ $solicitud->estado }}</span></div>
            </div>
        @endif

        <a href="{{ url('/dashboard') }}" class="btn-home">Ir a la Plataforma Web</a>
    </div>
</body>
</html>
