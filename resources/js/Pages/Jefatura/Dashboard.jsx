import { useState } from 'react';
import JefaturaLayout from '@/Layouts/JefaturaLayout';
import { Link, useForm } from '@inertiajs/react';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Building2,
    Truck,
    ArrowUpRight,
    Search,
    DollarSign,
    Receipt,
    ShieldCheck,
    FileCheck,
    Eye,
    X,
    FileText,
    ThumbsUp,
    ThumbsDown,
    Mail
} from 'lucide-react';

export default function Dashboard({ stats, solicitudesPorAprobar = [], ultimasRevisiones = [] }) {
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [modalAction, setModalAction] = useState(null); // 'aprobar' | 'observar' | 'rechazar'
    const [showMailModal, setShowMailModal] = useState(false);
    const [mailHtml, setMailHtml] = useState('');
    const [loadingMail, setLoadingMail] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        comentarios_revision: '',
    });

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

    const openActionModal = (solicitud, action) => {
        setSelectedSolicitud(solicitud);
        setModalAction(action);
        let defaultNote = '';
        if (action === 'aprobar') defaultNote = 'Aprobado sin observaciones por jefatura.';
        setData({ comentarios_revision: defaultNote });
    };

    const handleConfirmAction = (e) => {
        e.preventDefault();
        if (!selectedSolicitud || !modalAction) return;

        let routeName = `jefatura.solicitudes.${modalAction}`;
        post(route(routeName, selectedSolicitud.id), {
            onSuccess: () => {
                setModalAction(null);
                setSelectedSolicitud(null);
                reset();
            },
        });
    };

    return (
        <JefaturaLayout title="Dashboard de Jefatura y Aprobaciones" badgePendientes={stats.pendientesCount}>
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 md:p-8 shadow-2xl mb-8">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-3">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Dirección Médica • Red Médica Corporativa
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            Aprobación de Solicitudes Médicas & Equipamiento
                        </h2>
                        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                            Audita y aprueba requerimientos de compras corporativas para distribución hospitalaria de Fralak, Dotmed y CID.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <Link
                            href={route('jefatura.solicitudes')}
                            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
                        >
                            <FileCheck className="w-4 h-4" />
                            <span>Revisar Pendientes ({stats.pendientesCount})</span>
                        </Link>
                        <Link
                            href={route('jefatura.proveedores')}
                            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 flex items-center gap-2 transition"
                        >
                            <Truck className="w-4 h-4" />
                            <span>Ver Proveedores</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* 1. Pendientes por Aprobar */}
                <div className="rounded-3xl bg-slate-900 border border-amber-500/30 p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                            Por Aprobar (Jefatura)
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5 animate-pulse" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-white">
                            {stats.pendientesCount}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Solicitudes esperando tu validación
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-amber-300">
                        <span>Requiere acción prioritaria</span>
                        <Link href={route('jefatura.solicitudes', { estado: 'Pendiente' })} className="hover:underline flex items-center gap-0.5">
                            Revisar <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* 2. Monto Pendiente BOB */}
                <div className="rounded-3xl bg-slate-900 border border-indigo-500/30 p-5 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                            Monto Pendiente BOB
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-extrabold text-white">
                            Bs. {stats.montoPendienteBOB.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Monto pendiente en Bolivianos
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>USD Pendiente:</span>
                        <span className="font-bold text-slate-200">$ {stats.montoPendienteUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* 3. Solicitudes Aprobadas */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Total Aprobadas
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-white">
                            {stats.aprobadasCount + stats.pagadasCount}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Aprobadas enviadas a Contabilidad
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Aprobado BOB total:</span>
                        <span className="font-bold text-emerald-400">Bs. {stats.montoAprobadoBOB.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* 4. Observadas y Rechazadas */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Observadas / Rechazadas
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-white">
                            {stats.observadasCount + stats.rechazadasCount}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Devueltas ({stats.observadasCount}) / Rechazadas ({stats.rechazadasCount})
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Proveedores Activos:</span>
                        <span className="font-bold text-indigo-400">{stats.totalProveedores}</span>
                    </div>
                </div>
            </div>

            {/* Pending Approvals Table Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                            <h3 className="text-lg font-bold text-white tracking-tight">
                                Solicitudes por Revisar y Aprobar
                            </h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Revisa el motivo, proveedor y adjunto antes de aprobar el gasto
                        </p>
                    </div>

                    <Link
                        href={route('jefatura.solicitudes', { estado: 'Pendiente' })}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition self-start sm:self-auto flex items-center gap-1.5"
                    >
                        <span>Ver todas ({stats.pendientesCount})</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                {solicitudesPorAprobar.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl bg-slate-950/50 border border-slate-800/60">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
                        <h4 className="text-base font-bold text-slate-300">¡No hay solicitudes pendientes de aprobación!</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                            Todas las solicitudes ingresadas han sido revisadas. Te notificaremos cuando ingresen nuevas solicitudes.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-xl">ID / Empresa</th>
                                    <th className="px-4 py-3">Solicitante</th>
                                    <th className="px-4 py-3">Proveedor / Destino</th>
                                    <th className="px-4 py-3">Monto & Moneda</th>
                                    <th className="px-4 py-3">Documento & Respaldo</th>
                                    <th className="px-4 py-3 text-right rounded-r-xl">Decisión Jefatura</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {solicitudesPorAprobar.map((solicitud) => (
                                    <tr key={solicitud.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-4 py-4 font-medium">
                                            <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-amber-400">#{solicitud.id}</span>
                                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px] font-bold border border-slate-700">
                                                    {solicitud.empresa?.nombre}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 max-w-xs" title={solicitud.motivo_descripcion}>
                                                {solicitud.motivo_descripcion}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                Fecha: {solicitud.fecha_solicitud}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-slate-200">
                                                {solicitud.solicitante?.nombre_completo || solicitud.solicitante?.nombre}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {solicitud.solicitante?.cargo || 'Solicitante'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="font-bold text-white">
                                                {solicitud.proveedor?.nombre_razon_social}
                                            </div>
                                            <div className="text-[11px] text-indigo-400 font-mono mt-0.5">
                                                NIT: {solicitud.proveedor?.nit_ci}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm font-extrabold text-white">
                                                {solicitud.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(solicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                            </div>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                                {solicitud.modalidad_pago}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">
                                                    {solicitud.tipo_documento}
                                                </span>
                                                {solicitud.emite_factura ? (
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                                        Factura SÍ
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]">
                                                        Sin Factura
                                                    </span>
                                                )}
                                            </div>
                                            {solicitud.archivo_respaldo_path && (
                                                <a
                                                    href={`/storage/${solicitud.archivo_respaldo_path}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[10px] text-cyan-400 hover:underline mt-1 block flex items-center gap-1 font-medium"
                                                >
                                                    <FileText className="w-3 h-3" /> Ver Documento Adjunto
                                                </a>
                                            )}
                                        </td>

                                        <td className="px-4 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openMailPreviewModal(solicitud)}
                                                    className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition border border-indigo-500/30"
                                                    title="Ver Comprobante de Correo Enviado"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => openActionModal(solicitud, 'aprobar')}
                                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1"
                                                >
                                                    <ThumbsUp className="w-3.5 h-3.5" />
                                                    <span>Aprobar</span>
                                                </button>

                                                <button
                                                    onClick={() => openActionModal(solicitud, 'observar')}
                                                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs border border-amber-500/30 transition flex items-center gap-1"
                                                >
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    <span>Observar</span>
                                                </button>

                                                <button
                                                    onClick={() => openActionModal(solicitud, 'rechazar')}
                                                    className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs border border-rose-500/30 transition flex items-center gap-1"
                                                >
                                                    <ThumbsDown className="w-3.5 h-3.5" />
                                                    <span>Rechazar</span>
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

            {/* Ultimas Revisiones Historial */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">
                            Últimas Revisiones de la Jefatura
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Historial reciente de decisiones tomadas por la jefatura
                        </p>
                    </div>
                    <Link
                        href={route('jefatura.solicitudes', { estado: 'Aprobado_Jefatura' })}
                        className="text-xs text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                    >
                        Ver todas las aprobadas <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ultimasRevisiones.map((sol) => (
                        <div key={sol.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-extrabold text-xs text-indigo-400">Solicitud #{sol.id}</span>
                                {sol.estado === 'Aprobado_Jefatura' && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        APROBADO
                                    </span>
                                )}
                                {sol.estado === 'Observado' && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                        OBSERVADO
                                    </span>
                                )}
                                {sol.estado === 'Rechazado' && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                        RECHAZADO
                                    </span>
                                )}
                            </div>

                            <h4 className="text-xs font-bold text-white truncate" title={sol.proveedor?.nombre_razon_social}>
                                {sol.proveedor?.nombre_razon_social}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {sol.motivo_descripcion}
                            </p>

                            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] text-slate-500 block">Monto Solicitado</span>
                                    <span className="text-sm font-extrabold text-white">
                                        {sol.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(sol.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-slate-500 block">Solicitante</span>
                                    <span className="text-[11px] font-semibold text-slate-300">
                                        {sol.solicitante?.nombre || 'Ejecutivo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Acción (Aprobar / Observar / Rechazar) */}
            {modalAction && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
                        <button
                            onClick={() => setModalAction(null)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            {modalAction === 'aprobar' && (
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                                    <ThumbsUp className="w-6 h-6" />
                                </div>
                            )}
                            {modalAction === 'observar' && (
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                            )}
                            {modalAction === 'rechazar' && (
                                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                                    <ThumbsDown className="w-6 h-6" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-white capitalize">
                                    {modalAction === 'aprobar' && 'Aprobar Solicitud'}
                                    {modalAction === 'observar' && 'Observar Solicitud'}
                                    {modalAction === 'rechazar' && 'Rechazar Solicitud'}
                                </h3>
                                <p className="text-xs text-slate-400">Solicitud #{selectedSolicitud.id} - {selectedSolicitud.empresa?.nombre}</p>
                            </div>
                        </div>

                        {/* Summary Box */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-5 text-xs text-slate-300 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Solicitante:</span>
                                <span className="font-bold text-white">{selectedSolicitud.solicitante?.nombre_completo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Proveedor:</span>
                                <span className="font-bold text-indigo-400">{selectedSolicitud.proveedor?.nombre_razon_social}</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t border-slate-800">
                                <span className="text-slate-300">Monto:</span>
                                <span className="text-base text-emerald-400">
                                    {selectedSolicitud.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(selectedSolicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleConfirmAction} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Comentario / Justificación de Jefatura {modalAction !== 'aprobar' && <span className="text-rose-400">*</span>}
                                </label>
                                <textarea
                                    rows={3}
                                    required={modalAction !== 'aprobar'}
                                    placeholder={
                                        modalAction === 'aprobar'
                                            ? 'Ej: Aprobado para pago inmediato...'
                                            : 'Indica las observaciones o razones del rechazo...'
                                    }
                                    value={data.comentarios_revision}
                                    onChange={(e) => setData('comentarios_revision', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setModalAction(null)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-1.5 ${
                                        modalAction === 'aprobar'
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                                            : modalAction === 'observar'
                                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                                    }`}
                                >
                                    <span>
                                        {modalAction === 'aprobar' && 'Confirmar Aprobación'}
                                        {modalAction === 'observar' && 'Confirmar Observación'}
                                        {modalAction === 'rechazar' && 'Confirmar Rechazo'}
                                    </span>
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
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
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
                                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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
        </JefaturaLayout>
    );
}
