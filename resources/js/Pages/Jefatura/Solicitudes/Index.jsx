import { useState } from 'react';
import JefaturaLayout from '@/Layouts/JefaturaLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Search,
    Filter,
    FileSpreadsheet,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Building2,
    Truck,
    UserCircle,
    FileText,
    DollarSign,
    ThumbsUp,
    ThumbsDown,
    X,
    MessageSquare,
    Eye,
    CheckSquare,
    Mail
} from 'lucide-react';

export default function Index({ solicitudes, empresas = [], proveedores = [], badgePendientes = 0, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [estado, setEstado] = useState(filters.estado || 'Pendiente');
    const [empresaId, setEmpresaId] = useState(filters.empresa_id || '');
    const [moneda, setMoneda] = useState(filters.moneda || '');

    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [modalAction, setModalAction] = useState(null); // 'aprobar' | 'observar' | 'rechazar'
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showMailModal, setShowMailModal] = useState(false);
    const [mailHtml, setMailHtml] = useState('');
    const [loadingMail, setLoadingMail] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        comentarios_revision: '',
    });

    const handleFilterSubmit = (e) => {
        e?.preventDefault();
        router.get(
            route('jefatura.solicitudes'),
            { search, estado, empresa_id: empresaId, moneda },
            { preserveState: true, replace: true }
        );
    };

    const handleTabChange = (newEstado) => {
        setEstado(newEstado);
        router.get(
            route('jefatura.solicitudes'),
            { search, estado: newEstado, empresa_id: empresaId, moneda },
            { preserveState: true, replace: true }
        );
    };

    const openActionModal = (solicitud, action) => {
        setSelectedSolicitud(solicitud);
        setModalAction(action);
        let defaultNote = '';
        if (action === 'aprobar') defaultNote = 'Aprobado sin observaciones por jefatura.';
        setData({ comentarios_revision: defaultNote });
    };

    const openDetailModal = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setShowDetailModal(true);
    };

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

    const getEstadoBadge = (solState) => {
        switch (solState) {
            case 'Pendiente':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold animate-pulse">
                        <Clock className="w-3.5 h-3.5" /> Pendiente Revisión
                    </span>
                );
            case 'Aprobado_Jefatura':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aprobado Jefe
                    </span>
                );
            case 'Pagado':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PAGADO
                    </span>
                );
            case 'Observado':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                        <AlertCircle className="w-3.5 h-3.5" /> OBSERVADO
                    </span>
                );
            case 'Rechazado':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" /> RECHAZADO
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <JefaturaLayout title="Solicitudes por Aprobar" badgePendientes={badgePendientes}>
            {/* Top Title & Filters Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <CheckSquare className="w-6 h-6 text-indigo-400" />
                        <span>Bandeja de Revisión y Aprobación</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Valida la pertinencia de las solicitudes, montos y documentos adjuntos antes de derivar a Contabilidad.
                    </p>
                </div>
            </div>

            {/* Workflow Quick Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3">
                <button
                    onClick={() => handleTabChange('Pendiente')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Pendiente'
                            ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <Clock className="w-4 h-4" />
                    <span>Pendientes por Aprobar</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-950/40 text-amber-200">
                        {badgePendientes}
                    </span>
                </button>

                <button
                    onClick={() => handleTabChange('Aprobado_Jefatura')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Aprobado_Jefatura'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprobadas (Enviadas a Conta)</span>
                </button>

                <button
                    onClick={() => handleTabChange('Observado')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Observado'
                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <AlertCircle className="w-4 h-4" />
                    <span>Observadas</span>
                </button>

                <button
                    onClick={() => handleTabChange('Rechazado')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Rechazado'
                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <XCircle className="w-4 h-4" />
                    <span>Rechazadas</span>
                </button>

                <button
                    onClick={() => handleTabChange('')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === ''
                            ? 'bg-slate-700 text-white shadow-lg'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <span>Todas las Solicitudes</span>
                </button>
            </div>

            {/* Filter Search Form */}
            <form onSubmit={handleFilterSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            placeholder="Buscar por motivo, solicitante, proveedor..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <select
                            value={empresaId}
                            onChange={(e) => setEmpresaId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">Todas las Empresas</option>
                            {empresas.map((emp) => (
                                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <select
                            value={moneda}
                            onChange={(e) => setMoneda(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">Todas las Monedas</option>
                            <option value="BOB">BOB (Bolivianos)</option>
                            <option value="USD">USD (Dólares)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Aplicar Filtros</span>
                        </button>
                    </div>
                </div>
            </form>

            {/* Solicitudes Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                {solicitudes.data.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h4 className="text-base font-bold text-slate-300">No se encontraron solicitudes</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            No existen solicitudes con los criterios de búsqueda seleccionados.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-4 py-3.5">ID / Empresa</th>
                                    <th className="px-4 py-3.5">Estado & Trazabilidad</th>
                                    <th className="px-4 py-3.5">Solicitante</th>
                                    <th className="px-4 py-3.5">Proveedor</th>
                                    <th className="px-4 py-3.5">Monto & Pago</th>
                                    <th className="px-4 py-3.5">Documento & Factura</th>
                                    <th className="px-4 py-3.5 text-right">Decisión Jefatura</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {solicitudes.data.map((solicitud) => (
                                    <tr key={solicitud.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-4 py-4 font-medium">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-extrabold text-indigo-400">#{solicitud.id}</span>
                                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px] font-bold border border-slate-700">
                                                    {solicitud.empresa?.nombre}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                                    solicitud.tipo_solicitud === 'Caja Chica'
                                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                }`}>
                                                    {solicitud.tipo_solicitud || 'Pago a Proveedor'}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 max-w-xs" title={solicitud.motivo_descripcion}>
                                                {solicitud.motivo_descripcion}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                Fecha: {solicitud.fecha_solicitud}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div>{getEstadoBadge(solicitud.estado)}</div>
                                            {solicitud.revisado_por_jefe && (
                                                <div className="text-[10px] text-slate-400 mt-1">
                                                    Revisado por: <span className="text-slate-200 font-semibold">{solicitud.revisado_por_jefe.nombre}</span>
                                                </div>
                                            )}
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
                                            {solicitud.proveedor?.descripcion && (
                                                <div className="text-[10px] text-slate-400 italic line-clamp-1">
                                                    {solicitud.proveedor.descripcion}
                                                </div>
                                            )}
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                {solicitud.proveedor?.numero_cuenta ? (
                                                    `${solicitud.proveedor?.banco} - N° ${solicitud.proveedor?.numero_cuenta}`
                                                ) : (
                                                    <span className="text-slate-400 italic">💵 Pago Efectivo / Presencial</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm font-extrabold text-white">
                                                {solicitud.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(solicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                                    {solicitud.modalidad_pago}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap">
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
                                                    className="text-[10px] text-cyan-400 hover:underline mt-1 flex items-center gap-1 font-medium"
                                                >
                                                    <FileText className="w-3 h-3" /> Ver Adjunto Respaldo
                                                </a>
                                            )}
                                        </td>

                                        <td className="px-4 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openDetailModal(solicitud)}
                                                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                                    title="Ver Ficha Completa"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => openMailPreviewModal(solicitud)}
                                                    className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition border border-indigo-500/30"
                                                    title="Ver Comprobante de Correo Enviado"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>

                                                {solicitud.estado === 'Pendiente' && (
                                                    <>
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
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {solicitudes.links && solicitudes.links.length > 3 && (
                    <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
                        <div>
                            Mostrando {solicitudes.from} a {solicitudes.to} de {solicitudes.total} solicitudes
                        </div>
                        <div className="flex items-center gap-1">
                            {solicitudes.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                        link.active
                                            ? 'bg-indigo-600 text-white font-bold'
                                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                                    } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
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

            {/* Modal: Detalle Completo de Solicitud */}
            {showDetailModal && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-white">Solicitud de Pago #{selectedSolicitud.id}</h3>
                                    {getEstadoBadge(selectedSolicitud.estado)}
                                </div>
                                <p className="text-xs text-slate-400">Empresa: <span className="text-white font-semibold">{selectedSolicitud.empresa?.nombre}</span></p>
                            </div>
                        </div>

                        {/* Grid Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                                <h4 className="font-bold text-indigo-400 uppercase text-[10px] tracking-wider mb-2">Datos del Solicitante</h4>
                                <p className="text-white font-bold">{selectedSolicitud.solicitante?.nombre_completo}</p>
                                <p className="text-slate-400">{selectedSolicitud.solicitante?.cargo}</p>
                                <p className="text-slate-500 mt-1">CI: {selectedSolicitud.solicitante?.ci}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                                <h4 className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider mb-2">Proveedor / Beneficiario</h4>
                                <p className="text-white font-bold">{selectedSolicitud.proveedor?.nombre_razon_social}</p>
                                {selectedSolicitud.proveedor?.descripcion && (
                                    <p className="text-slate-400 italic text-[11px] mt-0.5">{selectedSolicitud.proveedor.descripcion}</p>
                                )}
                                {selectedSolicitud.proveedor?.numero_cuenta ? (
                                    <>
                                        <p className="text-emerald-400 font-bold mt-1">{selectedSolicitud.proveedor?.banco}</p>
                                        <p className="text-slate-300 font-mono text-[11px]">N° Cuenta: {selectedSolicitud.proveedor?.numero_cuenta}</p>
                                        <p className="text-slate-400 text-[11px]">Titular: {selectedSolicitud.proveedor?.nombre_titular_cuenta}</p>
                                    </>
                                ) : (
                                    <p className="text-amber-400/90 italic text-[11px] mt-1">💵 Pago en Efectivo / Presencial (Sin cuenta bancaria)</p>
                                )}
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs mb-6 space-y-2">
                            <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Motivo y Descripción de la Compra</h4>
                            <p className="text-slate-200 leading-relaxed">{selectedSolicitud.motivo_descripcion}</p>

                            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <span className="text-slate-500 block">Monto a pagar:</span>
                                    <span className="text-lg font-extrabold text-white">
                                        {selectedSolicitud.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(selectedSolicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-slate-500 block">Modalidad de Pago:</span>
                                    <span className="font-bold text-slate-200">{selectedSolicitud.modalidad_pago}</span>
                                </div>

                                <div>
                                    <span className="text-slate-500 block">Documento:</span>
                                    <span className="font-bold text-slate-200">{selectedSolicitud.tipo_documento} ({selectedSolicitud.emite_factura ? 'Con Factura' : 'Sin Factura'})</span>
                                </div>
                            </div>
                        </div>

                        {selectedSolicitud.comentarios_revision && (
                            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs mb-6">
                                <h4 className="font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
                                    <MessageSquare className="w-4 h-4" /> Comentarios de Revisión:
                                </h4>
                                <p className="text-indigo-200/90">{selectedSolicitud.comentarios_revision}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Previsualización de Comprobante de Correo */}
            {showMailModal && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[95vh] flex flex-col">
                        <button
                            onClick={() => setShowMailModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-lg shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Comprobante de Correo Enviado a Jefatura</h3>
                                <p className="text-xs text-slate-400">Previsualización exacta del Mailable para la Solicitud #{selectedSolicitud.id}</p>
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-2 overflow-hidden flex items-center justify-center min-h-[500px]">
                            {loadingMail ? (
                                <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-3">
                                    <Clock className="w-8 h-8 text-indigo-400 animate-spin" />
                                    <span>Generando vista previa HTML del correo...</span>
                                </div>
                            ) : (
                                <iframe
                                    srcDoc={mailHtml}
                                    title={`Comprobante Correo Solicitud #${selectedSolicitud.id}`}
                                    className="w-full h-full min-h-[520px] rounded-xl border-0 bg-white"
                                />
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-800">
                            <button
                                onClick={() => setShowMailModal(false)}
                                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
                            >
                                Cerrar Previsualización
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </JefaturaLayout>
    );
}
