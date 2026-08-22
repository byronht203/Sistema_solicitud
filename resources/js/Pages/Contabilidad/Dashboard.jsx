import { useState } from 'react';
import ContabilidadLayout from '@/Layouts/ContabilidadLayout';
import { Link, useForm } from '@inertiajs/react';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    Building2,
    Truck,
    ArrowUpRight,
    Search,
    DollarSign,
    Receipt,
    CreditCard,
    FileCheck,
    Eye,
    Landmark,
    Copy,
    Check,
    X,
    FileText,
    Archive,
    Coins,
    Mail
} from 'lucide-react';

export default function Dashboard({ stats, solicitudesCajaChica = [], solicitudesRegulares = [], ultimosPagos = [], isCajaChica = false }) {
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [showMailModal, setShowMailModal] = useState(false);
    const [mailHtml, setMailHtml] = useState('');
    const [loadingMail, setLoadingMail] = useState(false);

    const openMailPreviewModal = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setLoadingMail(true);
        setShowMailModal(true);
        fetch(`/api/solicitudes/${solicitud.id}/comprobante-correo`)
            .then((res) => res.text())
            .then((html) => {
                setMailHtml(html);
                setLoadingMail(false);
            })
            .catch((err) => {
                console.error(err);
                setMailHtml('<div style="padding: 20px; color: red;">Error al cargar la vista previa del correo.</div>');
                setLoadingMail(false);
            });
    };

    const { data, setData, post, processing, reset, errors } = useForm({
        comentarios_revision: '',
        numero_comprobante: '',
    });

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const openPayModal = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setData({
            comentarios_revision: 'Pago verificado y transferencia realizada con éxito.',
            numero_comprobante: '',
        });
        setShowPayModal(true);
    };

    const openBankModal = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setShowBankModal(true);
    };

    const handleConfirmPayment = (e) => {
        e.preventDefault();
        if (!selectedSolicitud) return;

        post(route('contabilidad.solicitudes.procesar-pago', selectedSolicitud.id), {
            onSuccess: () => {
                setShowPayModal(false);
                setSelectedSolicitud(null);
                reset();
            },
        });
    };

    return (
        <ContabilidadLayout title={isCajaChica ? "Dashboard Caja Chica (Fralak SRL)" : "Dashboard Contable y Desembolsos"} badgePorPagar={stats.pendientesPagoCount}>
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 p-6 md:p-8 shadow-2xl mb-8">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-3">
                            <Landmark className="w-3.5 h-3.5" />
                            {isCajaChica ? 'Tesorería • Caja Chica Fralak SRL (Hasta 300 BOB)' : 'Tesorería Médica • Red Médica Corporativa'}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            {isCajaChica ? 'Desembolsos y Pagos de Caja Chica' : 'Desembolsos de Fondos & Compras Hospitalarias'}
                        </h2>
                        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                            {isCajaChica
                                ? 'Bandeja de auditoría y pago exclusivo para solicitudes de Caja Chica de Fralak SRL (Monto máximo 300 BOB).'
                                : 'Control contable de pagos y transferencias a proveedores de tecnología y equipamiento hospitalario para Fralak, Dotmed y CID.'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <Link
                            href={route('contabilidad.solicitudes', { tipo_monto: 'caja_chica' })}
                            className="px-4 py-2.5 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 hover:bg-cyan-600/30 text-cyan-300 font-bold text-xs flex items-center gap-2 transition"
                        >
                            <Coins className="w-4 h-4 text-cyan-400" />
                            <span>Caja Chica ({stats.cajaChicaPendientesCount})</span>
                        </Link>

                        {!isCajaChica && (
                            <Link
                                href={route('contabilidad.solicitudes', { tipo_monto: 'regular' })}
                                className="px-4 py-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center gap-2 transition"
                            >
                                <CreditCard className="w-4 h-4 text-indigo-400" />
                                <span>Regulares ({stats.regularesPendientesCount})</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isCajaChica ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-5 mb-8`}>
                {/* 1. Caja Chica (<= 300 BOB) */}
                <div className="rounded-3xl bg-slate-900 border border-cyan-500/30 p-5 shadow-xl relative overflow-hidden group hover:border-cyan-500/50 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                            Caja Chica (≤ 300 BOB)
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
                            <Coins className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-white">
                            {stats.cajaChicaPendientesCount}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Pagos menores en cola de desembolso
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-cyan-300">
                        <span>Total por pagar:</span>
                        <span className="font-bold text-white">Bs. {stats.cajaChicaMontoBOB.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* 2. Solicitudes Regulares (> 300 BOB / USD) - OCULTADO ESTRICTAMENTE PARA CAJA CHICA */}
                {!isCajaChica && (
                    <div className="rounded-3xl bg-slate-900 border border-indigo-500/30 p-5 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition duration-300">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                                Regulares / Mayores (&gt; 300 BOB / USD)
                            </span>
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                                <CreditCard className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-extrabold text-white">
                                {stats.regularesPendientesCount}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Pagos mayores a 300 BOB o USD
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                            <span>USD Pendiente:</span>
                            <span className="font-bold text-slate-200">$ {stats.regularesMontoUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                )}

                {/* 3. Total Pagadas */}
                <div className="rounded-3xl bg-slate-900 border border-emerald-500/30 p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            {isCajaChica ? 'Caja Chica Pagadas' : 'Total Pagadas'}
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-white">
                            {stats.pagadasCount}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            {isCajaChica ? 'Desembolsos completados de Caja Chica' : 'Desembolsos completados'}
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Total Pagado BOB:</span>
                        <span className="font-bold text-emerald-400">Bs. {stats.montoPagadoBOB.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* 4. Solicitudes Observadas */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                            En Observación
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-white">
                            {stats.observadasCount}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Devueltas para ajuste de documento/factura
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Proveedores Registrados:</span>
                        <span className="font-bold text-indigo-400">{stats.totalProveedores}</span>
                    </div>
                </div>
            </div>

            {/* BLOQUE 1: Solicitudes de CAJA CHICA (<= 300 BOB) */}
            <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-xl mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                <Coins className="w-5 h-5 text-cyan-400" />
                                Solicitudes de Caja Chica (≤ 300 BOB)
                            </h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Pagos de menor cuantía aprobados por jefatura para desembolso rápido
                        </p>
                    </div>

                    <Link
                        href={route('contabilidad.solicitudes', { estado: 'Aprobado_Jefatura', tipo_monto: 'caja_chica' })}
                        className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-bold border border-cyan-800 transition self-start sm:self-auto flex items-center gap-1.5"
                    >
                        <span>Ver Caja Chica ({stats.cajaChicaPendientesCount})</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                {solicitudesCajaChica.length === 0 ? (
                    <div className="text-center py-8 px-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 text-xs text-slate-400">
                        No hay solicitudes de Caja Chica (≤ 300 BOB) pendientes de pago.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-xl">ID / Empresa</th>
                                    <th className="px-4 py-3">Solicitante</th>
                                    <th className="px-4 py-3">Proveedor & Datos Bancarios</th>
                                    <th className="px-4 py-3">Monto (BOB)</th>
                                    <th className="px-4 py-3 text-right rounded-r-xl">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {solicitudesCajaChica.map((solicitud) => (
                                    <tr key={solicitud.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-cyan-400">#{solicitud.id}</span>
                                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px] font-bold border border-slate-700">
                                                    {solicitud.empresa?.nombre}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 max-w-xs" title={solicitud.motivo_descripcion}>
                                                {solicitud.motivo_descripcion}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold text-slate-200">
                                                {solicitud.solicitante?.nombre_completo || solicitud.solicitante?.nombre}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {solicitud.solicitante?.cargo || 'Solicitante'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-white">
                                                {solicitud.proveedor?.nombre_razon_social}
                                            </div>
                                            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                                                {solicitud.proveedor?.banco}: <span className="font-bold">{solicitud.proveedor?.numero_cuenta}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="text-sm font-extrabold text-cyan-300">
                                                Bs. {parseFloat(solicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                            </div>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                                {solicitud.modalidad_pago}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openMailPreviewModal(solicitud)}
                                                    className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition border border-indigo-500/30"
                                                    title="Ver Comprobante de Correo Enviado"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => openPayModal(solicitud)}
                                                    className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>Pagar Caja Chica</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* BLOQUE 2: Solicitudes REGULARES / MAYORES (> 300 BOB / USD) - Solo visible para Contabilidad General */}
            {!isCajaChica && (
                <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse" />
                                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-indigo-400" />
                                    Solicitudes Regulares / Mayores (&gt; 300 BOB o USD)
                                </h3>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Desembolsos mayores requeridos para contrataciones y pagos principales a proveedores
                            </p>
                        </div>

                        <Link
                            href={route('contabilidad.solicitudes', { estado: 'Aprobado_Jefatura', tipo_monto: 'regular' })}
                            className="px-4 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-xs font-bold border border-indigo-800 transition self-start sm:self-auto flex items-center gap-1.5"
                        >
                            <span>Ver Regulares ({stats.regularesPendientesCount})</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {solicitudesRegulares.length === 0 ? (
                        <div className="text-center py-8 px-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 text-xs text-slate-400">
                            No hay solicitudes regulares mayores pendientes de pago.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-300">
                                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-xl">ID / Empresa</th>
                                        <th className="px-4 py-3">Solicitante</th>
                                        <th className="px-4 py-3">Proveedor & Datos Bancarios</th>
                                        <th className="px-4 py-3">Monto & Moneda</th>
                                        <th className="px-4 py-3 text-right rounded-r-xl">Acciones de Pago</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {solicitudesRegulares.map((solicitud) => (
                                        <tr key={solicitud.id} className="hover:bg-slate-800/40 transition">
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-extrabold text-indigo-400">#{solicitud.id}</span>
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px] font-bold border border-slate-700">
                                                        {solicitud.empresa?.nombre}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 max-w-xs" title={solicitud.motivo_descripcion}>
                                                    {solicitud.motivo_descripcion}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div className="font-semibold text-slate-200">
                                                    {solicitud.solicitante?.nombre_completo || solicitud.solicitante?.nombre}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    {solicitud.solicitante?.cargo || 'Solicitante'}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-white flex items-center gap-1.5">
                                                    <span>{solicitud.proveedor?.nombre_razon_social}</span>
                                                </div>
                                                <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                                                    {solicitud.proveedor?.banco}: <span className="font-bold">{solicitud.proveedor?.numero_cuenta}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <div className="text-sm font-extrabold text-white">
                                                    {solicitud.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(solicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                                </div>
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                                    {solicitud.modalidad_pago}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openMailPreviewModal(solicitud)}
                                                        className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition border border-indigo-500/30"
                                                        title="Ver Comprobante de Correo Enviado"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => openPayModal(solicitud)}
                                                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>Procesar Pago</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Ultimos Pagos Historial */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">
                            Últimos Desembolsos Registrados
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Historial reciente de pagos completados por el equipo de Contabilidad
                        </p>
                    </div>
                    <Link
                        href={route('contabilidad.solicitudes', { estado: 'Pagado' })}
                        className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                    >
                        Ver historial completo <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ultimosPagos.map((pago) => (
                        <div key={pago.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-extrabold text-xs text-emerald-400">Solicitud #{pago.id}</span>
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    PAGADO
                                </span>
                            </div>

                            <h4 className="text-xs font-bold text-white truncate" title={pago.proveedor?.nombre_razon_social}>
                                {pago.proveedor?.nombre_razon_social}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {pago.motivo_descripcion}
                            </p>

                            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] text-slate-500 block">Monto Desembolsado</span>
                                    <span className="text-sm font-extrabold text-white">
                                        {pago.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(pago.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-slate-500 block">Procesado por</span>
                                    <span className="text-[11px] font-semibold text-slate-300">
                                        {pago.procesado_por_conta?.nombre || 'Contabilidad'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal: Registrar Pago / Desembolso */}
            {showPayModal && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowPayModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Procesar Desembolso</h3>
                                <p className="text-xs text-slate-400">Solicitud #{selectedSolicitud.id} - {selectedSolicitud.empresa?.nombre}</p>
                            </div>
                        </div>

                        {/* Provider Bank Card Summary */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                                Datos de Transferencia al Proveedor
                            </div>
                            <div className="space-y-1.5 text-xs text-slate-300">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Proveedor / Titular:</span>
                                    <span className="font-bold text-white">{selectedSolicitud.proveedor?.nombre_titular_cuenta || selectedSolicitud.proveedor?.nombre_razon_social}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Banco:</span>
                                    <span className="font-bold text-emerald-400">{selectedSolicitud.proveedor?.banco}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Nro. de Cuenta:</span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-mono font-bold text-white">{selectedSolicitud.proveedor?.numero_cuenta}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(selectedSolicitud.proveedor?.numero_cuenta, 'cuenta_modal')}
                                            className="p-1 text-slate-400 hover:text-emerald-400 transition"
                                            title="Copiar número de cuenta"
                                        >
                                            {copiedField === 'cuenta_modal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-slate-800">
                                    <span className="text-slate-400 font-semibold">Monto a Transferir:</span>
                                    <span className="text-base font-extrabold text-emerald-400">
                                        {selectedSolicitud.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(selectedSolicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleConfirmPayment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Nro. de Comprobante / Transacción Bancaria (Opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: TR-983021948"
                                    value={data.numero_comprobante}
                                    onChange={(e) => setData('numero_comprobante', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Comentario / Nota de Desembolso
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.comentarios_revision}
                                    onChange={(e) => setData('comentarios_revision', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowPayModal(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Confirmar Pago Registrar</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal: Vista Previa de Correo Enviado */}
            {showMailModal && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Comprobante de Notificación por Correo</h3>
                                    <p className="text-xs text-slate-400">Solicitud #{selectedSolicitud.id} • {selectedSolicitud.empresa?.nombre}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowMailModal(false); setSelectedSolicitud(null); setMailHtml(''); }}
                                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="py-4 flex-1 overflow-y-auto min-h-[400px]">
                            {loadingMail ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs font-semibold">Generando vista previa del correo HTML...</p>
                                </div>
                            ) : (
                                <iframe
                                    srcDoc={mailHtml}
                                    title="Vista Previa de Correo"
                                    className="w-full h-full min-h-[500px] rounded-2xl border border-slate-800 bg-white"
                                />
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
                            <button
                                type="button"
                                onClick={() => { setShowMailModal(false); setSelectedSolicitud(null); setMailHtml(''); }}
                                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
                            >
                                Cerrar Vista Previa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ContabilidadLayout>
    );
}
