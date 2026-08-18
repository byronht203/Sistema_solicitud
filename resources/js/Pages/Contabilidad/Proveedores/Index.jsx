import { useState } from 'react';
import ContabilidadLayout from '@/Layouts/ContabilidadLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import {
    Truck,
    Search,
    Plus,
    Edit,
    Trash2,
    Landmark,
    Copy,
    Check,
    X,
    Building2,
    CheckCircle2
} from 'lucide-react';

export default function Index({ proveedores, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [copiedField, setCopiedField] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingProveedor, setEditingProveedor] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        nombre_razon_social: '',
        nit_ci: '',
        banco: '',
        tipo_cuenta: 'Caja de Ahorro',
        numero_cuenta: '',
        nombre_titular_cuenta: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('contabilidad.proveedores'), { search }, { preserveState: true, replace: true });
    };

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const openCreateModal = () => {
        setEditingProveedor(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (proveedor) => {
        setEditingProveedor(proveedor);
        setData({
            nombre_razon_social: proveedor.nombre_razon_social,
            nit_ci: proveedor.nit_ci,
            banco: proveedor.banco,
            tipo_cuenta: proveedor.tipo_cuenta,
            numero_cuenta: proveedor.numero_cuenta,
            nombre_titular_cuenta: proveedor.nombre_titular_cuenta,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingProveedor) {
            put(route('proveedores.update', editingProveedor.id), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        } else {
            post(route('proveedores.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    return (
        <ContabilidadLayout title="Verificación Bancaria de Proveedores">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Landmark className="w-6 h-6 text-emerald-400" />
                        <span>Verificación y Catálogo de Cuentas Bancarias</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Consulta y verifica las cuentas bancarias registradas para transferencias y giros corporativos.
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Registrar Nuevo Proveedor</span>
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
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
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
                {proveedores.data.map((prov) => (
                    <div
                        key={prov.id}
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-slate-700 transition group flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase">
                                    NIT/CI: {prov.nit_ci}
                                </span>
                                <button
                                    onClick={() => openEditModal(prov)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                    title="Editar Cuenta Bancaria"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="text-base font-extrabold text-white mb-1 line-clamp-1" title={prov.nombre_razon_social}>
                                {prov.nombre_razon_social}
                            </h3>

                            {/* Bank Card Info */}
                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 my-3 text-xs space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Banco:</span>
                                    <span className="font-bold text-emerald-400">{prov.banco}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Tipo Cuenta:</span>
                                    <span className="font-semibold text-slate-300">{prov.tipo_cuenta}</span>
                                </div>

                                <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                                    <span className="text-slate-400">N° Cuenta:</span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-mono font-extrabold text-white text-xs">{prov.numero_cuenta}</span>
                                        <button
                                            onClick={() => handleCopy(prov.numero_cuenta, `prov_cta_${prov.id}`)}
                                            className="p-1 text-slate-400 hover:text-emerald-400 transition"
                                            title="Copiar N° de Cuenta"
                                        >
                                            {copiedField === `prov_cta_${prov.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                                    <span className="text-slate-400">Titular:</span>
                                    <span className="font-bold text-slate-200 truncate max-w-[140px]" title={prov.nombre_titular_cuenta}>
                                        {prov.nombre_titular_cuenta}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Registrado por: {prov.creador?.nombre || 'Sistema'}</span>
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Verificado
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {proveedores.links && proveedores.links.length > 3 && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between text-xs text-slate-400">
                    <div>
                        Mostrando {proveedores.from} a {proveedores.to} de {proveedores.total} proveedores
                    </div>
                    <div className="flex items-center gap-1">
                        {proveedores.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                    link.active
                                        ? 'bg-emerald-600 text-white font-bold'
                                        : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                                } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Modal: Crear / Editar Proveedor */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-bold text-white mb-4">
                            {editingProveedor ? 'Editar Datos Bancarios de Proveedor' : 'Registrar Nuevo Proveedor'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Nombre o Razón Social <span className="text-emerald-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.nombre_razon_social}
                                    onChange={(e) => setData('nombre_razon_social', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        NIT / CI <span className="text-emerald-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.nit_ci}
                                        onChange={(e) => setData('nit_ci', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Banco Destino <span className="text-emerald-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: BNB, Banco Mercantil, Económico..."
                                        value={data.banco}
                                        onChange={(e) => setData('banco', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Tipo de Cuenta <span className="text-emerald-400">*</span>
                                    </label>
                                    <select
                                        value={data.tipo_cuenta}
                                        onChange={(e) => setData('tipo_cuenta', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        <option value="Caja de Ahorro">Caja de Ahorro</option>
                                        <option value="Cuenta Corriente">Cuenta Corriente</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Número de Cuenta <span className="text-emerald-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.numero_cuenta}
                                        onChange={(e) => setData('numero_cuenta', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Titular de la Cuenta Bancaria <span className="text-emerald-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.nombre_titular_cuenta}
                                    onChange={(e) => setData('nombre_titular_cuenta', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                                >
                                    {editingProveedor ? 'Guardar Cambios' : 'Registrar Proveedor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ContabilidadLayout>
    );
}
