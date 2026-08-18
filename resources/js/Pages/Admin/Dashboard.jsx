import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import {
    FileSpreadsheet,
    Clock,
    CheckCircle2,
    DollarSign,
    AlertCircle,
    XCircle,
    Users,
    Truck,
    Building2,
    Eye,
    PlusCircle,
    ArrowUpRight,
    TrendingUp,
    FileText,
    ShieldAlert
} from 'lucide-react';

export default function Dashboard({ stats, solicitudesRecientes, solicitudesPorEmpresa }) {
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Pendiente Jefatura</span>;
            case 'Aprobado_Jefatura':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Aprobado Jefe (Por Pagar)</span>;
            case 'Pagado':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><DollarSign className="w-3.5 h-3.5" /> Pagado</span>;
            case 'Observado':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20"><AlertCircle className="w-3.5 h-3.5" /> Observado</span>;
            case 'Rechazado':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><XCircle className="w-3.5 h-3.5" /> Rechazado</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-300">{estado}</span>;
        }
    };

    return (
        <AdminLayout title="Panel Principal - Administrador">
            {/* Header Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-indigo-950/80 border border-indigo-500/20 p-6 md:p-8 mb-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-3">
                            <ShieldAlert className="w-4 h-4 text-indigo-400" />
                            Red Médica Corporativa • Administración Central
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            Plataforma Médica de Solicitudes Corporativas
                        </h2>
                        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                            Supervisión centralizada de compras y solicitudes para distribución de equipamiento médico en las empresas <strong className="text-white">Fralak SRL, Dotmed SRL y CID SRL</strong>.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            href={route('solicitudes.index')}
                            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>Ver Todas las Solicitudes</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Total Solicitudes */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/40 transition">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Solicitudes</span>
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                            <FileSpreadsheet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white">{stats.totalSolicitudes}</div>
                    <p className="text-xs text-slate-400 mt-1">Registradas en el sistema</p>
                </div>

                {/* Pendientes Jefatura */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/40 transition">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pendientes Jefatura</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white">{stats.pendientes}</div>
                    <p className="text-xs text-amber-400/80 mt-1">Requieren revisión de Jefe</p>
                </div>

                {/* Aprobadas Jefatura (Listas para Pago) */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/40 transition">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Aprobadas p/ Pago</span>
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white">{stats.aprobadasJefe}</div>
                    <p className="text-xs text-cyan-400/80 mt-1">Esperando desembolso conta</p>
                </div>

                {/* Pagadas */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Pagadas Exitosas</span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white">{stats.pagadas}</div>
                    <p className="text-xs text-emerald-400/80 mt-1">Completadas exitosamente</p>
                </div>
            </div>

            {/* Financial Totals & Entity Counts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Financial Summary */}
                <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-400" />
                                Acumulado Económico Solicitado
                            </h3>
                            <p className="text-xs text-slate-400">Total acumulado en solicitudes válidas</p>
                        </div>
                        <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 font-semibold">
                            BOB / USD
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800/80">
                            <div className="text-xs text-slate-400 font-semibold mb-1">Monto en Bolivianos (BOB)</div>
                            <div className="text-2xl md:text-3xl font-black text-indigo-400">
                                {stats.montoBOB.toLocaleString('es-BO', { minimumFractionDigits: 2 })} <span className="text-sm text-slate-400 font-normal">BOB</span>
                            </div>
                            <div className="mt-3 text-[11px] text-slate-400">
                                Incluye pendientes, aprobadas y pagadas.
                            </div>
                        </div>

                        <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800/80">
                            <div className="text-xs text-slate-400 font-semibold mb-1">Monto en Dólares (USD)</div>
                            <div className="text-2xl md:text-3xl font-black text-emerald-400">
                                ${stats.montoUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm text-slate-400 font-normal">USD</span>
                            </div>
                            <div className="mt-3 text-[11px] text-slate-400">
                                Pagos internacionales o en moneda extranjera.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Entity Counters */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                    <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-400" />
                        Registros del Sistema
                    </h3>

                    <div className="space-y-3.5">
                        <Link href={route('usuarios.index')} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/50 border border-slate-800 transition">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                                    <Users className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">Usuarios Activos</div>
                                    <div className="text-[11px] text-slate-400">Roles asignados</div>
                                </div>
                            </div>
                            <span className="text-lg font-extrabold text-white">{stats.totalUsuarios}</span>
                        </Link>

                        <Link href={route('proveedores.index')} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/50 border border-slate-800 transition">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                                    <Truck className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">Proveedores</div>
                                    <div className="text-[11px] text-slate-400">Con datos bancarios</div>
                                </div>
                            </div>
                            <span className="text-lg font-extrabold text-white">{stats.totalProveedores}</span>
                        </Link>

                        <Link href={route('empresas.index')} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/50 border border-slate-800 transition">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">Empresas</div>
                                    <div className="text-[11px] text-slate-400">Fralak, Dotmed, CID</div>
                                </div>
                            </div>
                            <span className="text-lg font-extrabold text-white">{stats.totalEmpresas}</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Solicitudes Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-400" />
                            Últimas Solicitudes Registradas
                        </h3>
                        <p className="text-xs text-slate-400">Inspección rápida de actividad reciente</p>
                    </div>

                    <Link
                        href={route('solicitudes.index')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 group"
                    >
                        <span>Ir a la Gestión Completa</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                            <tr>
                                <th className="px-4 py-3.5">ID</th>
                                <th className="px-4 py-3.5">Empresa</th>
                                <th className="px-4 py-3.5">Solicitante</th>
                                <th className="px-4 py-3.5">Proveedor</th>
                                <th className="px-4 py-3.5">Monto</th>
                                <th className="px-4 py-3.5">Estado</th>
                                <th className="px-4 py-3.5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {solicitudesRecientes.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-slate-500">
                                        No hay solicitudes registradas aún.
                                    </td>
                                </tr>
                            ) : (
                                solicitudesRecientes.map((sol) => (
                                    <tr key={sol.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-4 py-3.5 font-bold text-white">#{sol.id}</td>
                                        <td className="px-4 py-3.5">
                                            <span className="font-semibold text-slate-200">{sol.empresa?.nombre}</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-medium text-white">{sol.solicitante?.nombre_completo || 'Solicitante'}</div>
                                            <div className="text-[10px] text-slate-400">{sol.solicitante?.cargo}</div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-slate-300 font-medium">{sol.proveedor?.nombre_razon_social}</span>
                                        </td>
                                        <td className="px-4 py-3.5 font-bold text-white">
                                            {Number(sol.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })} {sol.moneda}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {getEstadoBadge(sol.estado)}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button
                                                onClick={() => setSelectedSolicitud(sol)}
                                                className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                                                title="Ver Detalle"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Detail Preview */}
            {selectedSolicitud && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                            <h3 className="text-lg font-bold text-white">
                                Detalle de Solicitud #{selectedSolicitud.id}
                            </h3>
                            <button
                                onClick={() => setSelectedSolicitud(null)}
                                className="text-slate-400 hover:text-white p-1"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                <div>
                                    <span className="text-slate-500 uppercase font-semibold">Empresa</span>
                                    <p className="font-bold text-white text-sm">{selectedSolicitud.empresa?.nombre}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 uppercase font-semibold">Estado Actual</span>
                                    <div className="mt-1">{getEstadoBadge(selectedSolicitud.estado)}</div>
                                </div>
                                <div>
                                    <span className="text-slate-500 uppercase font-semibold">Monto Solicitado</span>
                                    <p className="font-extrabold text-indigo-400 text-base">
                                        {Number(selectedSolicitud.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })} {selectedSolicitud.moneda}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-500 uppercase font-semibold">Documento / Pago</span>
                                    <p className="font-medium text-slate-200">{selectedSolicitud.tipo_documento} • {selectedSolicitud.modalidad_pago}</p>
                                </div>
                            </div>

                            <div>
                                <span className="text-slate-400 font-semibold uppercase">Motivo / Descripción:</span>
                                <p className="mt-1 bg-slate-950/50 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                                    {selectedSolicitud.motivo_descripcion}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <span className="text-slate-400 font-semibold">Solicitante:</span>
                                    <p className="text-white font-medium">{selectedSolicitud.solicitante?.nombre_completo}</p>
                                    <p className="text-slate-500">{selectedSolicitud.solicitante?.correo}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-semibold">Proveedor:</span>
                                    <p className="text-white font-medium">{selectedSolicitud.proveedor?.nombre_razon_social}</p>
                                    <p className="text-slate-500">{selectedSolicitud.proveedor?.banco} - {selectedSolicitud.proveedor?.numero_cuenta}</p>
                                </div>
                            </div>

                            {selectedSolicitud.comentarios_revision && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
                                    <strong className="block text-[11px] uppercase tracking-wider mb-1">Comentarios de Revisión:</strong>
                                    {selectedSolicitud.comentarios_revision}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
                            <Link
                                href={route('solicitudes.index')}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition"
                            >
                                Ir a Gestión para Aprobar/Modificar
                            </Link>
                            <button
                                onClick={() => setSelectedSolicitud(null)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition"
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
