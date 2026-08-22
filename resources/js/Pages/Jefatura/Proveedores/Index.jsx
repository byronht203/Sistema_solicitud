import { useState } from 'react';
import JefaturaLayout from '@/Layouts/JefaturaLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import {
    Truck,
    Search,
    Plus,
    Edit3,
    Landmark,
    Copy,
    Check,
    X,
    Building2,
    CheckCircle2,
    ShieldCheck,
    Send
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
        router.get(route('jefatura.proveedores'), { search }, { preserveState: true, replace: true });
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
        <JefaturaLayout title="Gestión de Proveedores y Cuentas Bancarias">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Truck className="w-6 h-6 text-indigo-400" />
                        <span>Catálogo de Proveedores Registrados</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Registra, consulta y edita los datos bancarios y fiscales de proveedores para tus solicitudes de compra y pago.
                    </p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Proveedor</span>
                </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            placeholder="Buscar por Razón Social, NIT/CI, Banco o Nro. de Cuenta..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
                    >
                        Buscar
                    </button>
                </div>
            </form>

            {/* Providers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                {proveedores.data.map((prov) => (
                    <div
                        key={prov.id}
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-slate-700 transition group flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-extrabold uppercase">
                                    NIT/CI: {prov.nit_ci || 'S/N'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(prov)}
                                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                        title="Editar Proveedor"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Habilitado
                                    </span>
                                </div>
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
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
                                                <Landmark className="w-3.5 h-3.5 text-indigo-400" />
                                                <span>{prov.banco || 'Banco'}</span>
                                            </span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                                                {prov.tipo_cuenta || 'Cta. Ahorro'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-800/50">
                                            <div>
                                                <div className="text-[10px] text-slate-400">Nro. de Cuenta:</div>
                                                <div className="font-mono font-bold text-white text-xs tracking-wider">
                                                    {prov.numero_cuenta}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(prov.numero_cuenta, `cuenta-${prov.id}`)}
                                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                                title="Copiar Nro de Cuenta"
                                            >
                                                {copiedField === `cuenta-${prov.id}` ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>

                                        {prov.nombre_titular_cuenta && (
                                            <div className="text-[11px] text-slate-400 pt-1 flex justify-between">
                                                <span>Titular:</span>
                                                <span className="text-slate-200 font-semibold">{prov.nombre_titular_cuenta}</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-2 text-slate-500 text-xs italic">
                                        Sin cuenta bancaria registrada (Pago en efectivo/cheque)
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                            <span>Registrado en sistema</span>
                            <button
                                onClick={() => openEditModal(prov)}
                                className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                            >
                                Editar datos
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {proveedores.links && proveedores.links.length > 3 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
                    <span>Mostrando {proveedores.from || 0} a {proveedores.to || 0} de {proveedores.total} proveedores</span>
                    <div className="flex gap-1">
                        {proveedores.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                    link.active
                                        ? 'bg-indigo-600 text-white font-bold'
                                        : link.url
                                        ? 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                                        : 'text-slate-600 cursor-not-allowed'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL NUEVO PROVEEDOR */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Truck className="w-5 h-5 text-indigo-400" />
                                <span>Registrar Nuevo Proveedor / Beneficiario</span>
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-300 mb-1">
                                    Nombre o Razón Social <span className="text-indigo-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Farmacéutica Boliviana S.A."
                                    value={createData.nombre_razon_social}
                                    onChange={(e) => setCreateData('nombre_razon_social', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-300 mb-1">Descripción / Rubro</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Insumos médicos y equipamiento quirúrgico"
                                    value={createData.descripcion}
                                    onChange={(e) => setCreateData('descripcion', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">NIT / CI</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 1029384019"
                                        value={createData.nit_ci}
                                        onChange={(e) => setCreateData('nit_ci', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">Banco</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Banco Bisa / BNB / BCP"
                                        value={createData.banco}
                                        onChange={(e) => setCreateData('banco', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">Tipo de Cuenta</label>
                                    <select
                                        value={createData.tipo_cuenta}
                                        onChange={(e) => setCreateData('tipo_cuenta', e.target.value)}
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
                                        value={createData.numero_cuenta}
                                        onChange={(e) => setCreateData('numero_cuenta', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-300 mb-1">Nombre del Titular</label>
                                <input
                                    type="text"
                                    placeholder="Nombre completo o razón social del titular"
                                    value={createData.nombre_titular_cuenta}
                                    onChange={(e) => setCreateData('nombre_titular_cuenta', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createProcessing}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1.5"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>{createProcessing ? 'Guardando...' : 'Registrar Proveedor'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR PROVEEDOR */}
            {showEditModal && activeProveedor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Edit3 className="w-5 h-5 text-indigo-400" />
                                <span>Editar Proveedor #{activeProveedor.id}</span>
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-300 mb-1">
                                    Nombre o Razón Social <span className="text-indigo-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editData.nombre_razon_social}
                                    onChange={(e) => setEditData('nombre_razon_social', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-300 mb-1">Descripción / Rubro</label>
                                <input
                                    type="text"
                                    value={editData.descripcion}
                                    onChange={(e) => setEditData('descripcion', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">NIT / CI</label>
                                    <input
                                        type="text"
                                        value={editData.nit_ci}
                                        onChange={(e) => setEditData('nit_ci', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">Banco</label>
                                    <input
                                        type="text"
                                        value={editData.banco}
                                        onChange={(e) => setEditData('banco', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">Tipo de Cuenta</label>
                                    <select
                                        value={editData.tipo_cuenta}
                                        onChange={(e) => setEditData('tipo_cuenta', e.target.value)}
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
                                        value={editData.numero_cuenta}
                                        onChange={(e) => setEditData('numero_cuenta', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-300 mb-1">Nombre del Titular</label>
                                <input
                                    type="text"
                                    value={editData.nombre_titular_cuenta}
                                    onChange={(e) => setEditData('nombre_titular_cuenta', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1.5"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>{editProcessing ? 'Guardando...' : 'Guardar Cambios'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </JefaturaLayout>
    );
}
