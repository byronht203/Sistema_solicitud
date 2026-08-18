import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileSpreadsheet,
    Truck,
    Building2,
    LogOut,
    Menu,
    X,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    PlusCircle,
    FilePlus,
    UserCheck,
    Send,
    Activity,
    Users,
    ShieldCheck,
    Wallet
} from 'lucide-react';

export default function SolicitanteLayout({ children, title, badgeObservadas = 0 }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user || {};
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dismissFlash, setDismissFlash] = useState(false);

    const rolNombre = user.rol?.nombre?.toLowerCase() || '';
    const isAdmin = rolNombre === 'administrador' || rolNombre === 'admin';

    const solNavigation = [
        { name: 'Mi Dashboard', href: route('solicitante.dashboard'), routeName: 'solicitante.dashboard', icon: LayoutDashboard },
        { 
            name: 'Mis Solicitudes de Pago', 
            href: route('solicitante.solicitudes'), 
            routeName: 'solicitante.solicitudes', 
            icon: FileSpreadsheet,
            badge: badgeObservadas > 0 ? badgeObservadas : null
        },
        { name: 'Directorio de Proveedores', href: route('solicitante.proveedores'), routeName: 'solicitante.proveedores', icon: Truck },
        { name: 'Empresas Corporativas', href: route('empresas.index'), routeName: 'empresas.index', icon: Building2 },
    ];

    const adminNavigation = [
        { name: 'Dashboard Admin', href: route('dashboard'), routeName: 'dashboard', icon: LayoutDashboard },
        { 
            name: 'Mis Solicitudes (Empleado)', 
            href: route('solicitante.solicitudes'), 
            routeName: 'solicitante.solicitudes', 
            icon: FileSpreadsheet,
            badge: badgeObservadas > 0 ? badgeObservadas : null
        },
        { name: 'Dashboard Solicitante', href: route('solicitante.dashboard'), routeName: 'solicitante.dashboard', icon: UserCheck },
        { name: 'Módulo Jefatura', href: route('jefatura.solicitudes'), routeName: 'jefatura.*', icon: ShieldCheck },
        { name: 'Módulo Contabilidad', href: route('contabilidad.solicitudes'), routeName: 'contabilidad.*', icon: Wallet },
        { name: 'Todas las Solicitudes', href: route('solicitudes.index'), routeName: 'solicitudes.index', icon: FileSpreadsheet },
        { name: 'Gestión de Usuarios', href: route('usuarios.index'), routeName: 'usuarios.index', icon: Users },
        { name: 'Proveedores & Cuentas', href: route('proveedores.index'), routeName: 'proveedores.index', icon: Truck },
        { name: 'Empresas Corporativas', href: route('empresas.index'), routeName: 'empresas.index', icon: Building2 },
    ];

    const navigation = isAdmin ? adminNavigation : solNavigation;

    const isCurrentRoute = (routeName) => {
        return route().current(routeName);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            <Head title={title || 'Portal de Solicitudes'} />

            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand Header with Company Logos */}
                <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-900/90">
                    <Link href={route('solicitante.dashboard')} className="flex items-center gap-3 group">
                        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl shadow-md border border-slate-200 shrink-0">
                            <img src="/images/Logo_Fralak.PNG" alt="Fralak" className="h-5 w-auto object-contain rounded" />
                            <img src="/images/Logo_Dotmed.png" alt="Dotmed" className="h-5 w-auto object-contain rounded" />
                            <img src="/images/Logo_CID.PNG" alt="CID" className="h-5 w-auto object-contain rounded" />
                        </div>
                        <div>
                            <span className="font-extrabold text-xs tracking-tight text-white block leading-tight">
                                RED MÉDICA
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-extrabold flex items-center gap-1">
                                <Activity className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                                Equipos & Insumos
                            </span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User Profile Summary Card */}
                <div className="p-4 border-b border-slate-800/60 bg-slate-950/40">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-lg shrink-0">
                            {user.nombre ? user.nombre.charAt(0) : 'S'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">
                                {user.nombre_completo || user.nombre || 'Solicitante'}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {user.cargo || 'Ejecutivo de Compras'}
                            </p>
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                <UserCheck className="w-3 h-3" />
                                {user.rol?.nombre || 'Solicitante'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
                    <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Menú de Trabajo
                    </div>
                    {navigation.map((item) => {
                        const active = isCurrentRoute(item.routeName);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                                    active
                                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20 font-semibold'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} />
                                    <span>{item.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {item.badge && (
                                        <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full animate-pulse">
                                            {item.badge}
                                        </span>
                                    )}
                                    {active && <ChevronRight className="w-4 h-4 text-white/70" />}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Logout */}
                <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-rose-600/20 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-sm font-semibold transition-all duration-200"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
                {/* Top Navbar Header */}
                <header className="h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-white tracking-tight">{title || 'Portal de Solicitudes'}</h1>
                                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md">
                                    Área Solicitante
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 hidden sm:block">
                                Creación de solicitudes de pago y seguimiento de aprobaciones
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Company Logos Header Badge */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                            <span className="text-[11px] text-slate-400 font-semibold mr-1">Empresas:</span>
                            <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg shadow-sm">
                                <img src="/images/Logo_Fralak.PNG" alt="Fralak" className="h-5 w-auto object-contain rounded" title="Fralak SRL" />
                                <img src="/images/Logo_Dotmed.png" alt="Dotmed" className="h-5 w-auto object-contain rounded" title="Dotmed SRL" />
                                <img src="/images/Logo_CID.PNG" alt="CID" className="h-5 w-auto object-contain rounded" title="CID SRL" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">
                                {user.nombre ? user.nombre.charAt(0) : 'S'}
                            </div>
                            <div className="hidden md:block text-left">
                                <span className="text-xs font-semibold text-slate-200 block leading-tight">
                                    {user.nombre || 'Solicitante'}
                                </span>
                                <span className="text-[10px] text-cyan-400 font-semibold">
                                    Usuario Empleado
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Flash Messages Toast Banner */}
                {!dismissFlash && flash?.success && (
                    <div className="mx-6 mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between shadow-lg shadow-emerald-500/5">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                        <button
                            onClick={() => setDismissFlash(true)}
                            className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {!dismissFlash && flash?.error && (
                    <div className="mx-6 mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between shadow-lg shadow-rose-500/5">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                            <span>{flash.error}</span>
                        </div>
                        <button
                            onClick={() => setDismissFlash(true)}
                            className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Page View Body */}
                <main className="flex-1 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
