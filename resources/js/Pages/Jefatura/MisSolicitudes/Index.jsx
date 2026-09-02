import { useState, useEffect } from 'react';
import JefaturaLayout from '@/Layouts/JefaturaLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import ContabilidadMultiSelect from '@/Components/ContabilidadMultiSelect';
import JefeMultiSelect from '@/Components/JefeMultiSelect';
import ProveedorSearchSelect from '@/Components/ProveedorSearchSelect';
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
    FileText,
    DollarSign,
    X,
    Eye,
    Mail,
    Plus,
    Paperclip,
    Edit3,
    Trash2,
    Send,
    ShieldCheck,
    Coins,
    CreditCard,
    PlusCircle
} from 'lucide-react';

export default function Index({
    solicitudes,
    empresas = [],
    proveedores = [],
    contabilidades = [],
    jefes = [],
    badgeTodas = 0,
    badgeEnCola = 0,
    badgePagadas = 0,
    badgeObservadas = 0,
    badgePorAprobar = 0,
    activeEstado = 'todas',
    filters = {}
}) {
    const { auth } = usePage().props;
    const authUser = auth?.user;
    const isEduardo = (authUser?.nombre_completo || authUser?.nombre || '').toLowerCase().includes('eduardo') || 
                      (authUser?.cargo || '').toLowerCase().includes('auditor');

    const [search, setSearch] = useState(filters.search || '');
    const [estado, setEstado] = useState(filters.estado || activeEstado || 'todas');
    const [empresaId, setEmpresaId] = useState(filters.empresa_id || '');
    const [moneda, setMoneda] = useState(filters.moneda || '');

    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showMailModal, setShowMailModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showQuickProvModal, setShowQuickProvModal] = useState(false);
    const [mailHtml, setMailHtml] = useState('');
    const [loadingMail, setLoadingMail] = useState(false);

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

    // Formulario para editar solicitud del Jefe
    const {
        data: editData,
        setData: setEditData,
        post: postEdit,
        processing: editProcessing,
        reset: resetEdit,
        errors: editErrors
    } = useForm({
        empresa_id: '',
        tipo_solicitud: 'Pago a Proveedor',
        jefe_id: '',
        jefe_ids: [],
        contabilidad_id: '',
        contabilidad_ids: [],
        proveedor_id: '',
        motivo_descripcion: '',
        monto: '',
        moneda: 'BOB',
        tipo_documento: 'Factura',
        emite_factura: true,
        modalidad_pago: 'Transferencia',
        fecha_solicitud: '',
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

    const handleEditEmpresaChange = (newEmpId) => {
        const filteredC = getFilteredContabilidades(newEmpId, editData.tipo_solicitud, editData.monto, editData.moneda);
        setEditData((prev) => ({
            ...prev,
            empresa_id: newEmpId,
            contabilidad_ids: filteredC.length > 0 ? [filteredC[0].id] : [],
            contabilidad_id: filteredC.length > 0 ? filteredC[0].id : '',
        }));
    };

    // Formulario rápido para crear nuevo proveedor
    const {
        data: provData,
        setData: setProvData,
        post: postProv,
        processing: provProcessing,
        reset: resetProv,
        errors: provErrors
    } = useForm({
        nombre_razon_social: '',
        descripcion: '',
        nit_ci: '',
        banco: '',
        tipo_cuenta: 'Caja de Ahorro',
        numero_cuenta: '',
        nombre_titular_cuenta: '',
    });

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

    const handleFilterSubmit = (e) => {
        e?.preventDefault();
        router.get(
            route('jefatura.mis-solicitudes'),
            { search, estado, empresa_id: empresaId, moneda },
            { preserveState: true, replace: true }
        );
    };

    const handleTabChange = (newEstado) => {
        setEstado(newEstado);
        router.get(
            route('jefatura.mis-solicitudes'),
            { search, estado: newEstado, empresa_id: empresaId, moneda },
            { preserveState: true, replace: true }
        );
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

    const openEditModal = (sol) => {
        setSelectedSolicitud(sol);
        const initialContaIds = Array.isArray(sol.contabilidad_ids) && sol.contabilidad_ids.length > 0
            ? sol.contabilidad_ids.map(Number)
            : (sol.contabilidad_id ? [Number(sol.contabilidad_id)] : []);

        const initialJefeIds = Array.isArray(sol.jefe_ids) && sol.jefe_ids.length > 0
            ? sol.jefe_ids.map(Number)
            : (sol.jefe_id ? [Number(sol.jefe_id)] : []);

        setEditData({
            empresa_id: sol.empresa_id,
            tipo_solicitud: sol.tipo_solicitud || 'Pago a Proveedor',
            jefe_id: sol.jefe_id || '',
            jefe_ids: initialJefeIds,
            contabilidad_id: sol.contabilidad_id || '',
            contabilidad_ids: initialContaIds,
            proveedor_id: sol.proveedor_id,
            motivo_descripcion: sol.motivo_descripcion,
            monto: sol.monto,
            moneda: sol.moneda,
            tipo_documento: sol.tipo_documento,
            emite_factura: Boolean(sol.emite_factura),
            modalidad_pago: sol.modalidad_pago,
            fecha_solicitud: sol.fecha_solicitud,
            archivo_respaldo: null,
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedSolicitud) return;
        postEdit(route('jefatura.solicitudes.update', selectedSolicitud.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedSolicitud(null);
                resetEdit();
            },
        });
    };

    const handleDeleteSolicitud = (sol) => {
        if (confirm(`¿Estás seguro de cancelar y eliminar tu solicitud #${sol.id}?`)) {
            router.delete(route('jefatura.solicitudes.destroy', sol.id));
        }
    };

    const handleQuickProvSubmit = (e) => {
        e.preventDefault();
        postProv(route('proveedores.store'), {
            onSuccess: () => {
                setShowQuickProvModal(false);
                resetProv();
            },
        });
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

    const getEstadoBadge = (solState) => {
        switch (solState) {
            case 'Aprobado_Jefatura':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold animate-pulse">
                        <Clock className="w-3.5 h-3.5" /> En Cola de Pago
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
                        <Clock className="w-3.5 h-3.5" /> En Proceso
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
        <JefaturaLayout
            title="Mis Solicitudes Realizadas (Jefe de Área)"
            badgePendientes={badgePorAprobar}
            badgeMisSolicitudes={badgeTodas}
        >
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
                        <span>Mis Solicitudes Realizadas</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Historial y seguimiento de solicitudes de Caja Chica y Pagos a Proveedores emitidas directamente por ti hacia Contabilidad.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={() => setShowQuickProvModal(true)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
                    >
                        <Truck className="w-4 h-4 text-slate-400" />
                        <span>+ Registrar Proveedor</span>
                    </button>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nueva Solicitud (Jefe)</span>
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3">
                <button
                    onClick={() => handleTabChange('todas')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'todas'
                            ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-extrabold'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Todas mis solicitudes</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-950/40 text-cyan-200">
                        {badgeTodas}
                    </span>
                </button>

                <button
                    onClick={() => handleTabChange('Aprobado_Jefatura')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Aprobado_Jefatura'
                            ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <Clock className="w-4 h-4" />
                    <span>En Cola de Pago</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-950/40 text-amber-200">
                        {badgeEnCola}
                    </span>
                </button>

                <button
                    onClick={() => handleTabChange('Pagado')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Pagado'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-extrabold'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pagadas / Desembolsadas</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-200">
                        {badgePagadas}
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
            </div>

            {/* Filters Bar */}
            <form onSubmit={handleFilterSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            placeholder="Buscar por proveedor o motivo..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
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
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                        >
                            <option value="">Todas las Monedas</option>
                            <option value="BOB">Bolivianos (BOB)</option>
                            <option value="USD">Dólares (USD)</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
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
                                router.get(route('jefatura.mis-solicitudes'));
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
                        <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-white">No tienes solicitudes registradas en esta sección</p>
                        <p className="text-xs mt-1">Haz clic en "Nueva Solicitud (Jefe)" para emitir un nuevo requerimiento de pago.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-xl">ID / Empresa</th>
                                    <th className="px-4 py-3">Tipo & Motivo</th>
                                    <th className="px-4 py-3">Proveedor / Beneficiario</th>
                                    <th className="px-4 py-3">Monto & Moneda</th>
                                    <th className="px-4 py-3">Encargado Contable</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 text-right rounded-r-xl">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {solicitudes.data.map((sol) => (
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

                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold text-amber-300">
                                                {sol.contabilidad?.nombre_completo || 'Contabilidad General'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                                {sol.contabilidad?.correo}
                                            </div>
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
                                                    className="p-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white transition border border-cyan-500/30"
                                                    title="Ver Comprobante de Correo"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>

                                                {sol.estado === 'Observado' && (
                                                    <button
                                                        onClick={() => openEditModal(sol)}
                                                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1"
                                                        title="Editar / Subsanar Observación"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                        <span>Subsanar</span>
                                                    </button>
                                                )}

                                                {sol.estado !== 'Pagado' && (
                                                    <button
                                                        onClick={() => handleDeleteSolicitud(sol)}
                                                        className="p-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition border border-rose-500/30"
                                                        title="Cancelar / Eliminar Solicitud"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
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
                        <span>Mostrando {solicitudes.from || 0} a {solicitudes.to || 0} de {solicitudes.total} solicitudes</span>
                        <div className="flex gap-1">
                            {solicitudes.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                        link.active
                                            ? 'bg-cyan-600 text-white font-bold'
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

            {/* MODAL EDITAR / SUBSANAR SOLICITUD */}
            {showEditModal && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-5xl xl:max-w-6xl w-full shadow-2xl my-8 relative max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Edit3 className="w-5 h-5 text-amber-400" />
                                    <span>Editar / Subsanar Solicitud #{selectedSolicitud.id}</span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Corrige los datos u observaciones emitidas por Contabilidad o Gerencia y reenvía a revisión.
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowEditModal(false); setSelectedSolicitud(null); }}
                                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Empresa</label>
                                    <select
                                        required
                                        value={editData.empresa_id}
                                        onChange={(e) => handleEditEmpresaChange(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-xl bg-slate-950 border ${getEmpresaColorInfo(editData.empresa_id).borderClass} text-xs focus:ring-2 outline-none font-bold ${getEmpresaColorInfo(editData.empresa_id).textColor}`}
                                        style={{ color: getEmpresaColorInfo(editData.empresa_id).hexColor }}
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
                                    {getSolicitanteEmail(editData.empresa_id) && (
                                        <p className={`text-[10px] ${getEmpresaColorInfo(editData.empresa_id).textColor} mt-1 font-mono`}>
                                            Origen: <strong>{getSolicitanteEmail(editData.empresa_id)}</strong>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <JefeMultiSelect
                                        jefes={jefes}
                                        empresaId={editData.empresa_id}
                                        selectedIds={editData.jefe_ids || []}
                                        onChange={(ids) => setEditData((prev) => ({
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
                                        empresaId={editData.empresa_id}
                                        tipoSol={editData.tipo_solicitud}
                                        monto={editData.monto}
                                        moneda={editData.moneda}
                                        selectedIds={editData.contabilidad_ids || []}
                                        onChange={(ids) => setEditData((prev) => ({
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
                                        selectedId={editData.proveedor_id}
                                        onChange={(id) => setEditData('proveedor_id', id)}
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
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Motivo / Justificación</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={editData.motivo_descripcion}
                                    onChange={(e) => setEditData('motivo_descripcion', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Monto</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={editData.monto}
                                        onChange={(e) => setEditData('monto', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Moneda</label>
                                    <select
                                        value={editData.moneda}
                                        onChange={(e) => setEditData('moneda', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                    >
                                        <option value="BOB">Bolivianos (BOB)</option>
                                        <option value="USD">Dólares (USD)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Modalidad</label>
                                    <select
                                        value={editData.modalidad_pago}
                                        onChange={(e) => setEditData('modalidad_pago', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                    >
                                        <option value="Transferencia">Transferencia</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="QR">Pago QR</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setSelectedSolicitud(null); }}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/30 transition flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>{editProcessing ? 'Guardando...' : 'Reenviar a Contabilidad'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL REGISTRAR PROVEEDOR RÁPIDO */}
            {showQuickProvModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative my-8">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
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

                        <form onSubmit={handleQuickProvSubmit} className="space-y-3 text-xs">
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
                                {provErrors.nombre_razon_social && <p className="text-rose-400 text-[11px] mt-1">{provErrors.nombre_razon_social}</p>}
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
                                {provErrors.descripcion && <p className="text-rose-400 text-[11px] mt-1">{provErrors.descripcion}</p>}
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
                                    {provErrors.nit_ci && <p className="text-rose-400 text-[11px] mt-1">{provErrors.nit_ci}</p>}
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
                                    {provErrors.banco && <p className="text-rose-400 text-[11px] mt-1">{provErrors.banco}</p>}
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
                                    {provErrors.tipo_cuenta && <p className="text-rose-400 text-[11px] mt-1">{provErrors.tipo_cuenta}</p>}
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
                                    {provErrors.numero_cuenta && <p className="text-rose-400 text-[11px] mt-1">{provErrors.numero_cuenta}</p>}
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
                                {provErrors.nombre_titular_cuenta && <p className="text-rose-400 text-[11px] mt-1">{provErrors.nombre_titular_cuenta}</p>}
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
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                                >
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>{provProcessing ? 'Guardando...' : 'Guardar Proveedor'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DETALLE DE SOLICITUD */}
            {showDetailModal && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl relative my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-cyan-400" />
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
                                    <span className="text-slate-400">Tipo de Solicitud:</span>
                                    <span className="text-cyan-400 font-bold">{selectedSolicitud.tipo_solicitud || 'Pago a Proveedor'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Destino Contable:</span>
                                    <span className="text-amber-300 font-semibold">{selectedSolicitud.contabilidad?.nombre_completo || 'Contabilidad'}</span>
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
                                <span className="text-slate-400 block mb-1 font-semibold">Motivo y Justificación:</span>
                                <p className="text-slate-200 leading-relaxed italic">"{selectedSolicitud.motivo_descripcion}"</p>
                            </div>

                            {selectedSolicitud.comentarios_revision && (
                                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                                    <span className="font-bold block mb-1">Observaciones / Notas:</span>
                                    <p>{selectedSolicitud.comentarios_revision}</p>
                                </div>
                            )}

                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-950 border border-cyan-500/20 flex items-center justify-between">
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
                                        className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold flex items-center justify-center gap-2 border border-slate-700 transition"
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

            {/* MODAL VISTA PREVIA COMPROBANTE DE CORREO */}
            {showMailModal && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-cyan-400" />
                                    <span>Comprobante de Correo • Solicitud #{selectedSolicitud.id}</span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Plantilla corporativa despachada automáticamente a Contabilidad y copia de respaldo
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
