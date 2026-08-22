import { useState } from 'react';
import ContabilidadLayout from '@/Layouts/ContabilidadLayout';
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
    CreditCard,
    Landmark,
    Copy,
    Check,
    X,
    MessageSquare,
    Eye,
    Download,
    Mail,
    Coins
} from 'lucide-react';

export default function Index({ solicitudes, empresas = [], proveedores = [], badgePorPagar = 0, badgeCajaChica = 0, badgeRegulares = 0, isCajaChica = false, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [estado, setEstado] = useState(filters.estado || 'Aprobado_Jefatura');
    const [tipoMonto, setTipoMonto] = useState(filters.tipo_monto || '');
    const [empresaId, setEmpresaId] = useState(filters.empresa_id || '');
    const [moneda, setMoneda] = useState(filters.moneda || '');

    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showObserveModal, setShowObserveModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showMailModal, setShowMailModal] = useState(false);
    const [mailHtml, setMailHtml] = useState('');
    const [loadingMail, setLoadingMail] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

    const { data: payData, setData: setPayData, post: postPay, processing: payProcessing, reset: resetPay } = useForm({
        comentarios_revision: '',
        numero_comprobante: '',
    });

    const { data: observeData, setData: setObserveData, post: postObserve, processing: observeProcessing, reset: resetObserve } = useForm({
        comentarios_revision: '',
    });

    const handleFilterSubmit = (e) => {
        e?.preventDefault();
        router.get(
            route('contabilidad.solicitudes'),
            { search, estado, tipo_monto: tipoMonto, empresa_id: empresaId, moneda },
            { preserveState: true, replace: true }
        );
    };

    const handleTabChange = (newEstado, newTipoMonto = '') => {
        setEstado(newEstado);
        setTipoMonto(newTipoMonto);
        router.get(
            route('contabilidad.solicitudes'),
            { search, estado: newEstado, tipo_monto: newTipoMonto, empresa_id: empresaId, moneda },
            { preserveState: true, replace: true }
        );
    };

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const openPayModal = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setPayData({
            comentarios_revision: 'Pago verificado y transferencia realizada con éxito.',
            numero_comprobante: '',
        });
        setShowPayModal(true);
    };

    const openObserveModal = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setObserveData({
            comentarios_revision: '',
        });
        setShowObserveModal(true);
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

    const handleConfirmPay = (e) => {
        e.preventDefault();
        if (!selectedSolicitud) return;

        postPay(route('contabilidad.solicitudes.procesar-pago', selectedSolicitud.id), {
            onSuccess: () => {
                setShowPayModal(false);
                setSelectedSolicitud(null);
                resetPay();
            },
        });
    };

    const handleConfirmObserve = (e) => {
        e.preventDefault();
        if (!selectedSolicitud) return;

        postObserve(route('contabilidad.solicitudes.observar', selectedSolicitud.id), {
            onSuccess: () => {
                setShowObserveModal(false);
                setSelectedSolicitud(null);
                resetObserve();
            },
        });
    };

    const getEstadoBadge = (solState) => {
        switch (solState) {
            case 'Aprobado_Jefatura':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold animate-pulse">
                        <Clock className="w-3.5 h-3.5" /> Aprobado Jefe (Por Pagar)
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
            case 'Pendiente':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" /> Pendiente Jefe
                    </span>
                );
            case 'Rechazado':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" /> Rechazado
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <ContabilidadLayout title={isCajaChica ? "Solicitudes Caja Chica (Fralak SRL)" : "Solicitudes por Pagar y Gestión Contable"} badgePorPagar={badgePorPagar}>
            {/* Top Title & Filters Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-emerald-400" />
                        <span>{isCajaChica ? 'Bandeja de Pagos - Caja Chica Fralak SRL' : 'Gestión de Pagos y Desembolsos'}</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        {isCajaChica
                            ? 'Revisa y procesa los desembolsos de Caja Chica exclusivamente para Fralak SRL (Monto máximo 300 BOB).'
                            : 'Revisa los datos bancarios, adjuntos de respaldo y procesa desembolsos separados por Caja Chica (≤ 300 BOB) o Pagos Regulares.'}
                    </p>
                </div>
            </div>

            {/* Workflow Quick Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3">
                <button
                    onClick={() => handleTabChange('Aprobado_Jefatura', '')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Aprobado_Jefatura' && tipoMonto === ''
                            ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <Clock className="w-4 h-4" />
                    <span>{isCajaChica ? 'Caja Chica por Pagar' : 'Todas por Desembolsar'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-950/40 text-amber-200">
                        {badgePorPagar}
                    </span>
                </button>

                {!isCajaChica && (
                    <button
                        onClick={() => handleTabChange('Aprobado_Jefatura', 'caja_chica')}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                            tipoMonto === 'caja_chica'
                                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-extrabold'
                                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                    >
                        <Coins className="w-4 h-4" />
                        <span>Caja Chica (≤ 300 BOB)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-950/40 text-cyan-200">
                            {badgeCajaChica}
                        </span>
                    </button>
                )}

                {!isCajaChica && (
                    <button
                        onClick={() => handleTabChange('Aprobado_Jefatura', 'regular')}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                            tipoMonto === 'regular'
                                ? 'bg-indigo-500 text-slate-950 shadow-lg shadow-indigo-500/20 font-extrabold'
                                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        <span>Regulares (&gt; 300 BOB / USD)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-950/40 text-indigo-200">
                            {badgeRegulares}
                        </span>
                    </button>
                )}

                <button
                    onClick={() => handleTabChange('Pagado', '')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Pagado'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Historial de Pagadas</span>
                </button>

                <button
                    onClick={() => handleTabChange('Observado', '')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Observado'
                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <AlertCircle className="w-4 h-4" />
                    <span>Observadas</span>
                </button>

                <button
                    onClick={() => handleTabChange('', '')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === '' && tipoMonto === ''
                            ? 'bg-slate-700 text-white shadow-lg'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <span>Ver Todas</span>
                </button>
            </div>

            {/* Filter Search Form */}
            <form onSubmit={handleFilterSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl mb-6">
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${isCajaChica ? 'lg:grid-cols-3' : 'lg:grid-cols-5'} gap-3`}>
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            placeholder="Buscar por motivo, proveedor, banco, nro cuenta..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    {!isCajaChica && (
                        <div>
                            <select
                                value={tipoMonto}
                                onChange={(e) => setTipoMonto(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                            >
                                <option value="">Tipo de Monto (Todos)</option>
                                <option value="caja_chica">Caja Chica (≤ 300 BOB)</option>
                                <option value="regular">Regular / Mayor (&gt; 300 BOB o USD)</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <select
                            value={empresaId}
                            onChange={(e) => setEmpresaId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            <option value="">Todas las Empresas</option>
                            {empresas.map((emp) => (
                                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {!isCajaChica && (
                        <div>
                            <select
                                value={moneda}
                                onChange={(e) => setMoneda(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="">Todas las Monedas</option>
                                <option value="BOB">BOB (Bolivianos)</option>
                                <option value="USD">USD (Dólares)</option>
                            </select>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
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
                            No existen registros con los criterios o estado seleccionado actualmente.
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
                                    <th className="px-4 py-3.5">Proveedor / Cuenta Bancaria</th>
                                    <th className="px-4 py-3.5">Monto & Moneda</th>
                                    <th className="px-4 py-3.5">Documento & Factura</th>
                                    <th className="px-4 py-3.5 text-right">Acciones de Contabilidad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {solicitudes.data.map((solicitud) => {
                                    const isCajaChica = solicitud.moneda === 'BOB' && parseFloat(solicitud.monto) <= 300;
                                    return (
                                        <tr key={solicitud.id} className="hover:bg-slate-800/40 transition">
                                            <td className="px-4 py-4 font-medium">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-extrabold text-emerald-400">#{solicitud.id}</span>
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px] font-bold border border-slate-700">
                                                        {solicitud.empresa?.nombre}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                        solicitud.tipo_solicitud === 'Caja Chica'
                                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                    }`}>
                                                        {solicitud.tipo_solicitud || 'Pago Proveedor'}
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
                                                        Aprobado por: <span className="text-slate-200 font-semibold">{solicitud.revisado_por_jefe.nombre}</span>
                                                    </div>
                                                )}
                                                {solicitud.procesado_por_conta && (
                                                    <div className="text-[10px] text-emerald-400 mt-0.5">
                                                        Pagado por: <span className="font-semibold">{solicitud.procesado_por_conta.nombre}</span>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="font-semibold text-slate-200">
                                                    {solicitud.solicitante?.nombre_completo || solicitud.solicitante?.nombre}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    {solicitud.solicitante?.cargo || 'Ejecutivo'}
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
                                                <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                                                    {solicitud.proveedor?.numero_cuenta ? (
                                                        `${solicitud.proveedor?.banco} - N° ${solicitud.proveedor?.numero_cuenta}`
                                                    ) : (
                                                        <span className="text-slate-400 italic text-[10px]">💵 Pago Efectivo / Presencial</span>
                                                    )}
                                                </div>
                                                {solicitud.proveedor?.nombre_titular_cuenta && (
                                                    <div className="text-[10px] text-slate-400">
                                                        Titular: {solicitud.proveedor?.nombre_titular_cuenta}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-extrabold ${isCajaChica ? 'text-cyan-300' : 'text-white'}`}>
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

                                                    {solicitud.estado === 'Aprobado_Jefatura' && (
                                                        <>
                                                            <button
                                                                onClick={() => openPayModal(solicitud)}
                                                                className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1 ${
                                                                    isCajaChica
                                                                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
                                                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                                                                }`}
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>{isCajaChica ? 'Pagar Caja Chica' : 'Pagar'}</span>
                                                            </button>

                                                            <button
                                                                onClick={() => openObserveModal(solicitud)}
                                                                className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs border border-rose-500/30 transition flex items-center gap-1"
                                                            >
                                                                <AlertCircle className="w-3.5 h-3.5" />
                                                                <span>Observar</span>
                                                            </button>
                                                        </>
                                                    )}

                                                    {solicitud.estado === 'Pagado' && (
                                                        <span className="text-[10px] font-bold text-emerald-400 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                                            Completado
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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
                                            ? 'bg-emerald-600 text-white font-bold'
                                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                                    } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Registrar Desembolso / Pago */}
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
                                <h3 className="text-lg font-bold text-white">Confirmar Desembolso de Pago</h3>
                                <p className="text-xs text-slate-400">Solicitud #{selectedSolicitud.id} - {selectedSolicitud.empresa?.nombre}</p>
                            </div>
                        </div>

                        {/* Provider Bank Info Summary */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-5 text-xs text-slate-300 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Proveedor:</span>
                                <span className="font-bold text-white">{selectedSolicitud.proveedor?.nombre_razon_social}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Banco:</span>
                                <span className="font-bold text-emerald-400">{selectedSolicitud.proveedor?.banco}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">N° Cuenta:</span>
                                <div className="flex items-center gap-1">
                                    <span className="font-mono font-bold text-white">{selectedSolicitud.proveedor?.numero_cuenta}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(selectedSolicitud.proveedor?.numero_cuenta, 'modal_cta')}
                                        className="p-1 text-slate-400 hover:text-emerald-400"
                                    >
                                        {copiedField === 'modal_cta' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                                <span className="text-slate-300">Monto total:</span>
                                <span className="text-base text-emerald-400">
                                    {selectedSolicitud.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(selectedSolicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleConfirmPay} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Nro. de Comprobante / Transacción Bancaria
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: TR-00984920"
                                    value={payData.numero_comprobante}
                                    onChange={(e) => setPayData('numero_comprobante', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Notas del Desembolso
                                </label>
                                <textarea
                                    rows={3}
                                    value={payData.comentarios_revision}
                                    onChange={(e) => setPayData('comentarios_revision', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
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
                                    disabled={payProcessing}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Registrar Pago</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Observar Solicitud */}
            {showObserveModal && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowObserveModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Observar Solicitud de Pago</h3>
                                <p className="text-xs text-slate-400">Devolver solicitud #{selectedSolicitud.id} para corrección</p>
                            </div>
                        </div>

                        <form onSubmit={handleConfirmObserve} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Motivo / Detalle de la Observación <span className="text-rose-400">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    required
                                    placeholder="Indica el motivo (Ej: La factura digital adjunta no coincide con el NIT o falta la cotización previa)..."
                                    value={observeData.comentarios_revision}
                                    onChange={(e) => setObserveData('comentarios_revision', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowObserveModal(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={observeProcessing}
                                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Confirmar Observación</span>
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
                            <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Motivo y Descripción</h4>
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
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs mb-6">
                                <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                                    <MessageSquare className="w-4 h-4" /> Comentarios de Revisión / Desembolso:
                                </h4>
                                <p className="text-amber-200/90">{selectedSolicitud.comentarios_revision}</p>
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
        </ContabilidadLayout>
    );
}
