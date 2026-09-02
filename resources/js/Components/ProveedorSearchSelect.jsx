import { useState, useRef, useEffect } from 'react';
import { Search, Truck, Check, Plus, X, Building, CreditCard, ChevronDown } from 'lucide-react';

export default function ProveedorSearchSelect({
    proveedores = [],
    selectedId = '',
    onChange,
    onOpenQuickCreate,
    label = 'Proveedor / Beneficiario',
    required = true,
    placeholder = 'Buscar o seleccionar proveedor...',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    const inputSearchRef = useRef(null);

    // Obtener proveedor actualmente seleccionado
    const selectedProveedor = proveedores.find((p) => Number(p.id) === Number(selectedId));

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Enfocar el input de búsqueda automáticamente al abrir el dropdown
    useEffect(() => {
        if (isOpen && inputSearchRef.current) {
            inputSearchRef.current.focus();
        }
    }, [isOpen]);

    // Filtrar proveedores en tiempo real según el término de búsqueda
    const filteredProveedores = proveedores.filter((p) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        const nombre = (p.nombre_razon_social || '').toLowerCase();
        const desc = (p.descripcion || '').toLowerCase();
        const nit = (p.nit_ci || '').toLowerCase();
        const banco = (p.banco || '').toLowerCase();
        const nroCuenta = (p.numero_cuenta || '').toLowerCase();
        const titular = (p.nombre_titular_cuenta || '').toLowerCase();

        return (
            nombre.includes(term) ||
            desc.includes(term) ||
            nit.includes(term) ||
            banco.includes(term) ||
            nroCuenta.includes(term) ||
            titular.includes(term)
        );
    });

    const handleSelect = (prov) => {
        onChange(prov.id);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Header del Label */}
            <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                    {label} {required && <span className="text-cyan-400">*</span>}
                </label>
                {onOpenQuickCreate && (
                    <button
                        type="button"
                        onClick={() => onOpenQuickCreate('')}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold hover:underline flex items-center gap-0.5"
                    >
                        <Plus className="w-3 h-3" />
                        <span>Nuevo</span>
                    </button>
                )}
            </div>

            {/* Botón Principal (Input Trigger) */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border transition-all text-left flex items-center justify-between gap-2 outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isOpen ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-800 hover:border-slate-700'
                }`}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Truck className="w-4 h-4 text-slate-400 shrink-0" />
                    {selectedProveedor ? (
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">
                                {selectedProveedor.nombre_razon_social}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                                {selectedProveedor.numero_cuenta ? (
                                    <span>
                                        {selectedProveedor.banco} • {selectedProveedor.numero_cuenta}
                                    </span>
                                ) : (
                                    <span className="text-amber-300/80">💵 Pago Efectivo / Sin Cuenta</span>
                                )}
                                {selectedProveedor.nit_ci ? ` • NIT: ${selectedProveedor.nit_ci}` : ''}
                            </div>
                        </div>
                    ) : (
                        <span className="text-xs text-slate-500 truncate">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {selectedProveedor && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={handleClear}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                            title="Desmarcar proveedor"
                        >
                            <X className="w-3.5 h-3.5" />
                        </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                </div>
            </button>

            {/* Menú Desplegable con Input de Búsqueda y lista limitada a 3-4 ítems visibles */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
                    {/* Campo de búsqueda interactiva */}
                    <div className="p-2 border-b border-slate-800 bg-slate-950/80 flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <input
                            ref={inputSearchRef}
                            type="text"
                            placeholder="Escribe para buscar proveedor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none border-none p-0 focus:ring-0"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="text-slate-500 hover:text-white p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Lista limitada a 3-4 ítems a la vez (max-h-44 scrollable) */}
                    <div className="max-h-44 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
                        {filteredProveedores.length > 0 ? (
                            filteredProveedores.map((prov) => {
                                const isSelected = Number(prov.id) === Number(selectedId);
                                return (
                                    <button
                                        key={prov.id}
                                        type="button"
                                        onClick={() => handleSelect(prov)}
                                        className={`w-full px-3 py-2 text-left transition flex items-center justify-between gap-2 text-xs ${
                                            isSelected
                                                ? 'bg-cyan-500/15 text-cyan-200 font-bold'
                                                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <span className="font-semibold truncate">{prov.nombre_razon_social}</span>
                                                {prov.descripcion && (
                                                    <span className="text-[10px] text-slate-400 font-normal truncate">
                                                        ({prov.descripcion})
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate flex items-center gap-1">
                                                {prov.banco && prov.numero_cuenta ? (
                                                    <span>
                                                        {prov.banco}: {prov.numero_cuenta}
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-400/80">Efectivo</span>
                                                )}
                                                {prov.nit_ci && <span>• NIT: {prov.nit_ci}</span>}
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 stroke-[3]" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-4 text-center">
                                <p className="text-xs text-slate-400">
                                    No se encontró ningún proveedor con <strong>"{searchTerm}"</strong>
                                </p>
                                {onOpenQuickCreate && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsOpen(false);
                                            onOpenQuickCreate(searchTerm);
                                        }}
                                        className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Registrar "{searchTerm}" como nuevo</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer con opción rápida de agregar */}
                    {onOpenQuickCreate && filteredProveedores.length > 0 && (
                        <div className="p-1.5 bg-slate-950/80 border-t border-slate-800 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    onOpenQuickCreate(searchTerm);
                                }}
                                className="w-full py-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition flex items-center justify-center gap-1"
                            >
                                <Plus className="w-3 h-3" />
                                <span>+ Registrar otro proveedor</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
