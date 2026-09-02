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
    Mail,
    Paperclip,
    ArrowUpRight,
    ShieldCheck
} from 'lucide-react';

export default function Index({
    solicitudes,
    empresas = [],
    proveedores = [],
    badgePorAprobar = 0,
    badgeAprobadas = 0,
    badgeObservadas = 0,
    badgeMisSolicitudes = 0,
    activeEstado = 'Pendiente',
    filters = {}
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [estado, setEstado] = useState(filters.estado || activeEstado || 'Pendiente');
    const [empresaId, setEmpresaId] = useState(filters.empresa_id || '');
    const [moneda, setMoneda] = useState(filters.moneda || '');

    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [modalAction, setModalAction] = useState(null); // 'aprobar' | 'observar' | 'rechazar'
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showMailModal, setShowMailModal] = useState(false);
    const [mailHtml, setMailHtml] = useState('');
    const [loadingMail, setLoadingMail] = useState(false);

    const { data: reviewData, setData: setReviewData, post: postReview, processing: reviewProcessing, reset: resetReview } = useForm({
        comentarios_revision: '',
    });

    const getEmpresaColorInfo = (empIdOrEmp) => {
        let name = '';
        if (typeof empIdOrEmp === 'object' && empIdOrEmp !== null) {
            name = empIdOrEmp.nombre || '';
        } else if (typeof empIdOrEmp === 'number' || typeof empIdOrEmp === 'string') {
            const found = (empresas || []).find((e) => Number(e.id) === Number(empIdOrEmp));
            name = found?.nombre || '';
        }
        const lower = name.toLowerCase();
        if (lower.includes('fralak')) {
            return {
                textColor: 'text-rose-400',
                hexColor: '#fb7185', // Rojo Vino
                borderClass: 'border-rose-500/40 focus:ring-rose-500',
            };
        }
        if (lower.includes('dotmed')) {
            return {
                textColor: 'text-teal-400',
                hexColor: '#2dd4bf', // Verde Azulado
                borderClass: 'border-teal-500/40 focus:ring-teal-500',
            };
        }
        if (lower.includes('cid')) {
            return {
                textColor: 'text-sky-400',
                hexColor: '#38bdf8', // Azul Petróleo
                borderClass: 'border-sky-500/40 focus:ring-sky-500',
            };
        }
        return {
            textColor: 'text-emerald-400',
            hexColor: '#34d399',
            borderClass: 'border-slate-800 focus:ring-cyan-500',
        };
    };

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
        setReviewData({ comentarios_revision: defaultNote });
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
        postReview(route(routeName, selectedSolicitud.id), {
            onSuccess: () => {
                setModalAction(null);
                setSelectedSolicitud(null);
                resetReview();
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
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold">
                        <AlertCircle className="w-3.5 h-3.5" /> OBSERVADO
                    </span>
                );
            case 'Rechazado':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" /> RECHAZADO
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <JefaturaLayout
            title="Bandeja de Aprobaciones (Solicitudes de Personal)"
            badgePendientes={badgePorAprobar}
            badgeMisSolicitudes={badgeMisSolicitudes}
        >
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <CheckSquare className="w-6 h-6 text-amber-400" />
                        <span>Bandeja de Aprobaciones (Solicitudes de Equipo)</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Audita, aprueba, observa o rechaza las solicitudes enviadas por el personal dependiente de tu área.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={route('jefatura.mis-solicitudes')}
                        className="px-5 py-2.5 rounded-2xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold text-xs border border-cyan-800 transition flex items-center gap-2"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Ir a Mis Solicitudes ({badgeMisSolicitudes})</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Tabs */}
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
                    <span>Pendientes de Aprobación</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-950/40 text-amber-200">
                        {badgePorAprobar}
                    </span>
                </button>

                <button
                    onClick={() => handleTabChange('Aprobado_Jefatura')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Aprobado_Jefatura'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-extrabold'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprobadas por Mí</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-950 text-indigo-200">
                        {badgeAprobadas}
                    </span>
                </button>

                <button
                    onClick={() => handleTabChange('Observado')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Observado'
                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 font-extrabold'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <AlertCircle className="w-4 h-4" />
                    <span>En Observación</span>
                    {badgeObservadas > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-950 text-rose-300">
                            {badgeObservadas}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => handleTabChange('todas')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'todas'
                            ? 'bg-slate-700 text-white font-extrabold'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <span>Ver Todas del Equipo</span>
                </button>
            </div>

            {/* Filter Bar */}
            <form onSubmit={handleFilterSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            placeholder="Buscar por solicitante, proveedor o motivo..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                    </div>

                    <div>
                        <select
                            value={empresaId}
                            onChange={(e) => setEmpresaId(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl bg-slate-950 border ${getEmpresaColorInfo(empresaId).borderClass} text-xs focus:ring-2 outline-none font-bold ${empresaId ? getEmpresaColorInfo(empresaId).textColor : 'text-slate-300'}`}
                            style={empresaId ? { color: getEmpresaColorInfo(empresaId).hexColor } : {}}
                        >
                            <option value="" style={{ color: '#cbd5e1', backgroundColor: '#020617' }}>Todas las Empresas</option>
                            {empresas.map((emp) => {
                                const itemColor = getEmpresaColorInfo(emp);
                                return (
                                    <option
                                        key={emp.id}
                                        value={emp.id}
                                        style={{
                                            color: itemColor.hexColor,
                                            backgroundColor: '#020617',
                                            fontWeight: '700',
                                        }}
                                    >
                                        {emp.nombre}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div>
                        <select
                            value={moneda}
                            onChange={(e) => setMoneda(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                        >
                            <option value="">Todas las Monedas</option>
                            <option value="BOB">Bolivianos (BOB)</option>
                            <option value="USD">Dólares (USD)</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Filtrar</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setEmpresaId('');
                                setMoneda('');
                                router.get(route('jefatura.solicitudes', { estado: 'Pendiente' }));
                            }}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition"
                            title="Limpiar Filtros"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </form>

            {/* Solicitudes Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl mb-6 overflow-hidden">
                {solicitudes.data.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
                        <p className="text-sm font-semibold text-white">No hay solicitudes en esta sección</p>
                        <p className="text-xs mt-1">No hay solicitudes de personal con el estado seleccionado.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-xl">ID / Empresa</th>
                                    <th className="px-4 py-3">Solicitante</th>
                                    <th className="px-4 py-3">Tipo & Motivo</th>
                                    <th className="px-4 py-3">Proveedor / Beneficiario</th>
                                    <th className="px-4 py-3">Monto & Moneda</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 text-right rounded-r-xl">Acciones de Aprobación</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {solicitudes.data.map((sol) => (
                                    <tr key={sol.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-amber-400">#{sol.id}</span>
                                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px] font-bold border border-slate-700">
                                                    {sol.empresa?.nombre}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1">{sol.fecha_solicitud}</div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold text-white">
                                                {sol.solicitante?.nombre_completo}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {sol.solicitante?.cargo || 'Personal'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-extrabold uppercase">
                                                {sol.tipo_solicitud || 'Pago a Proveedor'}
                                            </span>
                                            <div className="text-[11px] text-slate-300 mt-1 line-clamp-1 max-w-xs" title={sol.motivo_descripcion}>
                                                {sol.motivo_descripcion}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-white flex items-center gap-1">
                                                <Truck className="w-3 h-3 text-slate-400" />
                                                <span>{sol.proveedor?.nombre_razon_social}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                                {sol.proveedor?.banco ? `${sol.proveedor.banco}: ` : ''}{sol.proveedor?.numero_cuenta || 'S/N'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="text-sm font-extrabold text-white">
                                                {sol.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(sol.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                            </div>
                                            <span className="text-[10px] text-slate-400">{sol.modalidad_pago}</span>
                                        </td>

                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            {getEstadoBadge(sol.estado)}
                                        </td>

                                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openDetailModal(sol)}
                                                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
                                                    title="Ver Detalle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => openMailPreviewModal(sol)}
                                                    className="p-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition border border-indigo-500/30"
                                                    title="Ver Comprobante de Correo"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>

                                                {/* Acciones de Revisión */}
                                                {sol.estado === 'Pendiente' && (
                                                    <>
                                                        <button
                                                            onClick={() => openActionModal(sol, 'aprobar')}
                                                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1"
                                                            title="Aprobar Solicitud"
                                                        >
                                                            <ThumbsUp className="w-3.5 h-3.5" />
                                                            <span>Aprobar</span>
                                                        </button>
                                                        <button
                                                            onClick={() => openActionModal(sol, 'observar')}
                                                            className="p-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white transition border border-amber-500/30"
                                                            title="Observar"
                                                        >
                                                            <AlertCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openActionModal(sol, 'rechazar')}
                                                            className="p-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition border border-rose-500/30"
                                                            title="Rechazar"
                                                        >
                                                            <ThumbsDown className="w-4 h-4" />
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
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs text-slate-400">
                        <span>Mostrando {solicitudes.from || 0} a {solicitudes.to || 0} de {solicitudes.total} registros</span>
                        <div className="flex gap-1">
                            {solicitudes.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                        link.active
                                            ? 'bg-amber-500 text-slate-950 font-bold'
                                            : link.url
                                            ? 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                                            : 'text-slate-600 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL DETALLE DE SOLICITUD */}
            {showDetailModal && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl relative my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-amber-400" />
                                    <span>Detalle de Solicitud #{selectedSolicitud.id}</span>
                                </h3>
                                <p className="text-xs text-slate-400">{selectedSolicitud.empresa?.nombre} • {selectedSolicitud.fecha_solicitud}</p>
                            </div>
                            <button
                                onClick={() => { setShowDetailModal(false); setSelectedSolicitud(null); }}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Solicitante:</span>
                                    <span className="text-white font-bold">{selectedSolicitud.solicitante?.nombre_completo}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Cargo / Rol:</span>
                                    <span className="text-slate-300">{selectedSolicitud.solicitante?.cargo || 'Personal'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Tipo de Requerimiento:</span>
                                    <span className="text-amber-400 font-bold">{selectedSolicitud.tipo_solicitud || 'Pago a Proveedor'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Estado Actual:</span>
                                    <div>{getEstadoBadge(selectedSolicitud.estado)}</div>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Proveedor:</span>
                                    <span className="text-white font-bold">{selectedSolicitud.proveedor?.nombre_razon_social}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">NIT / CI:</span>
                                    <span className="text-slate-300">{selectedSolicitud.proveedor?.nit_ci || 'No registrado'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Banco & Cuenta:</span>
                                    <span className="text-emerald-400 font-mono font-bold">
                                        {selectedSolicitud.proveedor?.banco}: {selectedSolicitud.proveedor?.numero_cuenta || 'S/N'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
                                <span className="text-slate-400 block mb-1 font-semibold">Motivo y Descripción:</span>
                                <p className="text-slate-200 leading-relaxed italic">"{selectedSolicitud.motivo_descripcion}"</p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-950 border border-amber-500/20 flex items-center justify-between">
                                <div>
                                    <span className="text-slate-400 text-[11px] block">Monto a Desembolsar</span>
                                    <span className="text-lg font-extrabold text-white">
                                        {selectedSolicitud.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(selectedSolicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="text-right text-[11px] text-slate-300">
                                    <div>{selectedSolicitud.modalidad_pago}</div>
                                    <div className="text-slate-400">{selectedSolicitud.tipo_documento} {selectedSolicitud.emite_factura ? '(Facturado)' : ''}</div>
                                </div>
                            </div>

                            {selectedSolicitud.archivo_respaldo_path && (
                                <div className="pt-2">
                                    <a
                                        href={`/storage/${selectedSolicitud.archivo_respaldo_path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold flex items-center justify-center gap-2 border border-slate-700 transition"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                        <span>Descargar / Ver Documento Adjunto</span>
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 mt-4 border-t border-slate-800">
                            <button
                                onClick={() => { setShowDetailModal(false); setSelectedSolicitud(null); }}
                                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE ACCIÓN DE REVISIÓN (APROBAR / OBSERVAR / RECHAZAR SOLICITUD DE EQUIPO) */}
            {modalAction && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                {modalAction === 'aprobar' && <ThumbsUp className="w-5 h-5 text-emerald-400" />}
                                {modalAction === 'observar' && <AlertCircle className="w-5 h-5 text-amber-400" />}
                                {modalAction === 'rechazar' && <ThumbsDown className="w-5 h-5 text-rose-400" />}
                                <span className="capitalize">{modalAction} Solicitud #{selectedSolicitud.id}</span>
                            </h3>
                            <button
                                onClick={() => { setModalAction(null); setSelectedSolicitud(null); }}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 mb-4 text-xs space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Solicitante:</span>
                                <span className="text-white font-semibold">{selectedSolicitud.solicitante?.nombre_completo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Proveedor:</span>
                                <span className="text-white font-semibold">{selectedSolicitud.proveedor?.nombre_razon_social}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Monto:</span>
                                <span className="text-emerald-400 font-bold">
                                    {selectedSolicitud.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(selectedSolicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleConfirmAction} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Comentarios u Observaciones de Jefatura:
                                </label>
                                <textarea
                                    required={modalAction !== 'aprobar'}
                                    rows={3}
                                    value={reviewData.comentarios_revision}
                                    onChange={(e) => setReviewData('comentarios_revision', e.target.value)}
                                    placeholder={
                                        modalAction === 'aprobar'
                                            ? 'Nota opcional de aprobación...'
                                            : 'Especifica la razón de la observación o rechazo...'
                                    }
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => { setModalAction(null); setSelectedSolicitud(null); }}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={reviewProcessing}
                                    className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition ${
                                        modalAction === 'aprobar'
                                            ? 'bg-emerald-600 hover:bg-emerald-500'
                                            : modalAction === 'observar'
                                            ? 'bg-amber-600 hover:bg-amber-500'
                                            : 'bg-rose-600 hover:bg-rose-500'
                                    }`}
                                >
                                    {reviewProcessing ? 'Procesando...' : `Confirmar ${modalAction}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL VISTA PREVIA COMPROBANTE DE CORREO */}
            {showMailModal && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-amber-400" />
                                    <span>Comprobante de Correo • Solicitud #{selectedSolicitud.id}</span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Plantilla corporativa despachada automáticamente a través del servidor de correos
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowMailModal(false); setSelectedSolicitud(null); }}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto my-4 p-4 rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-inner">
                            {loadingMail ? (
                                <div className="py-12 text-center text-slate-500 text-xs font-semibold">
                                    Cargando vista previa del correo...
                                </div>
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: mailHtml }} />
                            )}
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-800">
                            <button
                                onClick={() => { setShowMailModal(false); setSelectedSolicitud(null); }}
                                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </JefaturaLayout>
    );
}
