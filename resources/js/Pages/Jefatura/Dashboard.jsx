import { useState, useEffect } from 'react';
import JefaturaLayout from '@/Layouts/JefaturaLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import ContabilidadMultiSelect from '@/Components/ContabilidadMultiSelect';
import JefeMultiSelect from '@/Components/JefeMultiSelect';
import ProveedorSearchSelect from '@/Components/ProveedorSearchSelect';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Building2,
    Truck,
    ArrowUpRight,
    DollarSign,
    Receipt,
    ShieldCheck,
    FileCheck,
    Eye,
    X,
    FileText,
    ThumbsUp,
    ThumbsDown,
    Mail,
    Plus,
    Coins,
    CreditCard,
    FileSpreadsheet,
    Calendar,
    Paperclip,
    Send,
    PlusCircle
} from 'lucide-react';

export default function Dashboard({
    stats,
    solicitudesPorAprobar = [],
    misSolicitudesRecientes = [],
    ultimasRevisiones = [],
    empresas = [],
    proveedores = [],
    contabilidades = [],
    jefes = []
}) {
    const { auth } = usePage().props;
    const authUser = auth?.user;
    const isEduardo = (authUser?.nombre_completo || authUser?.nombre || '').toLowerCase().includes('eduardo') || 
                      (authUser?.cargo || '').toLowerCase().includes('auditor');

    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [modalAction, setModalAction] = useState(null); // 'aprobar' | 'observar' | 'rechazar'
    const [showMailModal, setShowMailModal] = useState(false);
    const [mailHtml, setMailHtml] = useState('');
    const [loadingMail, setLoadingMail] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showQuickProvModal, setShowQuickProvModal] = useState(false);

    const {
        data: provData,
        setData: setProvData,
        post: postProv,
        processing: provProcessing,
        reset: resetProv,
    } = useForm({
        nombre_razon_social: '',
        descripcion: '',
        nit_ci: '',
        banco: '',
        tipo_cuenta: 'Caja de Ahorro',
        numero_cuenta: '',
        nombre_titular_cuenta: '',
    });

    const handleQuickProvSubmit = (e) => {
        e.preventDefault();
        postProv(route('proveedores.store'), {
            onSuccess: () => {
                setShowQuickProvModal(false);
                resetProv();
            },
        });
    };

    const getFilteredContabilidades = (empId, tipoSol, montoNum, mon) => {
        if (!empId) return [];
        const selectedEmp = empresas.find((e) => e.id == empId);
        const empNombre = (selectedEmp?.nombre || '').toLowerCase();
        const isFralak = empNombre.includes('fralak');
        const isCajaChica = tipoSol === 'Caja Chica' || (mon === 'BOB' && Number(montoNum) > 0 && Number(montoNum) <= 300);

        return contabilidades.filter((c) => {
            const belongsToCompany = (c.empresas || []).some((e) => e.id == empId);
            if (!belongsToCompany) return false;

            const rol = (c.rol?.nombre || '').toLowerCase();
            const isUserCajaChica = rol.includes('caja chica') || rol.includes('cajachica');

            if (isFralak) {
                return isCajaChica ? isUserCajaChica : !isUserCajaChica;
            } else {
                return !isUserCajaChica;
            }
        });
    };

    const getSolicitanteEmail = (empId) => {
        if (!empId || !authUser) return '';
        const empPivot = (authUser.empresas || []).find((e) => Number(e.id) === Number(empId));
        if (empPivot && empPivot.pivot && empPivot.pivot.correo_corporativo) {
            return empPivot.pivot.correo_corporativo;
        }
        return authUser.correo || '';
    };

    const getEmpresaColorInfo = (empIdOrEmp) => {
        let name = '';
        if (typeof empIdOrEmp === 'object' && empIdOrEmp !== null) {
            name = empIdOrEmp.nombre || '';
        } else if (typeof empIdOrEmp === 'number' || typeof empIdOrEmp === 'string') {
            const found = empresas.find((e) => Number(e.id) === Number(empIdOrEmp));
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

    // Formulario de revisión / aprobación
    const { data: reviewData, setData: setReviewData, post: postReview, processing: reviewProcessing, reset: resetReview } = useForm({
        comentarios_revision: '',
    });

    // Formulario para crear solicitud directamente como Jefe
    const {
        data: createData,
        setData: setCreateData,
        post: postCreate,
        processing: createProcessing,
        reset: resetCreate,
        errors: createErrors
    } = useForm({
        empresa_id: empresas.length > 0 ? empresas[0].id : '',
        tipo_solicitud: 'Pago a Proveedor',
        jefe_id: '',
        jefe_ids: [],
        contabilidad_id: '',
        contabilidad_ids: [],
        proveedor_id: proveedores.length > 0 ? proveedores[0].id : '',
        motivo_descripcion: '',
        monto: '',
        moneda: 'BOB',
        tipo_documento: 'Factura',
        emite_factura: true,
        modalidad_pago: 'Transferencia',
        fecha_solicitud: new Date().toISOString().split('T')[0],
        archivo_respaldo: null,
    });

    useEffect(() => {
        if (empresas.length > 0 && !createData.contabilidad_id) {
            const initEmpId = empresas[0].id;
            const initContas = getFilteredContabilidades(initEmpId, createData.tipo_solicitud, createData.monto, createData.moneda);
            setCreateData((prev) => ({
                ...prev,
                empresa_id: initEmpId,
                contabilidad_ids: initContas.length > 0 ? [initContas[0].id] : [],
                contabilidad_id: initContas.length > 0 ? initContas[0].id : '',
            }));
        }
    }, [empresas]);

    const handleCreateEmpresaChange = (newEmpId) => {
        const filteredC = getFilteredContabilidades(newEmpId, createData.tipo_solicitud, createData.monto, createData.moneda);
        setCreateData((prev) => ({
            ...prev,
            empresa_id: newEmpId,
            contabilidad_ids: filteredC.length > 0 ? [filteredC[0].id] : [],
            contabilidad_id: filteredC.length > 0 ? filteredC[0].id : '',
        }));
    };

    const getSelectedContaEmail = (contaId, empId) => {
        if (!contaId) return null;
        const conta = contabilidades.find((c) => c.id == contaId);
        if (!conta) return null;
        if (empId) {
            const empPivot = (conta.empresas || []).find((e) => e.id == empId);
            if (empPivot && empPivot.pivot && empPivot.pivot.correo_corporativo) {
                return empPivot.pivot.correo_corporativo;
            }
        }
        return conta.correo;
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        postCreate(route('jefatura.solicitudes.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                resetCreate();
            },
        });
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

    const openActionModal = (solicitud, action) => {
        setSelectedSolicitud(solicitud);
        setModalAction(action);
        let defaultNote = '';
        if (action === 'aprobar') defaultNote = 'Aprobado sin observaciones por jefatura.';
        setReviewData({ comentarios_revision: defaultNote });
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

    return (
        <JefaturaLayout
            title="Dashboard de Jefatura y Aprobaciones"
            badgePendientes={stats.pendientesCount}
            badgeMisSolicitudes={stats.misSolicitudesCount}
        >
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 md:p-8 shadow-2xl mb-8">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-3">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Dirección & Jefatura de Área • Red Médica Corporativa
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            Aprobación & Emisión de Solicitudes
                        </h2>
                        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                            Aprueba solicitudes de tu equipo y emite directamente requerimientos de Caja Chica o Pagos a Proveedores hacia Contabilidad.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nueva Solicitud (Jefe)</span>
                        </button>

                        <Link
                            href={route('jefatura.solicitudes')}
                            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
                        >
                            <FileCheck className="w-4 h-4" />
                            <span>Por Aprobar ({stats.pendientesCount})</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* 1. Pendientes por Aprobar (Equipo) */}
                <div className="rounded-3xl bg-slate-900 border border-amber-500/30 p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                            Por Aprobar (Equipo)
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
                            Solicitudes de tu personal esperando tu firma
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-amber-300">
                        <span>Requiere tu visto bueno</span>
                        <Link href={route('jefatura.solicitudes', { estado: 'Pendiente' })} className="hover:underline flex items-center gap-0.5">
                            Revisar <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* 2. Mis Solicitudes Emitidas */}
                <div className="rounded-3xl bg-slate-900 border border-cyan-500/30 p-5 shadow-xl relative overflow-hidden group hover:border-cyan-500/50 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                            Mis Solicitudes (Jefe)
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
                            <FileSpreadsheet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-white">
                            {stats.misSolicitudesCount}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Emitidas directamente por ti
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-cyan-300">
                        <span>{stats.misPendientesPagoCount} en cola contable</span>
                        <Link href={route('jefatura.mis-solicitudes')} className="hover:underline flex items-center gap-0.5">
                            Ver mis solicitudes <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* 3. Desembolsos Aprobados */}
                <div className="rounded-3xl bg-slate-900 border border-indigo-500/30 p-5 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                            Monto Aprobado
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-extrabold text-white">
                            Bs. {stats.montoAprobadoBOB.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Total aprobado para desembolso
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>USD Aprobado:</span>
                        <span className="font-bold text-slate-200">$ {stats.montoAprobadoUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* 4. Solicitudes Pagadas */}
                <div className="rounded-3xl bg-slate-900 border border-emerald-500/30 p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            Mis Pagos Realizados
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                            <Receipt className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-white">
                            {stats.misPagadasCount}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Desembolsos completados por Tesorería
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{stats.misObservadasCount} en observación</span>
                        <Link href={route('jefatura.mis-solicitudes', { estado: 'Pagado' })} className="hover:underline text-emerald-400 flex items-center gap-0.5">
                            Historial <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* BLOQUE 1: Solicitudes de mi equipo por aprobar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-400" />
                                Solicitudes de Personal Pendientes de tu Aprobación
                            </h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Revisa el motivo, cotización/factura adjunta y autoriza el desembolso hacia Contabilidad
                        </p>
                    </div>

                    <Link
                        href={route('jefatura.solicitudes', { estado: 'Pendiente' })}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition self-start sm:self-auto flex items-center gap-1.5"
                    >
                        <span>Ver todas ({stats.pendientesCount})</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                {solicitudesPorAprobar.length === 0 ? (
                    <div className="text-center py-10 px-4 rounded-2xl bg-slate-950/50 border border-slate-800/60">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                        <p className="text-sm font-semibold text-white">¡Todo al día!</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            No tienes solicitudes de tu equipo pendientes de aprobación en este momento.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-xl">ID / Empresa</th>
                                    <th className="px-4 py-3">Solicitante</th>
                                    <th className="px-4 py-3">Proveedor / Beneficiario</th>
                                    <th className="px-4 py-3">Monto & Moneda</th>
                                    <th className="px-4 py-3">Fecha & Respaldo</th>
                                    <th className="px-4 py-3 text-right rounded-r-xl">Acciones de Aprobación</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {solicitudesPorAprobar.map((solicitud) => (
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
                                                <Truck className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{solicitud.proveedor?.nombre_razon_social}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                {solicitud.proveedor?.banco ? `${solicitud.proveedor.banco} • ` : ''}NIT: {solicitud.proveedor?.nit_ci || 'S/N'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="text-sm font-extrabold text-white">
                                                {solicitud.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(solicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                            </div>
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                                {solicitud.tipo_documento} {solicitud.emite_factura ? '(Con Factura)' : ''}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="text-[11px] text-slate-300">
                                                {solicitud.fecha_solicitud}
                                            </div>
                                            {solicitud.archivo_respaldo_path ? (
                                                <a
                                                    href={`/storage/${solicitud.archivo_respaldo_path}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 mt-0.5"
                                                >
                                                    <Paperclip className="w-3 h-3" /> Ver Adjunto
                                                </a>
                                            ) : (
                                                <span className="text-[10px] text-slate-500">Sin archivo</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openMailPreviewModal(solicitud)}
                                                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
                                                    title="Ver Comprobante de Correo Enviado"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => openActionModal(solicitud, 'aprobar')}
                                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1"
                                                >
                                                    <ThumbsUp className="w-3.5 h-3.5" />
                                                    <span>Aprobar</span>
                                                </button>

                                                <button
                                                    onClick={() => openActionModal(solicitud, 'observar')}
                                                    className="px-2.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-xs border border-amber-500/30 transition flex items-center gap-1"
                                                >
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    <span>Observar</span>
                                                </button>

                                                <button
                                                    onClick={() => openActionModal(solicitud, 'rechazar')}
                                                    className="p-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition border border-rose-500/30"
                                                    title="Rechazar Solicitud"
                                                >
                                                    <ThumbsDown className="w-4 h-4" />
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

            {/* BLOQUE 2: Mis Solicitudes Realizadas (Emitidas por Jefatura) */}
            <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-xl mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-cyan-400" />
                            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                                Mis Solicitudes Realizadas (Emitidas por Jefatura)
                            </h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Revisa el estado de desembolso contable de las solicitudes que has creado directamente
                        </p>
                    </div>

                    <Link
                        href={route('jefatura.mis-solicitudes')}
                        className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-bold border border-cyan-800 transition self-start sm:self-auto flex items-center gap-1.5"
                    >
                        <span>Ver todas mis solicitudes ({stats.misSolicitudesCount})</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                {misSolicitudesRecientes.length === 0 ? (
                    <div className="text-center py-8 px-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 text-xs text-slate-400">
                        Aún no has emitido solicitudes directamente como Jefe. Haz clic en "Nueva Solicitud (Jefe)" para crear una.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-xl">ID / Empresa</th>
                                    <th className="px-4 py-3">Tipo & Motivo</th>
                                    <th className="px-4 py-3">Proveedor</th>
                                    <th className="px-4 py-3">Monto & Moneda</th>
                                    <th className="px-4 py-3">Encargado Contable</th>
                                    <th className="px-4 py-3">Estado Actual</th>
                                    <th className="px-4 py-3 text-right rounded-r-xl">Comprobante</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {misSolicitudesRecientes.map((sol) => (
                                    <tr key={sol.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-cyan-400">#{sol.id}</span>
                                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px] font-bold border border-slate-700">
                                                    {sol.empresa?.nombre}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1">{sol.fecha_solicitud}</div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-extrabold uppercase">
                                                {sol.tipo_solicitud}
                                            </span>
                                            <div className="text-[11px] text-white mt-1 line-clamp-1 max-w-xs" title={sol.motivo_descripcion}>
                                                {sol.motivo_descripcion}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-white">{sol.proveedor?.nombre_razon_social}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                                {sol.proveedor?.banco}: {sol.proveedor?.numero_cuenta}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="text-sm font-extrabold text-white">
                                                {sol.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(sol.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                            </div>
                                            <span className="text-[10px] text-slate-400">{sol.modalidad_pago}</span>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold text-amber-300">
                                                {sol.contabilidad?.nombre_completo || 'Contabilidad General'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                                {sol.contabilidad?.correo}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            {sol.estado === 'Aprobado_Jefatura' && (
                                                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                                                    En cola de Pago
                                                </span>
                                            )}
                                            {sol.estado === 'Pagado' && (
                                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                                                    ✓ Desembolsado
                                                </span>
                                            )}
                                            {sol.estado === 'Observado' && (
                                                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
                                                    Observado por Conta
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => openMailPreviewModal(sol)}
                                                className="p-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white transition border border-cyan-500/30"
                                                title="Ver Comprobante de Correo Enviado"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL CREAR SOLICITUD DIRECTA PARA JEFATURA / AUDITORÍA */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-5xl xl:max-w-6xl w-full shadow-2xl my-8 relative max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                                    <PlusCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span>Nueva Solicitud de Desembolso</span>
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        {isEduardo 
                                            ? 'Completa los datos de la solicitud. Al ser emitida por Auditoría, será enviada a Gerencia para su aprobación.' 
                                            : 'Ingresa los datos para la autorización de fondos y desembolso contable.'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
                            {/* Banner informativo de flujo de Auditoría */}
                            {isEduardo && (
                                <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                                    <div className="text-xs text-indigo-200">
                                        <strong className="text-white">Flujo de Auditoría:</strong> Al emitir esta solicitud como Auditor ({authUser?.nombre_completo}), pasará a revisión y visto bueno de <strong>Gerencia</strong> antes del desembolso por Contabilidad.
                                    </div>
                                </div>
                            )}

                            {Object.keys(createErrors).length > 0 && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300">
                                    <strong className="block text-rose-200 mb-1">Por favor verifica los siguientes campos:</strong>
                                    <ul className="list-disc list-inside space-y-0.5">
                                        {Object.entries(createErrors).map(([field, msg]) => (
                                            <li key={field}>{msg}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* 4 Columnas: Empresa, Jefe/Gerente Aprobador, Contabilidad, Proveedor */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Empresa Beneficiaria <span className="text-cyan-400">*</span>
                                    </label>
                                    <select
                                        required
                                        value={createData.empresa_id}
                                        onChange={(e) => handleCreateEmpresaChange(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-xl bg-slate-950 border ${getEmpresaColorInfo(createData.empresa_id).borderClass} text-xs focus:ring-2 outline-none font-bold ${getEmpresaColorInfo(createData.empresa_id).textColor}`}
                                        style={{ color: getEmpresaColorInfo(createData.empresa_id).hexColor }}
                                    >
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
                                    {getSolicitanteEmail(createData.empresa_id) && (
                                        <p className={`text-[10px] ${getEmpresaColorInfo(createData.empresa_id).textColor} mt-1 font-mono`}>
                                            Origen: <strong>{getSolicitanteEmail(createData.empresa_id)}</strong>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <JefeMultiSelect
                                        jefes={jefes}
                                        empresaId={createData.empresa_id}
                                        selectedIds={createData.jefe_ids || []}
                                        onChange={(ids) => setCreateData((prev) => ({
                                            ...prev,
                                            jefe_ids: ids,
                                            jefe_id: ids.length > 0 ? ids[0] : '',
                                        }))}
                                        empresas={empresas}
                                        excludeUserId={authUser?.id}
                                        label={isEduardo ? "Gerente Aprobador" : "Jefe / Gerente Aprobador"}
                                    />
                                </div>

                                <div>
                                    <ContabilidadMultiSelect
                                        contabilidades={contabilidades}
                                        empresaId={createData.empresa_id}
                                        tipoSol={createData.tipo_solicitud}
                                        monto={createData.monto}
                                        moneda={createData.moneda}
                                        selectedIds={createData.contabilidad_ids || []}
                                        onChange={(ids) => setCreateData((prev) => ({
                                            ...prev,
                                            contabilidad_ids: ids,
                                            contabilidad_id: ids.length > 0 ? ids[0] : '',
                                        }))}
                                        empresas={empresas}
                                        label="Encargado Contabilidad"
                                    />
                                </div>

                                <div>
                                    <ProveedorSearchSelect
                                        proveedores={proveedores}
                                        selectedId={createData.proveedor_id}
                                        onChange={(id) => setCreateData('proveedor_id', id)}
                                        onOpenQuickCreate={(prefill) => {
                                            resetProv();
                                            if (prefill) setProvData('nombre_razon_social', prefill);
                                            setShowQuickProvModal(true);
                                        }}
                                        label="Proveedor / Beneficiario"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Motivo / Justificación del Gasto <span className="text-cyan-400">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    placeholder="Describe detalladamente el motivo de la compra, insumo médico o servicio hospitalario..."
                                    value={createData.motivo_descripcion}
                                    onChange={(e) => setCreateData('motivo_descripcion', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Monto <span className="text-cyan-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        placeholder="0.00"
                                        value={createData.monto}
                                        onChange={(e) => setCreateData('monto', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Moneda <span className="text-cyan-400">*</span>
                                    </label>
                                    <select
                                        required
                                        value={createData.moneda}
                                        onChange={(e) => setCreateData('moneda', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        <option value="BOB">BOB - Bolivianos</option>
                                        <option value="USD">USD - Dólares Americanos</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Tipo de Documento <span className="text-cyan-400">*</span>
                                    </label>
                                    <select
                                        required
                                        value={createData.tipo_documento}
                                        onChange={(e) => setCreateData('tipo_documento', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        <option value="Factura">Factura</option>
                                        <option value="Recibo">Recibo</option>
                                        <option value="Contrato">Contrato</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        ¿Emite Factura? <span className="text-cyan-400">*</span>
                                    </label>
                                    <select
                                        required
                                        value={createData.emite_factura ? 'true' : 'false'}
                                        onChange={(e) => setCreateData('emite_factura', e.target.value === 'true')}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        <option value="true">Sí (Con Crédito Fiscal)</option>
                                        <option value="false">No (Sin Factura)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Modalidad de Pago <span className="text-cyan-400">*</span>
                                    </label>
                                    <select
                                        required
                                        value={createData.modalidad_pago}
                                        onChange={(e) => setCreateData('modalidad_pago', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        <option value="Transferencia">Transferencia Bancaria</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Efectivo">Efectivo / Caja Chica</option>
                                        <option value="QR">Pago QR</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Fecha de Solicitud <span className="text-cyan-400">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={createData.fecha_solicitud}
                                        onChange={(e) => setCreateData('fecha_solicitud', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Documento / Proforma de Respaldo (PDF, JPG, PNG)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setCreateData('archivo_respaldo', e.target.files[0])}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs focus:ring-2 focus:ring-emerald-500 outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createProcessing}
                                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>{createProcessing ? 'Enviando...' : 'Emitir Solicitud'}</span>
                                </button>
                            </div>
                        </form>
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
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
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
                                    <Mail className="w-5 h-5 text-indigo-400" />
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

            {/* MODAL REGISTRO RÁPIDO DE PROVEEDOR */}
            {showQuickProvModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative my-8">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-indigo-400" />
                                    <span>Registrar Nuevo Proveedor</span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Guarda el proveedor para seleccionarlo en tus solicitudes
                                </p>
                            </div>
                            <button
                                onClick={() => setShowQuickProvModal(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleQuickProvSubmit} className="space-y-3 mt-3 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-300 mb-1">
                                    Nombre / Razón Social <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Distribuidora Médica Santa Cruz SRL"
                                    value={provData.nombre_razon_social}
                                    onChange={(e) => setProvData('nombre_razon_social', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-300 mb-1">Descripción / Rubro (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Insumos de laboratorio / Mantenimiento"
                                    value={provData.descripcion}
                                    onChange={(e) => setProvData('descripcion', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">NIT / CI (Opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 1029384756"
                                        value={provData.nit_ci}
                                        onChange={(e) => setProvData('nit_ci', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">Banco</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: BCP / Bisa"
                                        value={provData.banco}
                                        onChange={(e) => setProvData('banco', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">Tipo de Cuenta</label>
                                    <select
                                        value={provData.tipo_cuenta}
                                        onChange={(e) => setProvData('tipo_cuenta', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="Caja de Ahorro">Caja de Ahorro</option>
                                        <option value="Cuenta Corriente">Cuenta Corriente</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">Nro. de Cuenta</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 1234567890"
                                        value={provData.numero_cuenta}
                                        onChange={(e) => setProvData('numero_cuenta', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-300 mb-1">Titular de Cuenta</label>
                                <input
                                    type="text"
                                    placeholder="Nombre del titular"
                                    value={provData.nombre_titular_cuenta}
                                    onChange={(e) => setProvData('nombre_titular_cuenta', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowQuickProvModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={provProcessing}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1.5"
                                >
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>{provProcessing ? 'Guardando...' : 'Guardar Proveedor'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </JefaturaLayout>
    );
}
