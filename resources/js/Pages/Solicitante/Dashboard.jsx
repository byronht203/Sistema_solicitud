import { useState, useEffect } from 'react';
import SolicitanteLayout from '@/Layouts/SolicitanteLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import ContabilidadMultiSelect from '@/Components/ContabilidadMultiSelect';
import JefeMultiSelect from '@/Components/JefeMultiSelect';
import ProveedorSearchSelect from '@/Components/ProveedorSearchSelect';
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
    PlusCircle,
    FilePlus,
    FileText,
    Eye,
    X,
    Send,
    Upload,
    Mail
} from 'lucide-react';

export default function Dashboard({ stats, solicitudesRecientes = [], empresas = [], proveedores = [], jefes = [], contabilidades = [] }) {
    const { auth } = usePage().props;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [showMailModal, setShowMailModal] = useState(false);
    const [mailHtml, setMailHtml] = useState('');
    const [loadingMail, setLoadingMail] = useState(false);
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

    const getFilteredJefes = (empId) => {
        if (!empId) return jefes;
        const filtered = jefes.filter((j) => (j.empresas || []).some((e) => e.id == empId));
        return filtered.length > 0 ? filtered : jefes;
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
        if (empresas.length > 0 && !data.jefe_id) {
            const initEmpId = empresas[0].id;
            const initJefes = getFilteredJefes(initEmpId);
            const initContas = getFilteredContabilidades(initEmpId, data.tipo_solicitud, data.monto, data.moneda);
            setData((prev) => ({
                ...prev,
                empresa_id: initEmpId,
                jefe_id: initJefes.length > 0 ? initJefes[0].id : '',
                contabilidad_ids: initContas.length > 0 ? [initContas[0].id] : [],
                contabilidad_id: initContas.length > 0 ? initContas[0].id : '',
            }));
        }
    }, [empresas]);

    const handleEmpresaChange = (newEmpId) => {
        const filteredJ = getFilteredJefes(newEmpId);
        const filteredC = getFilteredContabilidades(newEmpId, data.tipo_solicitud, data.monto, data.moneda);
        setData((prev) => ({
            ...prev,
            empresa_id: newEmpId,
            jefe_id: filteredJ.length > 0 ? filteredJ[0].id : '',
            contabilidad_ids: filteredC.length > 0 ? [filteredC[0].id] : [],
            contabilidad_id: filteredC.length > 0 ? filteredC[0].id : '',
        }));
    };

    const getSolicitanteEmail = (empId) => {
        if (!empId || !auth?.user) return null;
        const empPivot = (auth.user.empresas || []).find((e) => e.id == empId);
        if (empPivot && empPivot.pivot && empPivot.pivot.correo_corporativo) {
            return empPivot.pivot.correo_corporativo;
        }
        const otraEmp = (auth.user.empresas || []).find((e) => e.pivot && e.pivot.correo_corporativo);
        if (otraEmp && otraEmp.pivot && otraEmp.pivot.correo_corporativo) {
            return otraEmp.pivot.correo_corporativo;
        }
        return auth.user.correo;
    };

    const getSelectedJefeEmail = (jefeId, empId) => {
        if (!jefeId) return null;
        const jefe = jefes.find((j) => j.id == jefeId);
        if (!jefe) return null;
        if (empId) {
            const empPivot = (jefe.empresas || []).find((e) => e.id == empId);
            if (empPivot && empPivot.pivot && empPivot.pivot.correo_corporativo) {
                return empPivot.pivot.correo_corporativo;
            }
            const otraEmp = (jefe.empresas || []).find((e) => e.pivot && e.pivot.correo_corporativo);
            if (otraEmp && otraEmp.pivot && otraEmp.pivot.correo_corporativo) {
                return otraEmp.pivot.correo_corporativo;
            }
        }
        return jefe.correo;
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
            const otraEmp = (conta.empresas || []).find((e) => e.pivot && e.pivot.correo_corporativo);
            if (otraEmp && otraEmp.pivot && otraEmp.pivot.correo_corporativo) {
                return otraEmp.pivot.correo_corporativo;
            }
        }
        return conta.correo;
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('solicitante.solicitudes.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            },
        });
    };

    const getWorkflowStep = (solState) => {
        switch (solState) {
            case 'Pendiente':
                return { step: 1, label: 'En revisión por Jefatura', color: 'amber' };
            case 'Aprobado_Jefatura':
                return { step: 2, label: 'Aprobado - En cola de Contabilidad', color: 'indigo' };
            case 'Pagado':
                return { step: 3, label: 'Pagado y Desembolsado', color: 'emerald' };
            case 'Observado':
                return { step: 0, label: 'Observado - Requiere Subsanación', color: 'rose' };
            case 'Rechazado':
                return { step: -1, label: 'Solicitud Rechazada', color: 'slate' };
            default:
                return { step: 1, label: 'En proceso', color: 'cyan' };
        }
    };

    return (
        <SolicitanteLayout title="Mi Panel de Solicitudes" badgeObservadas={stats.observadasCount}>
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-500/20 p-6 md:p-8 shadow-2xl mb-8">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 mb-3">
                            <Send className="w-3.5 h-3.5" />
                            Red Médica Corporativa • Fralak • Dotmed • CID
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            Solicitudes de Fondos & Equipamiento Hospitalario
                        </h2>
                        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                            Registra solicitudes de pago para la adquisición de insumos, mantenimiento y equipamiento para hospitales y centros médicos.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-cyan-600/30 transition-all transform hover:-translate-y-0.5"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>Nueva Solicitud de Pago</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* 1. Solicitudes enviadas */}
                <div className="rounded-3xl bg-slate-900 border border-cyan-500/30 p-5 shadow-xl relative overflow-hidden group hover:border-cyan-500/50 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                            Solicitudes Creadas
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-white">
                            {stats.misSolicitudesCount}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Total de solicitudes registradas
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Monto BOB Solicitado:</span>
                        <span className="font-bold text-white">Bs. {stats.montoSolicitadoBOB.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* 2. En Revisión Jefe */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                            En Revisión Jefe
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-white">
                            {stats.pendientesCount}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Esperando aprobación operacional
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>En Contabilidad:</span>
                        <span className="font-bold text-indigo-400">{stats.aprobadasJefeCount} solicitudes</span>
                    </div>
                </div>

                {/* 3. Pagadas exitosamente */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            Pagadas con Éxito
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
                            Desembolsos completados por Conta
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>USD Solicitado total:</span>
                        <span className="font-bold text-emerald-400">$ {stats.montoSolicitadoUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* 4. Observadas (Atención requerida) */}
                <div className="rounded-3xl bg-slate-900 border border-amber-500/30 p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                            Observadas (Atención)
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center justify-center font-bold">
                            <AlertCircle className="w-5 h-5 animate-pulse" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-white">
                            {stats.observadasCount}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Requieren subsanación de factura o datos
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-amber-300">
                        <span>Acción requerida</span>
                        <Link href={route('solicitante.solicitudes', { estado: 'Observado' })} className="hover:underline flex items-center gap-0.5">
                            Subsanar <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Solicitudes Recientes y Timeline Tracker */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">
                            Estado y Seguimiento de mis Solicitudes
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Visualiza la trazabilidad del proceso de tus solicitudes en tiempo real
                        </p>
                    </div>

                    <Link
                        href={route('solicitante.solicitudes')}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition self-start sm:self-auto flex items-center gap-1.5"
                    >
                        <span>Ver mis solicitudes complejas</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="space-y-4">
                    {solicitudesRecientes.map((sol) => {
                        const stepInfo = getWorkflowStep(sol.estado);
                        return (
                            <div key={sol.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-extrabold text-xs text-cyan-400">Solicitud #{sol.id}</span>
                                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[10px] font-bold">
                                                {sol.empresa?.nombre}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                                {sol.fecha_solicitud}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-white">
                                            {sol.proveedor?.nombre_razon_social}
                                        </h4>
                                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                            {sol.motivo_descripcion}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-right">
                                            <span className="text-[10px] text-slate-500 block">Monto</span>
                                            <span className="text-base font-extrabold text-white">
                                                {sol.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(sol.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        {/* Status Badge & Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openMailPreviewModal(sol)}
                                                className="p-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition border border-indigo-500/30"
                                                title="Ver Comprobante de Correo Enviado"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </button>

                                            <div className="text-right">
                                                {sol.estado === 'Pendiente' && (
                                                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold inline-block">
                                                        En Revisión Jefe
                                                    </span>
                                                )}
                                                {sol.estado === 'Aprobado_Jefatura' && (
                                                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold inline-block">
                                                        En Cola de Pago
                                                    </span>
                                                )}
                                                {sol.estado === 'Pagado' && (
                                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold inline-block">
                                                        PAGADO
                                                    </span>
                                                )}
                                                {sol.estado === 'Observado' && (
                                                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold inline-block animate-pulse">
                                                        Observado (Subsanar)
                                                    </span>
                                                )}
                                                {sol.estado === 'Rechazado' && (
                                                    <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold inline-block">
                                                        Rechazado
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar Workflow */}
                                <div className="mt-3 pt-3 border-t border-slate-800/60">
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                        <span>Progreso:</span>
                                        <span className="font-semibold text-slate-300">{stepInfo.label}</span>
                                    </div>
                                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
                                        <div
                                            className={`h-full transition-all duration-500 ${
                                                sol.estado === 'Pagado'
                                                    ? 'bg-emerald-500 w-full'
                                                    : sol.estado === 'Aprobado_Jefatura'
                                                    ? 'bg-indigo-500 w-2/3'
                                                    : sol.estado === 'Pendiente'
                                                    ? 'bg-amber-400 w-1/3'
                                                    : sol.estado === 'Observado'
                                                    ? 'bg-amber-500 w-1/4 animate-pulse'
                                                    : 'bg-rose-500 w-full'
                                            }`}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal: Crear Nueva Solicitud */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl xl:max-w-6xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                                <PlusCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Nueva Solicitud de Pago</h3>
                                <p className="text-xs text-slate-400">Completa los campos para enviar a aprobación</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Empresa Beneficiaria <span className="text-cyan-400">*</span>
                                    </label>
                                    <select
                                        required
                                        value={data.empresa_id}
                                        onChange={(e) => handleEmpresaChange(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-xl bg-slate-950 border ${getEmpresaColorInfo(data.empresa_id).borderClass} text-xs focus:ring-2 outline-none font-bold ${getEmpresaColorInfo(data.empresa_id).textColor}`}
                                        style={{ color: getEmpresaColorInfo(data.empresa_id).hexColor }}
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
                                    {getSolicitanteEmail(data.empresa_id) && (
                                        <p className={`text-[10px] ${getEmpresaColorInfo(data.empresa_id).textColor} mt-1 font-mono`}>
                                            Origen: <strong>{getSolicitanteEmail(data.empresa_id)}</strong>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <JefeMultiSelect
                                        jefes={jefes}
                                        empresaId={data.empresa_id}
                                        selectedIds={data.jefe_ids || []}
                                        onChange={(ids) => setData((prev) => ({
                                            ...prev,
                                            jefe_ids: ids,
                                            jefe_id: ids.length > 0 ? ids[0] : '',
                                        }))}
                                        empresas={empresas}
                                        label="Jefe Aprobador"
                                    />
                                </div>

                                <div>
                                    <ContabilidadMultiSelect
                                        contabilidades={contabilidades}
                                        empresaId={data.empresa_id}
                                        tipoSol={data.tipo_solicitud}
                                        monto={data.monto}
                                        moneda={data.moneda}
                                        selectedIds={data.contabilidad_ids || []}
                                        onChange={(ids) => setData((prev) => ({
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
                                        selectedId={data.proveedor_id}
                                        onChange={(id) => setData('proveedor_id', id)}
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
                                    Motivo y Descripción Detallada del Gasto <span className="text-cyan-400">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Describe la justificación de la compra o servicio a pagar..."
                                    value={data.motivo_descripcion}
                                    onChange={(e) => setData('motivo_descripcion', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                        value={data.monto}
                                        onChange={(e) => setData('monto', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Moneda <span className="text-cyan-400">*</span>
                                    </label>
                                    <select
                                        value={data.moneda}
                                        onChange={(e) => setData('moneda', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                    >
                                        <option value="BOB">BOB (Bolivianos)</option>
                                        <option value="USD">USD (Dólares)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Tipo de Documento
                                    </label>
                                    <select
                                        value={data.tipo_documento}
                                        onChange={(e) => setData('tipo_documento', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                    >
                                        <option value="Factura">Factura</option>
                                        <option value="Recibo">Recibo</option>
                                        <option value="Contrato">Contrato</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        ¿Emite Factura?
                                    </label>
                                    <select
                                        value={data.emite_factura ? '1' : '0'}
                                        onChange={(e) => setData('emite_factura', e.target.value === '1')}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                    >
                                        <option value="1">SÍ Emite Factura</option>
                                        <option value="0">NO Emite Factura</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Modalidad de Pago
                                    </label>
                                    <select
                                        value={data.modalidad_pago}
                                        onChange={(e) => setData('modalidad_pago', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                    >
                                        <option value="Transferencia">Transferencia</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="QR">QR</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Archivo Respaldo (PDF o Imagen JPG/PNG - Máx 5MB)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setData('archivo_respaldo', e.target.files[0])}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition flex items-center gap-1.5"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Enviar Solicitud</span>
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
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
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
                                    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
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
        </SolicitanteLayout>
    );
}
