import { useState, useEffect } from 'react';
import SolicitanteLayout from '@/Layouts/SolicitanteLayout';
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
    UserCircle,
    FileText,
    DollarSign,
    PlusCircle,
    Edit,
    Trash2,
    X,
    MessageSquare,
    Eye,
    Send,
    RefreshCw,
    Mail
} from 'lucide-react';

export default function Index({ solicitudes, empresas = [], proveedores = [], jefes = [], contabilidades = [], badgeObservadas = 0, filters = {} }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [estado, setEstado] = useState(filters.estado || '');
    const [empresaId, setEmpresaId] = useState(filters.empresa_id || '');
    const [moneda, setMoneda] = useState(filters.moneda || '');

    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
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
        return jefes.filter((j) => {
            if (!j.empresas || j.empresas.length === 0) return true;
            return j.empresas.some((e) => e.id == empId);
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

    const { data: createData, setData: setCreateData, post: postCreate, processing: createProcessing, reset: resetCreate } = useForm({
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

    const { data: editData, setData: setEditData, post: postUpdate, processing: updateProcessing, reset: resetEdit } = useForm({
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
        fecha_solicitud: new Date().toISOString().split('T')[0],
        archivo_respaldo: null,
    });

    // Auto-seleccionar Jefe y Contabilidad inicial de la primera empresa
    useEffect(() => {
        if (empresas.length > 0 && !createData.jefe_id) {
            const initEmpId = empresas[0].id;
            const initJefes = getFilteredJefes(initEmpId);
            const initContas = getFilteredContabilidades(initEmpId, createData.tipo_solicitud, createData.monto, createData.moneda);
            setCreateData((prev) => ({
                ...prev,
                empresa_id: initEmpId,
                jefe_id: initJefes.length > 0 ? initJefes[0].id : '',
                contabilidad_ids: initContas.length > 0 ? [initContas[0].id] : [],
                contabilidad_id: initContas.length > 0 ? initContas[0].id : '',
            }));
        }
    }, [empresas]);

    const handleCreateEmpresaChange = (newEmpId) => {
        const filteredJ = getFilteredJefes(newEmpId);
        const filteredC = getFilteredContabilidades(newEmpId, createData.tipo_solicitud, createData.monto, createData.moneda);
        setCreateData((prev) => ({
            ...prev,
            empresa_id: newEmpId,
            jefe_id: filteredJ.length > 0 ? filteredJ[0].id : '',
            contabilidad_ids: filteredC.length > 0 ? [filteredC[0].id] : [],
            contabilidad_id: filteredC.length > 0 ? filteredC[0].id : '',
        }));
    };

    const handleEditEmpresaChange = (newEmpId) => {
        const filteredJ = getFilteredJefes(newEmpId);
        const filteredC = getFilteredContabilidades(newEmpId, editData.tipo_solicitud, editData.monto, editData.moneda);
        setEditData((prev) => ({
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
            route('solicitante.solicitudes'),
            { search, estado, empresa_id: empresaId, moneda },
            { preserveState: true, replace: true }
        );
    };

    const handleTabChange = (newEstado) => {
        setEstado(newEstado);
        router.get(
            route('solicitante.solicitudes'),
            { search, estado: newEstado, empresa_id: empresaId, moneda },
            { preserveState: true, replace: true }
        );
    };

    const openEditModal = (solicitud) => {
        setSelectedSolicitud(solicitud);
        const initialJefeIds = Array.isArray(solicitud.jefe_ids) && solicitud.jefe_ids.length > 0
            ? solicitud.jefe_ids.map(Number)
            : (solicitud.jefe_id ? [Number(solicitud.jefe_id)] : []);

        const initialContaIds = Array.isArray(solicitud.contabilidad_ids) && solicitud.contabilidad_ids.length > 0
            ? solicitud.contabilidad_ids.map(Number)
            : (solicitud.contabilidad_id ? [Number(solicitud.contabilidad_id)] : []);

        setEditData({
            empresa_id: solicitud.empresa_id,
            tipo_solicitud: solicitud.tipo_solicitud || 'Pago a Proveedor',
            jefe_id: initialJefeIds.length > 0 ? initialJefeIds[0] : '',
            jefe_ids: initialJefeIds,
            contabilidad_id: initialContaIds.length > 0 ? initialContaIds[0] : '',
            contabilidad_ids: initialContaIds,
            proveedor_id: solicitud.proveedor_id,
            motivo_descripcion: solicitud.motivo_descripcion,
            monto: solicitud.monto,
            moneda: solicitud.moneda,
            tipo_documento: solicitud.tipo_documento,
            emite_factura: Boolean(solicitud.emite_factura),
            modalidad_pago: solicitud.modalidad_pago,
            fecha_solicitud: solicitud.fecha_solicitud,
            archivo_respaldo: null,
        });
        setShowEditModal(true);
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

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        postCreate(route('solicitante.solicitudes.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                resetCreate();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedSolicitud) return;

        postUpdate(route('solicitante.solicitudes.update', selectedSolicitud.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedSolicitud(null);
                resetEdit();
            },
        });
    };

    const handleDelete = (solicitud) => {
        if (confirm(`¿Estás seguro de cancelar y eliminar la solicitud #${solicitud.id}?`)) {
            router.delete(route('solicitante.solicitudes.destroy', solicitud.id));
        }
    };

    const getEstadoBadge = (solState) => {
        switch (solState) {
            case 'Pendiente':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" /> En Revisión Jefe
                    </span>
                );
            case 'Aprobado_Jefatura':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aprobado - En Cola de Pago
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
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" /> OBSERVADO (Subsanar)
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
        <SolicitanteLayout title="Mis Solicitudes de Pago" badgeObservadas={badgeObservadas}>
            {/* Header & Create Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
                        <span>Mis Solicitudes de Pago</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Gestiona tus solicitudes de pago, subsana observaciones y consulta el estado de tus desembolsos.
                    </p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/30 transition flex items-center gap-2 self-start md:self-auto"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span>Nueva Solicitud de Pago</span>
                </button>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3">
                <button
                    onClick={() => handleTabChange('')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === ''
                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <span>Todas mis Solicitudes</span>
                </button>

                <button
                    onClick={() => handleTabChange('Observado')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Observado'
                            ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <AlertCircle className="w-4 h-4" />
                    <span>Observadas (Atención)</span>
                    {badgeObservadas > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-950/40 text-amber-200 animate-pulse">
                            {badgeObservadas}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => handleTabChange('Pendiente')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Pendiente'
                            ? 'bg-amber-600 text-white shadow-lg'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <Clock className="w-4 h-4" />
                    <span>En Revisión Jefe</span>
                </button>

                <button
                    onClick={() => handleTabChange('Aprobado_Jefatura')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Aprobado_Jefatura'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>En Cola de Pago (Conta)</span>
                </button>

                <button
                    onClick={() => handleTabChange('Pagado')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                        estado === 'Pagado'
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pagadas</span>
                </button>
            </div>

            {/* Filter Search Form */}
            <form onSubmit={handleFilterSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            placeholder="Buscar por motivo, proveedor..."
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
                            <option value="BOB">BOB (Bolivianos)</option>
                            <option value="USD">USD (Dólares)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
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
                        <h4 className="text-base font-bold text-slate-300">No hay solicitudes registradas</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            No tienes solicitudes registradas bajo este estado o criterio de búsqueda.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-4 py-3.5">ID / Empresa</th>
                                    <th className="px-4 py-3.5">Estado & Trazabilidad</th>
                                    <th className="px-4 py-3.5">Proveedor</th>
                                    <th className="px-4 py-3.5">Monto & Moneda</th>
                                    <th className="px-4 py-3.5">Documento & Factura</th>
                                    <th className="px-4 py-3.5 text-right">Acciones Solicitante</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {solicitudes.data.map((solicitud) => (
                                    <tr key={solicitud.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-4 py-4 font-medium">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-extrabold text-cyan-400">#{solicitud.id}</span>
                                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px] font-bold border border-slate-700">
                                                    {solicitud.empresa?.nombre}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                                    solicitud.tipo_solicitud === 'Caja Chica'
                                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
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
                                            {solicitud.comentarios_revision && (
                                                <div className="text-[10px] text-amber-300 mt-1 line-clamp-1 max-w-xs" title={solicitud.comentarios_revision}>
                                                    Nota: {solicitud.comentarios_revision}
                                                </div>
                                            )}
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
                                            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                                                {solicitud.proveedor?.numero_cuenta ? (
                                                    `${solicitud.proveedor?.banco} - N° ${solicitud.proveedor?.numero_cuenta}`
                                                ) : (
                                                    <span className="text-slate-400 italic text-[10px]">💵 Pago Efectivo / Presencial</span>
                                                )}
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
                                                    <FileText className="w-3 h-3" /> Ver Mi Adjunto
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
                                                    title="Ver Comprobante / Notificación de Correo"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>

                                                {solicitud.estado === 'Observado' && (
                                                    <button
                                                        onClick={() => openEditModal(solicitud)}
                                                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center gap-1"
                                                    >
                                                        <RefreshCw className="w-3.5 h-3.5" />
                                                        <span>Subsanar</span>
                                                    </button>
                                                )}

                                                {solicitud.estado === 'Pendiente' && (
                                                    <>
                                                        <button
                                                            onClick={() => openEditModal(solicitud)}
                                                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                                            title="Editar Solicitud"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(solicitud)}
                                                            className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white transition"
                                                            title="Cancelar Solicitud"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
                                            ? 'bg-cyan-600 text-white font-bold'
                                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                                    } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
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
                                <h3 className="text-lg font-bold text-white">Nueva Solicitud de Desembolso</h3>
                                <p className="text-xs text-slate-400">Selecciona el tipo de solicitud, ingresa los datos y adjunta tu proforma o justificante</p>
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
                                        label="Jefe Aprobador"
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
                                    Motivo y Descripción Detallada del Gasto <span className="text-cyan-400">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Describe la justificación de la compra o servicio..."
                                    value={createData.motivo_descripcion}
                                    onChange={(e) => setCreateData('motivo_descripcion', e.target.value)}
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
                                        value={createData.monto}
                                        onChange={(e) => setCreateData('monto', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Moneda <span className="text-cyan-400">*</span>
                                    </label>
                                    <select
                                        value={createData.moneda}
                                        onChange={(e) => setCreateData('moneda', e.target.value)}
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
                                        Tipo Documento
                                    </label>
                                    <select
                                        value={createData.tipo_documento}
                                        onChange={(e) => setCreateData('tipo_documento', e.target.value)}
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
                                        value={createData.emite_factura ? '1' : '0'}
                                        onChange={(e) => setCreateData('emite_factura', e.target.value === '1')}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                    >
                                        <option value="1">SÍ Emite Factura</option>
                                        <option value="0">NO Emite Factura</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Modalidad Pago
                                    </label>
                                    <select
                                        value={createData.modalidad_pago}
                                        onChange={(e) => setCreateData('modalidad_pago', e.target.value)}
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
                                    onChange={(e) => setCreateData('archivo_respaldo', e.target.files[0])}
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
                                    disabled={createProcessing}
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

            {/* Modal: Editar / Subsanar Solicitud */}
            {showEditModal && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl xl:max-w-6xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                                <RefreshCw className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Editar / Subsanar Solicitud #{selectedSolicitud.id}</h3>
                                <p className="text-xs text-slate-400">Actualiza los datos y re-envía la solicitud a revisión</p>
                            </div>
                        </div>

                        {selectedSolicitud.comentarios_revision && (
                            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs mb-4 text-amber-200">
                                <strong className="block text-amber-300 mb-0.5">Observación recibida:</strong>
                                {selectedSolicitud.comentarios_revision}
                            </div>
                        )}

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                     <label className="block text-xs font-semibold text-slate-300 mb-1">
                                         Empresa Beneficiaria
                                     </label>
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
                                        label="Jefe Aprobador"
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
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Motivo y Descripción del Gasto
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={editData.motivo_descripcion}
                                    onChange={(e) => setEditData('motivo_descripcion', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Monto
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={editData.monto}
                                        onChange={(e) => setEditData('monto', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Moneda
                                    </label>
                                    <select
                                        value={editData.moneda}
                                        onChange={(e) => setEditData('moneda', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                    >
                                        <option value="BOB">BOB (Bolivianos)</option>
                                        <option value="USD">USD (Dólares)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Nuevo Archivo Respaldo (Opcional si deseas reemplazar el actual)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setEditData('archivo_respaldo', e.target.files[0])}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateProcessing}
                                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/30 transition flex items-center gap-1.5"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Re-enviar a Revisión</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Detalle Completo */}
            {showDetailModal && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Solicitud #{selectedSolicitud.id}</h3>
                                <p className="text-xs text-slate-400">{selectedSolicitud.empresa?.nombre}</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2.5 mb-4">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                                <span className="text-slate-400">Tipo de Solicitud:</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    selectedSolicitud.tipo_solicitud === 'Caja Chica'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                }`}>
                                    {selectedSolicitud.tipo_solicitud || 'Pago a Proveedor'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Proveedor / Beneficiario:</span>
                                <div className="text-right">
                                    <div className="font-bold text-white">{selectedSolicitud.proveedor?.nombre_razon_social}</div>
                                    {selectedSolicitud.proveedor?.descripcion && (
                                        <div className="text-[11px] text-slate-400 italic">{selectedSolicitud.proveedor.descripcion}</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Banco & N° Cuenta:</span>
                                <div className="text-right">
                                    {selectedSolicitud.proveedor?.numero_cuenta ? (
                                        <span className="font-bold text-cyan-400">
                                            {selectedSolicitud.proveedor?.banco} - {selectedSolicitud.proveedor?.numero_cuenta}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 italic">💵 Pago en Efectivo / Sin cuenta bancaria</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t border-slate-800">
                                <span className="text-slate-300">Monto:</span>
                                <span className="text-base text-emerald-400">
                                    {selectedSolicitud.moneda === 'BOB' ? 'Bs.' : '$'} {parseFloat(selectedSolicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        {selectedSolicitud.comentarios_revision && (
                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs mb-4">
                                <span className="font-bold text-amber-300 block mb-1">Notas de Revisión / Desembolso:</span>
                                <p className="text-slate-300">{selectedSolicitud.comentarios_revision}</p>
                            </div>
                        )}

                        <div className="flex justify-end">
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
                                <h3 className="text-lg font-bold text-white">Notificación / Comprobante de Correo</h3>
                                <p className="text-xs text-slate-400">Previsualización del correo de la Solicitud #{selectedSolicitud.id}</p>
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
