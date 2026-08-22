import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router, Link } from '@inertiajs/react';
import {
    Users,
    UserPlus,
    Search,
    Shield,
    Edit3,
    Trash2,
    X,
    Mail,
    BadgeCheck,
    Lock,
    Building2,
    CheckCircle2,
    Briefcase
} from 'lucide-react';

export default function UsuariosIndex({ usuarios, roles = [], empresas = [], filters = {} }) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [activeUser, setActiveUser] = useState(null);

    const [searchState, setSearchState] = useState(filters.search || '');
    const [rolState, setRolState] = useState(filters.rol_id || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        rol_id: '',
        nombre: '',
        apellidos: '',
        cargo: '',
        correo: '',
        password: '',
        correos_empresas: {},
    });

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('usuarios.index'), {
            search: searchState,
            rol_id: rolState,
        }, { preserveState: true });
    };

    const handleResetFilters = () => {
        setSearchState('');
        setRolState('');
        router.get(route('usuarios.index'));
    };

    const openCreateModal = () => {
        reset();
        const initialCorreos = {};
        empresas.forEach((emp) => { initialCorreos[emp.id] = ''; });
        setData({
            rol_id: roles.length > 0 ? roles[0].id : '',
            nombre: '',
            apellidos: '',
            cargo: '',
            correo: '',
            password: '',
            correos_empresas: initialCorreos,
        });
        setCreateModalOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('usuarios.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            }
        });
    };

    const openEditModal = (u) => {
        setActiveUser(u);
        const userCorreos = {};
        empresas.forEach((emp) => {
            const pivotMatch = (u.empresas || []).find((e) => e.id === emp.id);
            userCorreos[emp.id] = pivotMatch ? (pivotMatch.pivot?.correo_corporativo || '') : '';
        });

        setData({
            rol_id: u.rol_id,
            nombre: u.nombre,
            apellidos: u.apellidos,
            cargo: u.cargo || '',
            correo: u.correo,
            password: '',
            correos_empresas: userCorreos,
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(route('usuarios.update', activeUser.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                reset();
            }
        });
    };

    const handleDelete = (u) => {
        if (confirm(`¿Estás seguro de desactivar/eliminar al usuario ${u.nombre_completo}?`)) {
            router.delete(route('usuarios.destroy', u.id));
        }
    };

    const getRoleBadge = (rolNombre) => {
        const nombre = (rolNombre || '').toLowerCase();
        if (nombre.includes('admin')) {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><Shield className="w-3.5 h-3.5" /> Administrador</span>;
        } else if (nombre.includes('jefe')) {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><BadgeCheck className="w-3.5 h-3.5" /> Jefe Aprobador</span>;
        } else if (nombre.includes('caja chica') || nombre.includes('cajachica')) {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">🪙 Caja Chica (Fralak)</span>;
        } else if (nombre.includes('conta')) {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">📊 Contabilidad</span>;
        } else {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">📝 Solicitante</span>;
        }
    };

    return (
        <AdminLayout title="Gestión de Usuarios">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-400" />
                        Usuarios y Accesos del Sistema
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Administración de cuentas de acceso, roles, cargos y asignación de correos corporativos
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            {/* Filters */}
            <form onSubmit={handleFilterSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, cargo o correo..."
                            value={searchState}
                            onChange={(e) => setSearchState(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>

                    <div>
                        <select
                            value={rolState}
                            onChange={(e) => setRolState(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">Todos los Roles</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>{r.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-3 rounded-xl transition">
                            Filtrar
                        </button>
                        <button type="button" onClick={handleResetFilters} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-xl transition">
                            Limpiar
                        </button>
                    </div>
                </div>
            </form>

            {/* Users Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                            <tr>
                                <th className="px-5 py-3.5">Usuario / Nombres y Apellidos</th>
                                <th className="px-5 py-3.5">Rol de Acceso</th>
                                <th className="px-5 py-3.5">Correos Corporativos por Empresa</th>
                                <th className="px-5 py-3.5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {usuarios.data.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-slate-500">
                                        No se encontraron usuarios registrados.
                                    </td>
                                </tr>
                            ) : (
                                usuarios.data.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-white text-sm">{u.nombre_completo}</div>
                                            {u.cargo && (
                                                <div className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                                                    <Briefcase className="w-3 h-3 text-slate-500" />
                                                    <span>{u.cargo}</span>
                                                </div>
                                            )}
                                            <div className="text-xs text-indigo-400 flex items-center gap-1.5 mt-1 font-mono">
                                                <Mail className="w-3.5 h-3.5 text-indigo-400/80" />
                                                <span>Login: {u.correo}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {getRoleBadge(u.rol?.nombre)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-1.5 max-w-md">
                                                {empresas.map((emp) => {
                                                    const pivotMatch = (u.empresas || []).find((e) => e.id === emp.id);
                                                    const correoCorp = pivotMatch ? pivotMatch.pivot?.correo_corporativo : null;
                                                    return (
                                                        <div
                                                            key={emp.id}
                                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border flex items-center gap-1.5 ${
                                                                correoCorp
                                                                    ? 'bg-slate-950/80 border-slate-700 text-slate-200'
                                                                    : 'bg-slate-950/30 border-dashed border-slate-800 text-slate-500'
                                                            }`}
                                                            title={`${emp.nombre}: ${correoCorp || 'Sin correo específico asignado'}`}
                                                        >
                                                            <strong className="text-indigo-400 font-bold">{emp.nombre.split(' ')[0]}:</strong>
                                                            <span>{correoCorp || 'No asignado'}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(u)}
                                                    className="p-2 rounded-xl bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition"
                                                    title="Editar Usuario"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u)}
                                                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
                {usuarios.links && usuarios.links.length > 3 && (
                    <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                            Mostrando {usuarios.from} a {usuarios.to} de {usuarios.total} usuarios
                        </span>
                        <div className="flex gap-1">
                            {usuarios.links.map((link, idx) => (
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
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-400" />
                                {createModalOpen ? 'Registrar Nuevo Usuario' : `Editar Usuario: ${activeUser?.nombre_completo}`}
                            </h3>
                            <button onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); }} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={createModalOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4 text-xs">
                            {/* Nombres y Apellidos */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">
                                        Nombres <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        placeholder="Ej. Carlos Alberto"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.nombre && <p className="text-rose-400 mt-1">{errors.nombre}</p>}
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">
                                        Apellidos <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.apellidos}
                                        onChange={(e) => setData('apellidos', e.target.value)}
                                        placeholder="Ej. Mendoza Vargas"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.apellidos && <p className="text-rose-400 mt-1">{errors.apellidos}</p>}
                                </div>
                            </div>

                            {/* Cargo Institucional */}
                            <div>
                                <label className="block font-semibold text-slate-300 uppercase mb-1">
                                    Cargo Institucional
                                </label>
                                <input
                                    type="text"
                                    value={data.cargo}
                                    onChange={(e) => setData('cargo', e.target.value)}
                                    placeholder="Ej. Gerente de Línea / Asistente de Sistemas / Auditor"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.cargo && <p className="text-rose-400 mt-1">{errors.cargo}</p>}
                            </div>

                            {/* Rol de Acceso & Correo Principal (Login) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">
                                        Rol de Acceso <span className="text-rose-400">*</span>
                                    </label>
                                    <select
                                        value={data.rol_id}
                                        onChange={(e) => setData('rol_id', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-semibold focus:ring-1 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Seleccionar Rol...</option>
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.id}>{r.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.rol_id && <p className="text-rose-400 mt-1">{errors.rol_id}</p>}
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-300 uppercase mb-1">
                                        Correo Principal (Login) <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={data.correo}
                                        onChange={(e) => setData('correo', e.target.value)}
                                        placeholder="usuario@empresa.com"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.correo && <p className="text-rose-400 mt-1">{errors.correo}</p>}
                                </div>
                            </div>

                            {/* Sección: Correos Corporativos por Empresa */}
                            {empresas.length > 0 && (
                                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                                        <Mail className="w-4 h-4" />
                                        <span>Correos Corporativos por Empresa (Zoho Reply-To Dinámico)</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                        Configura el correo corporativo del usuario para cada empresa (Fralak, Dotmed, CID). Estos correos se usarán automáticamente para el envío de notificaciones oficiales.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {empresas.map((emp) => (
                                            <div key={emp.id}>
                                                <label className="block font-semibold text-slate-300 mb-1 text-[11px]">
                                                    {emp.nombre}
                                                </label>
                                                <input
                                                    type="email"
                                                    placeholder={`correo@${emp.nombre.toLowerCase().split(' ')[0]}.com.bo`}
                                                    value={data.correos_empresas[emp.id] || ''}
                                                    onChange={(e) => setData('correos_empresas', {
                                                        ...data.correos_empresas,
                                                        [emp.id]: e.target.value
                                                    })}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white text-[11px] focus:ring-1 focus:ring-indigo-500 font-mono"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Contraseña */}
                            <div>
                                <label className="block font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Contraseña {editModalOpen && '(Dejar en blanco para mantener la actual)'}</span>
                                    {createModalOpen && <span className="text-rose-400">*</span>}
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-indigo-500"
                                    required={createModalOpen}
                                />
                                {errors.password && <p className="text-rose-400 mt-1">{errors.password}</p>}
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); }}
                                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                                >
                                    {createModalOpen ? 'Registrar Usuario' : 'Actualizar Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
