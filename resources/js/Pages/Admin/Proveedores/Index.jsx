import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router, Link } from '@inertiajs/react';
import {
    Truck,
    Plus,
    Search,
    Building,
    CreditCard,
    Edit3,
    Trash2,
    X,
    User,
    FileText
} from 'lucide-react';

export default function ProveedoresIndex({ proveedores, filters }) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [activeProveedor, setActiveProveedor] = useState(null);

    const [searchState, setSearchState] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nombre_razon_social: '',
        nit_ci: '',
        banco: '',
        tipo_cuenta: 'Caja de Ahorro',
        numero_cuenta: '',
        nombre_titular_cuenta: '',
    });

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('proveedores.index'), { search: searchState }, { preserveState: true });
    };

    const handleResetFilters = () => {
        setSearchState('');
        router.get(route('proveedores.index'));
    };

    const openCreateModal = () => {
        reset();
        setCreateModalOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('proveedores.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            }
        });
    };

    const openEditModal = (p) => {
        setActiveProveedor(p);
        setData({
            nombre_razon_social: p.nombre_razon_social,
            nit_ci: p.nit_ci,
            banco: p.banco,
            tipo_cuenta: p.tipo_cuenta,
            numero_cuenta: p.numero_cuenta,
            nombre_titular_cuenta: p.nombre_titular_cuenta,
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(route('proveedores.update', activeProveedor.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                reset();
            }
        });
    };

    const handleDelete = (p) => {
        if (confirm(`¿Estás seguro de eliminar el proveedor ${p.nombre_razon_social}?`)) {
            router.delete(route('proveedores.destroy', p.id));
        }
    };

    return (
        <AdminLayout title="Gestión de Proveedores">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Truck className="w-6 h-6 text-indigo-400" />
                        Catálogo de Proveedores
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Gestión de razones sociales, NIT/CI y datos bancarios para transferencias
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Proveedor</span>
                </button>
            </div>

            {/* Filter Search */}
            <form onSubmit={handleFilterSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Buscar por razón social, NIT, banco, nro de cuenta o titular..."
                            value={searchState}
                            onChange={(e) => setSearchState(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-4 rounded-xl transition">
                            Buscar
                        </button>
                        <button type="button" onClick={handleResetFilters} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-xl transition">
                            Limpiar
                        </button>
                    </div>
                </div>
            </form>

            {/* Suppliers Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                            <tr>
                                <th className="px-4 py-3.5">Razón Social / NIT</th>
                                <th className="px-4 py-3.5">Entidad Bancaria</th>
                                <th className="px-4 py-3.5">Número de Cuenta</th>
                                <th className="px-4 py-3.5">Titular de Cuenta</th>
                                <th className="px-4 py-3.5">Registrado Por</th>
                                <th className="px-4 py-3.5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {proveedores.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-slate-500">
                                        No hay proveedores registrados aún.
                                    </td>
                                </tr>
                            ) : (
                                proveedores.data.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-white text-sm">{p.nombre_razon_social}</div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">NIT/CI: {p.nit_ci}</div>
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-slate-200">
                                            <div className="flex items-center gap-1.5">
                                                <Building className="w-3.5 h-3.5 text-indigo-400" />
                                                {p.banco}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-mono font-bold text-indigo-300">{p.numero_cuenta}</div>
                                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                                {p.tipo_cuenta}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-200 font-medium">
                                            {p.nombre_titular_cuenta}
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                                            {p.creador?.nombre_completo || 'Sistema'}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(p)}
                                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition"
                                                    title="Editar Proveedor"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p)}
                                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                                                    title="Eliminar Proveedor"
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
                {proveedores.links && proveedores.links.length > 3 && (
                    <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                            Mostrando {proveedores.from} a {proveedores.to} de {proveedores.total} proveedores
                        </span>
                        <div className="flex gap-1">
                            {proveedores.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                        link.active ? 'bg-indigo-600 text-white' : link.url ? 'bg-slate-900 text-slate-300 hover:bg-slate-800' : 'bg-slate-950 text-slate-600 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE / EDIT MODAL */}
            {(createModalOpen || editModalOpen) && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Truck className="w-5 h-5 text-indigo-400" />
                                {createModalOpen ? 'Registrar Nuevo Proveedor' : `Editar Proveedor: ${activeProveedor?.nombre_razon_social}`}
                            </h3>
                            <button onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); }} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={createModalOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">Nombre o Razón Social</label>
                                    <input
                                        type="text"
                                        value={data.nombre_razon_social}
                                        onChange={(e) => setData('nombre_razon_social', e.target.value)}
                                        placeholder="Ej. TechSolutions SRL"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">NIT / C.I.</label>
                                    <input
                                        type="text"
                                        value={data.nit_ci}
                                        onChange={(e) => setData('nit_ci', e.target.value)}
                                        placeholder="1029384019"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">Entidad Bancaria</label>
                                    <input
                                        type="text"
                                        value={data.banco}
                                        onChange={(e) => setData('banco', e.target.value)}
                                        placeholder="Ej. Banco Nacional de Bolivia"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">Tipo de Cuenta</label>
                                    <select
                                        value={data.tipo_cuenta}
                                        onChange={(e) => setData('tipo_cuenta', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-semibold"
                                    >
                                        <option value="Caja de Ahorro">Caja de Ahorro</option>
                                        <option value="Cuenta Corriente">Cuenta Corriente</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-300 uppercase mb-1">Número de Cuenta Bancaria</label>
                                <input
                                    type="text"
                                    value={data.numero_cuenta}
                                    onChange={(e) => setData('numero_cuenta', e.target.value)}
                                    placeholder="1000-2938472-01"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-300 uppercase mb-1">Nombre Titular de la Cuenta</label>
                                <input
                                    type="text"
                                    value={data.nombre_titular_cuenta}
                                    onChange={(e) => setData('nombre_titular_cuenta', e.target.value)}
                                    placeholder="Nombre completo o razón social en el banco"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                                    required
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); }}
                                    className="px-4 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30"
                                >
                                    {createModalOpen ? 'Guardar Proveedor' : 'Actualizar Proveedor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
