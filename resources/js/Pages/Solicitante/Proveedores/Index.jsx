import { useState } from 'react';
import SolicitanteLayout from '@/Layouts/SolicitanteLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Truck,
    Search,
    Plus,
    Landmark,
    Copy,
    Check,
    X,
    CheckCircle2,
    Edit3,
    UserCheck
} from 'lucide-react';

export default function Index({ proveedores, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [copiedField, setCopiedField] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeProveedor, setActiveProveedor] = useState(null);

    const {
        data: createData,
        setData: setCreateData,
        post: postCreate,
        processing: createProcessing,
        reset: resetCreate,
        errors: createErrors
    } = useForm({
        nombre_razon_social: '',
        descripcion: '',
        nit_ci: '',
        banco: '',
        tipo_cuenta: 'Caja de Ahorro',
        numero_cuenta: '',
        nombre_titular_cuenta: '',
    });

    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: editProcessing,
        reset: resetEdit,
        errors: editErrors
    } = useForm({
        nombre_razon_social: '',
        descripcion: '',
        nit_ci: '',
        banco: '',
        tipo_cuenta: 'Caja de Ahorro',
        numero_cuenta: '',
        nombre_titular_cuenta: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('solicitante.proveedores'), { search }, { preserveState: true, replace: true });
    };

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        postCreate(route('proveedores.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                resetCreate();
            },
        });
    };

    const openEditModal = (prov) => {
        setActiveProveedor(prov);
        setEditData({
            nombre_razon_social: prov.nombre_razon_social || '',
            descripcion: prov.descripcion || '',
            nit_ci: prov.nit_ci || '',
            banco: prov.banco || '',
            tipo_cuenta: prov.tipo_cuenta || 'Caja de Ahorro',
            numero_cuenta: prov.numero_cuenta || '',
            nombre_titular_cuenta: prov.nombre_titular_cuenta || '',
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!activeProveedor) return;
        putEdit(route('proveedores.update', activeProveedor.id), {
            onSuccess: () => {
                setShowEditModal(false);
                resetEdit();
                setActiveProveedor(null);
            },
        });
    };

    return (
        <SolicitanteLayout title="Directorio de Proveedores">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Truck className="w-6 h-6 text-cyan-400" />
                        <span>Directorio de Proveedores Registrados</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Consulta, registra o edita proveedores para asociarlos a tus solicitudes de pago.
                    </p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Registrar Proveedor Nuevo</span>
                </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            placeholder="Buscar por Razón Social, NIT/CI, Banco..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition"
                    >
                        Buscar
                    </button>
                </div>
            </form>

            {/* Providers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                {proveedores.data.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500 text-xs">
                        No se encontraron proveedores registrados.
                    </div>
                ) : (
                    proveedores.data.map((prov) => (
                        <div
                            key={prov.id}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-slate-700 transition group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-extrabold uppercase">
                                        NIT/CI: {prov.nit_ci}
                                    </span>
                                    <button
                                        onClick={() => openEditModal(prov)}
                                        className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-amber-600/20 hover:border-amber-500/40 border border-slate-700 text-amber-400 font-semibold text-[11px] flex items-center gap-1 transition"
                                        title="Editar datos del Proveedor"
                                    >
                                        <Edit3 className="w-3 h-3" />
                                        <span>Editar</span>
                                    </button>
                                </div>
                                <h3 className="text-base font-extrabold text-white mb-1 line-clamp-1" title={prov.nombre_razon_social}>
                                    {prov.nombre_razon_social}
                                </h3>

                                {prov.descripcion && (
                                    <p className="text-xs text-slate-400 mb-2 line-clamp-2 italic">
                                        "{prov.descripcion}"
                                    </p>
                                )}

                                {/* Bank Card Info */}
                                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 my-3 text-xs space-y-2">
                                    {prov.numero_cuenta ? (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400">Banco:</span>
                                                <span className="font-bold text-emerald-400">{prov.banco || 'N/A'}</span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400">Tipo Cuenta:</span>
                                                <span className="font-semibold text-slate-300">{prov.tipo_cuenta || 'N/A'}</span>
                                            </div>

                                            <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                                                <span className="text-slate-400">N° Cuenta:</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-mono font-extrabold text-white text-xs">{prov.numero_cuenta}</span>
                                                    <button
                                                        onClick={() => handleCopy(prov.numero_cuenta, `solic_prov_${prov.id}`)}
                                                        className="p-1 text-slate-400 hover:text-cyan-400 transition"
                                                        title="Copiar N° de Cuenta"
                                                    >
                                                        {copiedField === `solic_prov_${prov.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {prov.nombre_titular_cuenta && (
                                                <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                                                    <span className="text-slate-400">Titular:</span>
                                                    <span className="font-bold text-slate-200 truncate max-w-[140px]" title={prov.nombre_titular_cuenta}>
                                                        {prov.nombre_titular_cuenta}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="py-2 text-center text-slate-400 italic">
                                            💵 Pago en Efectivo / Presencial<br/>
                                            <span className="text-[10px] text-slate-500">(Sin cuenta bancaria requerida)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/50 mt-1">
                                <span>Registrado por: {prov.creador?.nombre || 'Sistema'}</span>
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Habilitado
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal: Registrar Proveedor */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-cyan-400" />
                            <span>Registrar Nuevo Proveedor / Beneficiario</span>
                        </h3>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Nombre o Razón Social <span className="text-cyan-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Librería Central / Compras Menores..."
                                    value={createData.nombre_razon_social}
                                    onChange={(e) => setCreateData('nombre_razon_social', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                                {createErrors.nombre_razon_social && <p className="text-rose-400 text-[11px] mt-1">{createErrors.nombre_razon_social}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Descripción / Rubro / Observaciones (Opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Gastos de oficina, compras en efectivo, servicios presenciales..."
                                    value={createData.descripcion}
                                    onChange={(e) => setCreateData('descripcion', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                                {createErrors.descripcion && <p className="text-rose-400 text-[11px] mt-1">{createErrors.descripcion}</p>}
                            </div>

                            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Datos Bancarios (Opcional si el pago es en efectivo)
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                                            NIT / CI
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Opcional"
                                            value={createData.nit_ci}
                                            onChange={(e) => setCreateData('nit_ci', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                        />
                                        {createErrors.nit_ci && <p className="text-rose-400 text-[11px] mt-1">{createErrors.nit_ci}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                                            Banco Destino
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: BNB, Mercantil..."
                                            value={createData.banco}
                                            onChange={(e) => setCreateData('banco', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                        />
                                        {createErrors.banco && <p className="text-rose-400 text-[11px] mt-1">{createErrors.banco}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                                            Tipo de Cuenta
                                        </label>
                                        <select
                                            value={createData.tipo_cuenta}
                                            onChange={(e) => setCreateData('tipo_cuenta', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                        >
                                            <option value="Caja de Ahorro">Caja de Ahorro</option>
                                            <option value="Cuenta Corriente">Cuenta Corriente</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                                            Número de Cuenta
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Opcional"
                                            value={createData.numero_cuenta}
                                            onChange={(e) => setCreateData('numero_cuenta', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                        />
                                        {createErrors.numero_cuenta && <p className="text-rose-400 text-[11px] mt-1">{createErrors.numero_cuenta}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Titular de la Cuenta Bancaria
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nombre del titular"
                                        value={createData.nombre_titular_cuenta}
                                        onChange={(e) => setCreateData('nombre_titular_cuenta', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                                    />
                                    {createErrors.nombre_titular_cuenta && <p className="text-rose-400 text-[11px] mt-1">{createErrors.nombre_titular_cuenta}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createProcessing}
                                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition"
                                >
                                    Registrar Proveedor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Editar Proveedor */}
            {showEditModal && activeProveedor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                            <Edit3 className="w-5 h-5 text-amber-400" />
                            <span>Editar Proveedor #{activeProveedor.id}</span>
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">
                            Actualiza la razón social, descripción o datos bancarios del proveedor
                        </p>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Nombre o Razón Social <span className="text-amber-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editData.nombre_razon_social}
                                    onChange={(e) => setEditData('nombre_razon_social', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                                {editErrors.nombre_razon_social && <p className="text-rose-400 text-[11px] mt-1">{editErrors.nombre_razon_social}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Descripción / Rubro / Observaciones (Opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Gastos de oficina, compras en efectivo..."
                                    value={editData.descripcion}
                                    onChange={(e) => setEditData('descripcion', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                                {editErrors.descripcion && <p className="text-rose-400 text-[11px] mt-1">{editErrors.descripcion}</p>}
                            </div>

                            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Datos Bancarios (Opcional)
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                                            NIT / CI
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.nit_ci}
                                            onChange={(e) => setEditData('nit_ci', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                        />
                                        {editErrors.nit_ci && <p className="text-rose-400 text-[11px] mt-1">{editErrors.nit_ci}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                                            Banco Destino
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.banco}
                                            onChange={(e) => setEditData('banco', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                        />
                                        {editErrors.banco && <p className="text-rose-400 text-[11px] mt-1">{editErrors.banco}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                                            Tipo de Cuenta
                                        </label>
                                        <select
                                            value={editData.tipo_cuenta}
                                            onChange={(e) => setEditData('tipo_cuenta', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                        >
                                            <option value="Caja de Ahorro">Caja de Ahorro</option>
                                            <option value="Cuenta Corriente">Cuenta Corriente</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                                            Número de Cuenta
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.numero_cuenta}
                                            onChange={(e) => setEditData('numero_cuenta', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                                        />
                                        {editErrors.numero_cuenta && <p className="text-rose-400 text-[11px] mt-1">{editErrors.numero_cuenta}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Titular de la Cuenta Bancaria
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.nombre_titular_cuenta}
                                        onChange={(e) => setEditData('nombre_titular_cuenta', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                    />
                                    {editErrors.nombre_titular_cuenta && <p className="text-rose-400 text-[11px] mt-1">{editErrors.nombre_titular_cuenta}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SolicitanteLayout>
    );
}
