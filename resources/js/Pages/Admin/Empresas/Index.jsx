import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import JefaturaLayout from '@/Layouts/JefaturaLayout';
import ContabilidadLayout from '@/Layouts/ContabilidadLayout';
import SolicitanteLayout from '@/Layouts/SolicitanteLayout';
import { useForm, router, Link, usePage } from '@inertiajs/react';
import { getEmpresaLogo } from '@/Utils/empresaLogo';
import {
    Building2,
    Plus,
    Search,
    Edit3,
    Trash2,
    X,
    FileSpreadsheet,
    Building
} from 'lucide-react';

export default function EmpresasIndex({ empresas, filters }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const rolNombre = user.rol?.nombre || '';
    const isAdmin = rolNombre === 'Administrador';

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [activeEmpresa, setActiveEmpresa] = useState(null);

    const [searchState, setSearchState] = useState(filters?.search || '');

    const { data, setData, post, put, processing, reset } = useForm({
        nombre: '',
        nit: '',
    });

    // Theme Config per Role
    const getThemeConfig = () => {
        switch (rolNombre) {
            case 'Solicitante':
                return {
                    textColor: 'text-cyan-400',
                    btnBg: 'bg-cyan-600 hover:bg-cyan-500',
                    btnShadow: 'shadow-cyan-600/30',
                    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                    borderHover: 'hover:border-cyan-500/50',
                    focusRing: 'focus:ring-cyan-500',
                };
            case 'Jefe':
                return {
                    textColor: 'text-violet-400',
                    btnBg: 'bg-violet-600 hover:bg-violet-500',
                    btnShadow: 'shadow-violet-600/30',
                    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                    borderHover: 'hover:border-violet-500/50',
                    focusRing: 'focus:ring-violet-500',
                };
            case 'Contabilidad':
                return {
                    textColor: 'text-emerald-400',
                    btnBg: 'bg-emerald-600 hover:bg-emerald-500',
                    btnShadow: 'shadow-emerald-600/30',
                    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    borderHover: 'hover:border-emerald-500/50',
                    focusRing: 'focus:ring-emerald-500',
                };
            default: // Administrador
                return {
                    textColor: 'text-indigo-400',
                    btnBg: 'bg-indigo-600 hover:bg-indigo-500',
                    btnShadow: 'shadow-indigo-600/30',
                    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                    borderHover: 'hover:border-indigo-500/50',
                    focusRing: 'focus:ring-indigo-500',
                };
        }
    };

    const theme = getThemeConfig();

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('empresas.index'), { search: searchState }, { preserveState: true });
    };

    const handleResetFilters = () => {
        setSearchState('');
        router.get(route('empresas.index'));
    };

    const openCreateModal = () => {
        reset();
        setCreateModalOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('empresas.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            }
        });
    };

    const openEditModal = (emp) => {
        setActiveEmpresa(emp);
        setData({
            nombre: emp.nombre,
            nit: emp.nit || '',
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(route('empresas.update', activeEmpresa.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                reset();
            }
        });
    };

    const handleDelete = (emp) => {
        if (confirm(`¿Estás seguro de eliminar la empresa ${emp.nombre}?`)) {
            router.delete(route('empresas.destroy', emp.id));
        }
    };

    const content = (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Building2 className={`w-6 h-6 ${theme.textColor}`} />
                        <span>Empresas Corporativas y Razones Sociales</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Directorio de empresas registradas (Fralak SRL, Dotmed SRL, CID SRL)
                    </p>
                </div>

                {isAdmin && (
                    <button
                        onClick={openCreateModal}
                        className={`px-5 py-2.5 ${theme.btnBg} text-white font-semibold text-xs rounded-xl shadow-lg ${theme.btnShadow} flex items-center gap-2 transition`}
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nueva Empresa</span>
                    </button>
                )}
            </div>

            {/* Filter Search */}
            <form onSubmit={handleFilterSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Buscar empresa por nombre o NIT..."
                            value={searchState}
                            onChange={(e) => setSearchState(e.target.value)}
                            className={`w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 ${theme.focusRing}`}
                        />
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className={`${theme.btnBg} text-white font-semibold text-xs py-2 px-4 rounded-xl transition`}>
                            Buscar
                        </button>
                        <button type="button" onClick={handleResetFilters} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-xl transition">
                            Limpiar
                        </button>
                    </div>
                </div>
            </form>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {empresas.data.map((emp) => {
                    // Always use logos WITH background (sinFondo = false)
                    const logoUrl = getEmpresaLogo(emp.nombre, false);
                    return (
                        <div key={emp.id} className={`bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group ${theme.borderHover} transition shadow-xl flex flex-col justify-between`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition" />

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    {/* Rounded White Card Container for Logo with Background */}
                                    <div className="h-16 w-auto p-2 bg-white rounded-2xl border border-slate-200 shadow-md flex items-center justify-center">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt={emp.nombre} className="h-12 w-auto object-contain rounded-lg" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xl">
                                                <Building className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    {isAdmin && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openEditModal(emp)}
                                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition"
                                                title="Editar"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp)}
                                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-extrabold text-white tracking-tight">{emp.nombre}</h3>
                                <p className="text-xs text-slate-400 mt-1 font-mono">
                                    NIT: <strong className="text-slate-300">{emp.nit || 'Sin NIT registrado'}</strong>
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                <span className="text-slate-400 flex items-center gap-1">
                                    <FileSpreadsheet className={`w-3.5 h-3.5 ${theme.textColor}`} />
                                    Solicitudes Asociadas:
                                </span>
                                <span className={`font-extrabold text-sm px-2.5 py-0.5 rounded-full ${theme.badge}`}>
                                    {emp.solicitudes_count || 0}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {empresas.links && empresas.links.length > 3 && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                        Mostrando {empresas.from} a {empresas.to} de {empresas.total} empresas
                    </span>
                    <div className="flex gap-1">
                        {empresas.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                    link.active ? `${theme.btnBg} text-white` : link.url ? 'bg-slate-950 text-slate-300 hover:bg-slate-800' : 'bg-slate-950 text-slate-600 cursor-not-allowed'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* CREATE / EDIT MODAL (ADMIN ONLY) */}
            {isAdmin && (createModalOpen || editModalOpen) && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Building2 className={`w-5 h-5 ${theme.textColor}`} />
                                {createModalOpen ? 'Registrar Nueva Empresa' : `Editar Empresa: ${activeEmpresa?.nombre}`}
                            </h3>
                            <button onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); }} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={createModalOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-300 uppercase mb-1">Nombre de la Empresa</label>
                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    placeholder="Ej. Fralak SRL"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-300 uppercase mb-1">Número de NIT</label>
                                <input
                                    type="text"
                                    value={data.nit}
                                    onChange={(e) => setData('nit', e.target.value)}
                                    placeholder="Ej. 1029384019"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
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
                                    className={`px-5 py-2.5 ${theme.btnBg} text-white font-semibold rounded-xl shadow-lg ${theme.btnShadow}`}
                                >
                                    {createModalOpen ? 'Guardar Empresa' : 'Actualizar Empresa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    // Dynamically render matching layout for user's role
    switch (rolNombre) {
        case 'Solicitante':
            return <SolicitanteLayout title="Empresas Corporativas">{content}</SolicitanteLayout>;
        case 'Jefe':
            return <JefaturaLayout title="Empresas Corporativas">{content}</JefaturaLayout>;
        case 'Contabilidad':
            return <ContabilidadLayout title="Empresas Corporativas">{content}</ContabilidadLayout>;
        default: // Administrador
            return <AdminLayout title="Gestión de Empresas">{content}</AdminLayout>;
    }
}
