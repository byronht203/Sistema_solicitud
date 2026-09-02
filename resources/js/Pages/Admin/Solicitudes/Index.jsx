import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router, Link } from '@inertiajs/react';
import ContabilidadMultiSelect from '@/Components/ContabilidadMultiSelect';
import JefeMultiSelect from '@/Components/JefeMultiSelect';
import {
    FileSpreadsheet,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    DollarSign,
    AlertCircle,
    XCircle,
    Eye,
    Edit3,
    Trash2,
    FileCheck,
    Building2,
    User,
    Truck,
    Download,
    X,
    FileText
} from 'lucide-react';

export default function SolicitudesIndex({ solicitudes, empresas, proveedores, usuarios, contabilidades = [], filters }) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [estadoModalOpen, setEstadoModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [activeSolicitud, setActiveSolicitud] = useState(null);

    // Filters form
    const [searchState, setSearchState] = useState(filters.search || '');
    const [estadoState, setEstadoState] = useState(filters.estado || '');
    const [empresaState, setEmpresaState] = useState(filters.empresa_id || '');
    const [monedaState, setMonedaState] = useState(filters.moneda || '');

    const jefes = usuarios.filter((u) => u.rol && ['Jefe', 'Jefatura'].includes(u.rol.nombre));

    const getFilteredJefes = (empId) => {
        if (!empId) return jefes;
        const filtered = jefes.filter((j) => (j.empresas || []).some((e) => e.id == empId));
        return filtered.length > 0 ? filtered : jefes;
    };

    const getFilteredSolicitantes = (empId) => {
        if (!empId) return usuarios;
        const filtered = usuarios.filter((u) => (u.empresas || []).some((e) => e.id == empId));
        return filtered.length > 0 ? filtered : usuarios;
    };

    const getFilteredContabilidades = (empId, tipoSol, montoNum, mon) => {
        const contasList = contabilidades.length > 0 ? contabilidades : usuarios.filter((u) => u.rol && ['Contabilidad', 'Conta', 'Caja Chica', 'Cajachica'].includes(u.rol.nombre));
        if (!empId) return contasList;
        const selectedEmp = empresas.find((e) => e.id == empId);
        const empNombre = (selectedEmp?.nombre || '').toLowerCase();
        const isFralak = empNombre.includes('fralak');
        const isCajaChica = tipoSol === 'Caja Chica' || (mon === 'BOB' && Number(montoNum) > 0 && Number(montoNum) <= 300);

        return contasList.filter((c) => {
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

    // Form for Create/Edit
    const { data, setData, post, processing, errors, reset } = useForm({
        empresa_id: '',
        tipo_solicitud: 'Pago a Proveedor',
        solicitante_id: '',
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

    const handleEmpresaChange = (newEmpId) => {
        const filteredJ = getFilteredJefes(newEmpId);
        const filteredS = getFilteredSolicitantes(newEmpId);
        const filteredC = getFilteredContabilidades(newEmpId, data.tipo_solicitud, data.monto, data.moneda);
        const eduardo = filteredJ.find((j) => (j.nombre_completo || '').toLowerCase().includes('eduardo') || (j.cargo || '').toLowerCase().includes('auditor'));
        const defaultJefe = eduardo || filteredJ[0];

        setData((prev) => ({
            ...prev,
            empresa_id: newEmpId,
            solicitante_id: filteredS.length > 0 ? filteredS[0].id : '',
            jefe_id: defaultJefe ? defaultJefe.id : '',
            jefe_ids: defaultJefe ? [defaultJefe.id] : [],
            contabilidad_ids: filteredC.length > 0 ? [filteredC[0].id] : [],
            contabilidad_id: filteredC.length > 0 ? filteredC[0].id : '',
        }));
    };

    const getSolicitanteEmail = (solicitanteId, empresaId) => {
        if (!solicitanteId) return '';
        const solUser = usuarios.find((u) => u.id === Number(solicitanteId));
        if (!solUser) return '';
        if (empresaId && solUser.empresas && solUser.empresas.length > 0) {
            const rel = solUser.empresas.find((e) => e.id === Number(empresaId));
            if (rel && rel.pivot && rel.pivot.correo_corporativo) {
                return rel.pivot.correo_corporativo;
            }
            const otroRel = solUser.empresas.find((e) => e.pivot && e.pivot.correo_corporativo);
            if (otroRel && otroRel.pivot && otroRel.pivot.correo_corporativo) {
                return otroRel.pivot.correo_corporativo;
            }
        }
        return solUser.correo || '';
    };

    const getSelectedJefeEmail = (jefeId, empresaId) => {
        if (!jefeId) return '';
        const jefeUser = usuarios.find((u) => u.id === Number(jefeId));
        if (!jefeUser) return '';
        if (empresaId && jefeUser.empresas && jefeUser.empresas.length > 0) {
            const rel = jefeUser.empresas.find((e) => e.id === Number(empresaId));
            if (rel && rel.pivot && rel.pivot.correo_corporativo) {
                return rel.pivot.correo_corporativo;
            }
            const otroRel = jefeUser.empresas.find((e) => e.pivot && e.pivot.correo_corporativo);
            if (otroRel && otroRel.pivot && otroRel.pivot.correo_corporativo) {
                return otroRel.pivot.correo_corporativo;
            }
        }
        return jefeUser.correo || '';
    };

    const getSelectedContaEmail = (contaId, empresaId) => {
        if (!contaId) return '';
        const contaUser = (contabilidades.length > 0 ? contabilidades : usuarios).find((u) => u.id === Number(contaId));
        if (!contaUser) return '';
        if (empresaId && contaUser.empresas && contaUser.empresas.length > 0) {
            const rel = contaUser.empresas.find((e) => e.id === Number(empresaId));
            if (rel && rel.pivot && rel.pivot.correo_corporativo) {
                return rel.pivot.correo_corporativo;
            }
            const otroRel = contaUser.empresas.find((e) => e.pivot && e.pivot.correo_corporativo);
            if (otroRel && otroRel.pivot && otroRel.pivot.correo_corporativo) {
                return otroRel.pivot.correo_corporativo;
            }
        }
        return contaUser.correo || '';
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

    // Form for Changing State
    const { data: estadoData, setData: setEstadoData, post: postEstado, processing: processingEstado, errors: estadoErrors, reset: resetEstado } = useForm({
        nuevo_estado: '',
        comentarios_revision: '',
    });

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('solicitudes.index'), {
            search: searchState,
            estado: estadoState,
            empresa_id: empresaState,
            moneda: monedaState,
        }, { preserveState: true });
    };

    const handleResetFilters = () => {
        setSearchState('');
        setEstadoState('');
        setEmpresaState('');
        setMonedaState('');
        router.get(route('solicitudes.index'));
    };

    const openCreateModal = () => {
        reset();
        const initEmpId = empresas.length > 0 ? empresas[0].id : '';
        const filteredJ = getFilteredJefes(initEmpId);
        const filteredS = getFilteredSolicitantes(initEmpId);
        const filteredC = getFilteredContabilidades(initEmpId, 'Pago a Proveedor', '', 'BOB');
        const eduardo = filteredJ.find((j) => (j.nombre_completo || '').toLowerCase().includes('eduardo') || (j.cargo || '').toLowerCase().includes('auditor'));
        const defaultJefe = eduardo || filteredJ[0];

        setData({
            empresa_id: initEmpId,
            tipo_solicitud: 'Pago a Proveedor',
            solicitante_id: filteredS.length > 0 ? filteredS[0].id : '',
            jefe_id: defaultJefe ? defaultJefe.id : '',
            jefe_ids: defaultJefe ? [defaultJefe.id] : [],
            contabilidad_id: filteredC.length > 0 ? filteredC[0].id : '',
            contabilidad_ids: filteredC.length > 0 ? [filteredC[0].id] : [],
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
        setCreateModalOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('solicitudes.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            }
        });
    };

    const openEditModal = (sol) => {
        setActiveSolicitud(sol);
        const initialJefeIds = Array.isArray(sol.jefe_ids) && sol.jefe_ids.length > 0
            ? sol.jefe_ids.map(Number)
            : (sol.jefe_id ? [Number(sol.jefe_id)] : []);

        const initialContaIds = Array.isArray(sol.contabilidad_ids) && sol.contabilidad_ids.length > 0
            ? sol.contabilidad_ids.map(Number)
            : (sol.contabilidad_id ? [Number(sol.contabilidad_id)] : []);

        setData({
            empresa_id: sol.empresa_id,
            tipo_solicitud: sol.tipo_solicitud || 'Pago a Proveedor',
            solicitante_id: sol.solicitante_id,
            jefe_id: initialJefeIds.length > 0 ? initialJefeIds[0] : '',
            jefe_ids: initialJefeIds,
            contabilidad_id: initialContaIds.length > 0 ? initialContaIds[0] : '',
            contabilidad_ids: initialContaIds,
            proveedor_id: sol.proveedor_id,
            motivo_descripcion: sol.motivo_descripcion,
            monto: sol.monto,
            moneda: sol.moneda,
            tipo_documento: sol.tipo_documento,
            emite_factura: sol.emite_factura,
            modalidad_pago: sol.modalidad_pago,
            fecha_solicitud: sol.fecha_solicitud,
            archivo_respaldo: null,
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        post(route('solicitudes.update', activeSolicitud.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                reset();
            }
        });
    };

    const openEstadoModal = (sol, defaultEstado = '') => {
        setActiveSolicitud(sol);
        setEstadoData({
            nuevo_estado: defaultEstado || sol.estado,
            comentarios_revision: sol.comentarios_revision || '',
        });
        setEstadoModalOpen(true);
    };

    const handleEstadoSubmit = (e) => {
        e.preventDefault();
        postEstado(route('solicitudes.cambiar-estado', activeSolicitud.id), {
            onSuccess: () => {
                setEstadoModalOpen(false);
                resetEstado();
            }
        });
    };

    const handleDelete = (sol) => {
        if (confirm(`¿Estás seguro de eliminar la solicitud #${sol.id}?`)) {
            router.delete(route('solicitudes.destroy', sol.id));
        }
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Pendiente Jefatura</span>;
            case 'Aprobado_Jefatura':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Aprobado Jefe</span>;
            case 'Pagado':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><DollarSign className="w-3.5 h-3.5" /> Pagado</span>;
            case 'Observado':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20"><AlertCircle className="w-3.5 h-3.5" /> Observado</span>;
            case 'Rechazado':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><XCircle className="w-3.5 h-3.5" /> Rechazado</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-300">{estado}</span>;
        }
    };

    return (
        <AdminLayout title="Gestión Completa de Solicitudes">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
                        Control y Aprobación de Solicitudes
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Visualiza, aprueba como Jefe, procesa como Contabilidad o crea nuevas solicitudes
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4" />
                    <span>Crear Solicitud</span>
                </button>
            </div>

            {/* Filter Bar */}
            <form onSubmit={handleFilterSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                    {/* Search */}
                    <div className="md:col-span-2 relative">
                        <input
                            type="text"
                            placeholder="Buscar por motivo, solicitante o proveedor..."
                            value={searchState}
                            onChange={(e) => setSearchState(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>

                    {/* Estado */}
                    <div>
                        <select
                            value={estadoState}
                            onChange={(e) => setEstadoState(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">Todos los Estados</option>
                            <option value="Pendiente">Pendiente Jefatura</option>
                            <option value="Aprobado_Jefatura">Aprobado Jefatura</option>
                            <option value="Pagado">Pagado</option>
                            <option value="Observado">Observado</option>
                            <option value="Rechazado">Rechazado</option>
                        </select>
                    </div>

                    {/* Empresa */}
                    <div>
                        <select
                            value={empresaState}
                            onChange={(e) => setEmpresaState(e.target.value)}
                            className={`w-full bg-slate-950/80 border ${getEmpresaColorInfo(empresaState).borderClass} rounded-xl px-3 py-2 text-xs font-bold ${empresaState ? getEmpresaColorInfo(empresaState).textColor : 'text-slate-300'} focus:ring-1 focus:ring-indigo-500`}
                            style={empresaState ? { color: getEmpresaColorInfo(empresaState).hexColor } : {}}
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

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Filtrar</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-xl transition"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </form>

            {/* Solicitudes Data Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                            <tr>
                                <th className="px-4 py-3.5">ID / Fecha</th>
                                <th className="px-4 py-3.5">Empresa</th>
                                <th className="px-4 py-3.5">Solicitante</th>
                                <th className="px-4 py-3.5">Proveedor</th>
                                <th className="px-4 py-3.5">Monto</th>
                                <th className="px-4 py-3.5">Doc / Pago</th>
                                <th className="px-4 py-3.5">Estado</th>
                                <th className="px-4 py-3.5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {solicitudes.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-slate-500">
                                        No se encontraron solicitudes con los filtros aplicados.
                                    </td>
                                </tr>
                            ) : (
                                solicitudes.data.map((sol) => (
                                    <tr key={sol.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-bold text-white text-sm">#{sol.id}</span>
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                    sol.tipo_solicitud === 'Caja Chica'
                                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                                }`}>
                                                    {sol.tipo_solicitud || 'Pago Proveedor'}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">{sol.fecha_solicitud}</div>
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-slate-200">
                                            {sol.empresa?.nombre}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-medium text-white">{sol.solicitante?.nombre_completo}</div>
                                            <div className="text-[10px] text-slate-400">{sol.solicitante?.cargo}</div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-medium text-slate-200">{sol.proveedor?.nombre_razon_social}</div>
                                            {sol.proveedor?.descripcion && (
                                                <div className="text-[10px] text-slate-400 italic line-clamp-1">{sol.proveedor.descripcion}</div>
                                            )}
                                            <div className="text-[10px] text-slate-400">
                                                {sol.proveedor?.banco || '💵 Efectivo / Sin cuenta'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 font-black text-white text-sm">
                                            {Number(sol.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })} <span className="text-xs font-semibold text-indigo-400">{sol.moneda}</span>
                                        </td>
                                        <td className="px-4 py-3.5 text-[11px]">
                                            <div>{sol.tipo_documento} {sol.emite_factura && <span className="text-emerald-400 font-bold">(Factura)</span>}</div>
                                            <div className="text-slate-400">{sol.modalidad_pago}</div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {getEstadoBadge(sol.estado)}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Detalle */}
                                                <button
                                                    onClick={() => { setActiveSolicitud(sol); setDetailModalOpen(true); }}
                                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                                    title="Ver Detalle y Respaldo"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>

                                                {/* Cambiar Estado (Aprobar/Pagar/Observar) */}
                                                <button
                                                    onClick={() => openEstadoModal(sol)}
                                                    className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 transition"
                                                    title="Revisar / Cambiar Estado"
                                                >
                                                    <FileCheck className="w-3.5 h-3.5" />
                                                </button>

                                                {/* Editar */}
                                                <button
                                                    onClick={() => openEditModal(sol)}
                                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition"
                                                    title="Editar Solicitud"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>

                                                {/* Eliminar */}
                                                <button
                                                    onClick={() => handleDelete(sol)}
                                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {solicitudes.links && solicitudes.links.length > 3 && (
                    <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                            Mostrando {solicitudes.from} a {solicitudes.to} de {solicitudes.total} solicitudes
                        </span>
                        <div className="flex gap-1">
                            {solicitudes.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                        link.active
                                            ? 'bg-indigo-600 text-white'
                                            : link.url
                                            ? 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                                            : 'bg-slate-950 text-slate-600 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE / EDIT MODAL */}
            {(createModalOpen || editModalOpen) && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl lg:max-w-4xl w-full p-6 shadow-2xl my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                                {createModalOpen ? 'Registrar Nueva Solicitud de Pago' : `Editar Solicitud #${activeSolicitud?.id}`}
                            </h3>
                            <button
                                onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); }}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={createModalOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4 text-xs">
                            {/* Selector Tipo Solicitud */}
                            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                                <label className="block font-semibold text-slate-300 uppercase mb-2">Tipo de Solicitud</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setData('tipo_solicitud', 'Pago a Proveedor')}
                                        className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition ${
                                            data.tipo_solicitud === 'Pago a Proveedor'
                                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <Truck className="w-4 h-4" />
                                        <span>Pago a Proveedor (Transferencia)</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData(prev => ({
                                                ...prev,
                                                tipo_solicitud: 'Caja Chica',
                                                modalidad_pago: 'Efectivo'
                                            }));
                                        }}
                                        className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition ${
                                            data.tipo_solicitud === 'Caja Chica'
                                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 font-extrabold'
                                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <DollarSign className="w-4 h-4" />
                                        <span>Caja Chica / Reembolso (Efectivo)</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">Empresa <span className="text-cyan-400">*</span></label>
                                    <select
                                        value={data.empresa_id}
                                        onChange={(e) => handleEmpresaChange(e.target.value)}
                                        className={`w-full bg-slate-950 border ${getEmpresaColorInfo(data.empresa_id).borderClass} rounded-xl p-2 text-xs font-bold ${getEmpresaColorInfo(data.empresa_id).textColor}`}
                                        style={{ color: getEmpresaColorInfo(data.empresa_id).hexColor }}
                                        required
                                    >
                                        <option value="" style={{ color: '#cbd5e1', backgroundColor: '#020617' }}>Seleccione Empresa...</option>
                                        {empresas.map((e) => {
                                            const itemColor = getEmpresaColorInfo(e);
                                            return (
                                                <option
                                                    key={e.id}
                                                    value={e.id}
                                                    style={{
                                                        color: itemColor.hexColor,
                                                        backgroundColor: '#020617',
                                                        fontWeight: '700',
                                                    }}
                                                >
                                                    {e.nombre}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {getSolicitanteEmail(data.solicitante_id, data.empresa_id) && (
                                        <p className={`text-[10px] ${getEmpresaColorInfo(data.empresa_id).textColor} mt-1 font-mono`}>
                                            Origen: <strong>{getSolicitanteEmail(data.solicitante_id, data.empresa_id)}</strong>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">Solicitante <span className="text-cyan-400">*</span></label>
                                    <select
                                        value={data.solicitante_id}
                                        onChange={(e) => setData('solicitante_id', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs"
                                        required
                                    >
                                        <option value="">Seleccione Solicitante...</option>
                                        {getFilteredSolicitantes(data.empresa_id).map((u) => (
                                            <option key={u.id} value={u.id}>{u.nombre_completo} ({u.cargo || u.rol?.nombre || 'Usuario'})</option>
                                        ))}
                                    </select>
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
                                        contabilidades={contabilidades.length > 0 ? contabilidades : usuarios.filter((u) => u.rol && ['Contabilidad', 'Conta', 'Caja Chica', 'Cajachica'].includes(u.rol.nombre))}
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

                                <div className="sm:col-span-2 lg:col-span-4">
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">Proveedor / Beneficiario <span className="text-cyan-400">*</span></label>
                                    <select
                                        value={data.proveedor_id}
                                        onChange={(e) => setData('proveedor_id', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs"
                                        required
                                    >
                                        <option value="">Seleccione Proveedor...</option>
                                        {proveedores.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nombre_razon_social} {p.descripcion ? `— ${p.descripcion}` : (p.banco ? `(${p.banco})` : '— Efectivo')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-300 uppercase mb-1">Motivo / Descripción Detallada</label>
                                <textarea
                                    rows="3"
                                    value={data.motivo_descripcion}
                                    onChange={(e) => setData('motivo_descripcion', e.target.value)}
                                    placeholder="Describa el motivo del gasto o pago solicitado..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">Monto</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.monto}
                                        onChange={(e) => setData('monto', e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">Moneda</label>
                                    <select
                                        value={data.moneda}
                                        onChange={(e) => setData('moneda', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                                    >
                                        <option value="BOB">BOB (Bolivianos)</option>
                                        <option value="USD">USD (Dólares)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">Fecha Solicitud</label>
                                    <input
                                        type="date"
                                        value={data.fecha_solicitud}
                                        onChange={(e) => setData('fecha_solicitud', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">Tipo Documento</label>
                                    <select
                                        value={data.tipo_documento}
                                        onChange={(e) => setData('tipo_documento', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                                    >
                                        <option value="Factura">Factura</option>
                                        <option value="Recibo">Recibo</option>
                                        <option value="Contrato">Contrato</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">¿Emite Factura?</label>
                                    <select
                                        value={data.emite_factura ? '1' : '0'}
                                        onChange={(e) => setData('emite_factura', e.target.value === '1')}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                                    >
                                        <option value="1">Sí (Con Factura)</option>
                                        <option value="0">No (Sin Factura)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">Modalidad de Pago</label>
                                    <select
                                        value={data.modalidad_pago}
                                        onChange={(e) => setData('modalidad_pago', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                                    >
                                        <option value="Transferencia">Transferencia Bancaria</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="QR">Pago QR</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-300 uppercase mb-1">
                                    Archivo Respaldo (PDF, JPG, PNG max 5MB)
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setData('archivo_respaldo', e.target.files[0])}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); }}
                                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30"
                                >
                                    {createModalOpen ? 'Guardar Solicitud' : 'Actualizar Solicitud'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ESTADO WORKFLOW MODAL */}
            {estadoModalOpen && activeSolicitud && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-indigo-400" />
                                Revisión y Cambio de Estado (#{activeSolicitud.id})
                            </h3>
                            <button onClick={() => setEstadoModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleEstadoSubmit} className="space-y-4 text-xs">
                            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                                <div className="font-bold text-white">{activeSolicitud.empresa?.nombre} • {activeSolicitud.proveedor?.nombre_razon_social}</div>
                                <div className="text-indigo-400 font-black text-sm mt-1">
                                    {Number(activeSolicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })} {activeSolicitud.moneda}
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-300 uppercase mb-1">Seleccionar Nuevo Estado</label>
                                <select
                                    value={estadoData.nuevo_estado}
                                    onChange={(e) => setEstadoData('nuevo_estado', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-semibold text-sm"
                                >
                                    <option value="Pendiente">⏳ Pendiente de Revisión</option>
                                    <option value="Aprobado_Jefatura">✅ Aprobar (Jefatura)</option>
                                    <option value="Pagado">💵 Registrar Pago (Contabilidad)</option>
                                    <option value="Observado">⚠️ Observar (Con Comentarios)</option>
                                    <option value="Rechazado">❌ Rechazar Solicitud</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-300 uppercase mb-1">Comentarios / Observaciones de Revisión</label>
                                <textarea
                                    rows="3"
                                    value={estadoData.comentarios_revision}
                                    onChange={(e) => setEstadoData('comentarios_revision', e.target.value)}
                                    placeholder="Escriba comentarios para el solicitante o contabilidad..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEstadoModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processingEstado}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30"
                                >
                                    Confirmar Cambio
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* FULL DETAIL MODAL */}
            {detailModalOpen && activeSolicitud && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">Solicitud de Pago #{activeSolicitud.id}</h3>
                                <p className="text-xs text-slate-400">Fecha: {activeSolicitud.fecha_solicitud}</p>
                            </div>
                            <button onClick={() => setDetailModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                <div>
                                    <span className="text-slate-500 uppercase font-semibold">Tipo</span>
                                    <p className="mt-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                            activeSolicitud.tipo_solicitud === 'Caja Chica'
                                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                        }`}>
                                            {activeSolicitud.tipo_solicitud || 'Pago Proveedor'}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-500 uppercase font-semibold">Empresa</span>
                                    <p className="font-bold text-white text-sm mt-1">{activeSolicitud.empresa?.nombre}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 uppercase font-semibold">Estado</span>
                                    <div className="mt-1">{getEstadoBadge(activeSolicitud.estado)}</div>
                                </div>
                                <div>
                                    <span className="text-slate-500 uppercase font-semibold">Monto Total</span>
                                    <p className="font-black text-indigo-400 text-base mt-1">
                                        {Number(activeSolicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })} {activeSolicitud.moneda}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                                <span className="text-slate-400 uppercase font-semibold block mb-1">Motivo / Descripción</span>
                                <p className="text-slate-200 leading-relaxed font-medium">{activeSolicitud.motivo_descripcion}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                    <span className="text-indigo-400 uppercase font-bold block mb-2">Información del Solicitante</span>
                                    <p className="text-white font-bold">{activeSolicitud.solicitante?.nombre_completo}</p>
                                    <p className="text-slate-400">Cargo: {activeSolicitud.solicitante?.cargo}</p>
                                    <p className="text-slate-400">CI: {activeSolicitud.solicitante?.ci}</p>
                                    <p className="text-slate-400">Correo: {activeSolicitud.solicitante?.correo}</p>
                                </div>

                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                    <span className="text-cyan-400 uppercase font-bold block mb-2">Proveedor / Beneficiario</span>
                                    <p className="text-white font-bold">{activeSolicitud.proveedor?.nombre_razon_social}</p>
                                    {activeSolicitud.proveedor?.descripcion && (
                                        <p className="text-slate-400 italic text-[11px] mt-0.5">{activeSolicitud.proveedor.descripcion}</p>
                                    )}
                                    {activeSolicitud.proveedor?.numero_cuenta ? (
                                        <>
                                            <p className="text-slate-300 mt-1">Banco: <strong>{activeSolicitud.proveedor?.banco}</strong></p>
                                            <p className="text-slate-300">Cuenta: <strong>{activeSolicitud.proveedor?.numero_cuenta}</strong> ({activeSolicitud.proveedor?.tipo_cuenta})</p>
                                            <p className="text-slate-400">Titular: {activeSolicitud.proveedor?.nombre_titular_cuenta}</p>
                                            <p className="text-slate-400">NIT/CI: {activeSolicitud.proveedor?.nit_ci || 'Sin NIT'}</p>
                                        </>
                                    ) : (
                                        <p className="text-amber-400/90 italic text-[11px] mt-2">💵 Pago en Efectivo / Presencial (Sin cuenta bancaria)</p>
                                    )}
                                </div>
                            </div>

                            {activeSolicitud.archivo_respaldo_path && (
                                <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-indigo-400" />
                                        <div>
                                            <div className="font-bold text-white">Archivo de Respaldo Adjunto</div>
                                            <div className="text-[11px] text-slate-400">Comprobante / Cotización subida</div>
                                        </div>
                                    </div>
                                    <a
                                        href={`/storage/${activeSolicitud.archivo_respaldo_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center gap-1.5 transition"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Ver / Descargar</span>
                                    </a>
                                </div>
                            )}

                            {activeSolicitud.comentarios_revision && (
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300">
                                    <span className="font-bold uppercase tracking-wider block mb-1">Historial de Revisiones & Comentarios:</span>
                                    <p>{activeSolicitud.comentarios_revision}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
                            <button
                                onClick={() => { setDetailModalOpen(false); openEstadoModal(activeSolicitud); }}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold"
                            >
                                Cambiar Estado
                            </button>
                            <button
                                onClick={() => setDetailModalOpen(false)}
                                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
