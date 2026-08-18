import { useState } from 'react';
import JefaturaLayout from '@/Layouts/JefaturaLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import {
    Truck,
    Search,
    Plus,
    Edit,
    Landmark,
    Copy,
    Check,
    X,
    Building2,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';

export default function Index({ proveedores, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [copiedField, setCopiedField] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('jefatura.proveedores'), { search }, { preserveState: true, replace: true });
    };

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <JefaturaLayout title="Consulta de Proveedores y Cuentas Bancarias">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Truck className="w-6 h-6 text-indigo-400" />
                        <span>Catálogo de Proveedores Registrados</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Consulta los proveedores homologados y sus cuentas bancarias activas para autorizar compras y pagos.
                    </p>
                </div>
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
                                    NIT/CI: {prov.nit_ci}
                                </span>
                                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Habilitado
                                </span>
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
                                            onClick={() => handleCopy(prov.numero_cuenta, `jefe_prov_${prov.id}`)}
                                            className="p-1 text-slate-400 hover:text-indigo-400 transition"
                                            title="Copiar N° de Cuenta"
                                        >
                                            {copiedField === `jefe_prov_${prov.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
                            <ShieldCheck className="w-4 h-4 text-indigo-400" />
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
                                        ? 'bg-indigo-600 text-white font-bold'
                                        : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                                } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </JefaturaLayout>
    );
}
