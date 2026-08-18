import { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, Mail, ShieldCheck, ArrowRight, Activity, Stethoscope, Building } from 'lucide-react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        correo: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
            {/* Background Decorative Glows */}
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <Head title="Iniciar Sesión - Plataforma Médica Corporativa" />

            {/* 1. ENCABEZADO SUPERIOR: BANNER CORPORATIVO */}
            <header className="w-full bg-slate-900 border-b border-slate-800/80 shadow-2xl overflow-hidden relative">
                <img
                    src="/images/Banner.png"
                    alt="Banner Corporativo Sistema de Solicitudes"
                    className="w-full h-auto block mx-auto object-cover max-h-48 sm:max-h-64"
                />
            </header>

            {/* 2. SECCIÓN CENTRAL: FORMULARIO DE LOGIN CON ESTILO PLATAFORMA MÉDICA */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-6 relative z-10">
                <div className="w-full max-w-md">
                    {/* Medical Badge Header above Card */}
                    <div className="mb-4 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-lg">
                            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                            <span>Red Médica Corporativa • Equipamiento & Insumos Hospitalarios</span>
                        </div>
                    </div>

                    {/* Logos Showcase Card */}
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 mb-4 flex items-center justify-around shadow-xl">
                        <div className="p-1.5 bg-white rounded-xl shadow border border-slate-200 hover:scale-105 transition">
                            <img src="/images/Logo_Fralak.PNG" alt="Fralak SRL" className="h-7 w-auto object-contain" title="Fralak SRL" />
                        </div>
                        <div className="p-1.5 bg-white rounded-xl shadow border border-slate-200 hover:scale-105 transition">
                            <img src="/images/Logo_Dotmed.png" alt="Dotmed SRL" className="h-7 w-auto object-contain" title="Dotmed SRL" />
                        </div>
                        <div className="p-1.5 bg-white rounded-xl shadow border border-slate-200 hover:scale-105 transition">
                            <img src="/images/Logo_CID.PNG" alt="CID SRL" className="h-7 w-auto object-contain" title="CID SRL" />
                        </div>
                    </div>

                    {/* Main Login Card */}
                    <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90 relative">
                        <div className="mb-6 flex items-center justify-between border-b border-slate-800/80 pb-4">
                            <div>
                                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                                    Acceso a la Plataforma
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">Gestión de Fondos & Compras Hospitalarias</p>
                            </div>
                            <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">
                                ACCESO SEGURO
                            </span>
                        </div>

                        {status && (
                            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 shrink-0" />
                                <span>{status}</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            {/* Correo Field */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                    Correo Electrónico Corporativo
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                        <Mail className="w-4.5 h-4.5" />
                                    </div>
                                    <input
                                        id="correo"
                                        type="email"
                                        name="correo"
                                        value={data.correo}
                                        onChange={(e) => setData('correo', e.target.value)}
                                        placeholder="usuario@empresa.com.bo"
                                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-medium"
                                        required
                                        autoFocus
                                    />
                                </div>
                                {errors.correo && (
                                    <p className="mt-1.5 text-xs text-rose-400 font-semibold">{errors.correo}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                    Contraseña de Acceso
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                        <KeyRound className="w-4.5 h-4.5" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-medium"
                                        required
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-rose-400 font-semibold">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center text-slate-400 cursor-pointer hover:text-slate-200 transition">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                                    />
                                    <span className="ml-2 text-xs font-medium">Mantener sesión iniciada</span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-cyan-600/25 flex items-center justify-center gap-2 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-2"
                            >
                                <span>Ingresar a la Plataforma Médica</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* 3. PARTE INFERIOR: LOGOS OFICIALES Y PIE MÉDICO */}
            <footer className="w-full py-6 bg-slate-900/95 border-t border-slate-800/80 mt-auto z-10">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-6">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <p className="text-xs text-slate-400 font-medium">
                            Red Médica Corporativa © {new Date().getFullYear()} • Fralak SRL • Dotmed SRL • CID SRL — Equipamiento & Tecnología para Hospitales
                        </p>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="p-1.5 bg-white rounded-xl shadow-md hover:scale-105 transition border border-slate-200">
                            <img
                                src="/images/Logo_Fralak.PNG"
                                alt="Fralak SRL"
                                className="h-8 sm:h-9 w-auto object-contain rounded-lg"
                                title="Fralak SRL"
                            />
                        </div>
                        <div className="p-1.5 bg-white rounded-xl shadow-md hover:scale-105 transition border border-slate-200">
                            <img
                                src="/images/Logo_Dotmed.png"
                                alt="Dotmed SRL"
                                className="h-8 sm:h-9 w-auto object-contain rounded-lg"
                                title="Dotmed SRL"
                            />
                        </div>
                        <div className="p-1.5 bg-white rounded-xl shadow-md hover:scale-105 transition border border-slate-200">
                            <img
                                src="/images/Logo_CID.PNG"
                                alt="CID SRL"
                                className="h-8 sm:h-9 w-auto object-contain rounded-lg"
                                title="CID SRL"
                            />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
