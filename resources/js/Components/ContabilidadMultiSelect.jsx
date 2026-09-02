import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Calculator, X } from 'lucide-react';

export default function ContabilidadMultiSelect({
    contabilidades = [],
    empresaId,
    tipoSol = 'Pago a Proveedor',
    monto = 0,
    moneda = 'BOB',
    selectedIds = [],
    onChange,
    empresas = [],
    label = 'Encargado Contabilidad',
    required = true,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // 1. Determinar el tema de color distintivo de la empresa seleccionada
    const selectedEmp = empresas.find((e) => Number(e.id) === Number(empresaId));
    const empNombre = (selectedEmp?.nombre || '').toLowerCase();
    const isFralak = empNombre.includes('fralak');
    const isDotmed = empNombre.includes('dotmed');
    const isCid = empNombre.includes('cid');

    // Paletas de color distintivas por empresa:
    // Fralak: Rojo Vino (Rose/Wine)
    // Dotmed: Verde Azulado (Teal)
    // CID: Azul Petróleo (Sky / Deep Blue)
    const theme = isFralak
        ? {
            key: 'fralak',
            buttonText: 'text-rose-300',
            buttonActiveBorder: 'border-rose-500 ring-2 ring-rose-500/30',
            iconColor: 'text-rose-400',
            chevronActive: 'text-rose-400',
            badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
            popoverBorder: 'border-rose-500/40 shadow-rose-950/60',
            popoverHeader: 'text-rose-400',
            itemChecked: 'bg-rose-500/15 hover:bg-rose-500/20 text-rose-100 border-rose-500/40',
            principalBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
            copyBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            checkBoxChecked: 'bg-rose-600 border-rose-400 text-white shadow-sm shadow-rose-600/40',
            emailDestino: 'text-rose-400',
            emailCopia: 'text-rose-300/80',
            btnListo: 'text-rose-400 hover:text-rose-300',
            tagLabel: 'Fralak (Rojo Vino)',
        }
        : isDotmed
        ? {
            key: 'dotmed',
            buttonText: 'text-teal-300',
            buttonActiveBorder: 'border-teal-500 ring-2 ring-teal-500/30',
            iconColor: 'text-teal-400',
            chevronActive: 'text-teal-400',
            badgeBg: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
            popoverBorder: 'border-teal-500/40 shadow-teal-950/60',
            popoverHeader: 'text-teal-400',
            itemChecked: 'bg-teal-500/15 hover:bg-teal-500/20 text-teal-100 border-teal-500/40',
            principalBadge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
            copyBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            checkBoxChecked: 'bg-teal-500 border-teal-400 text-slate-950 shadow-sm shadow-teal-500/40',
            emailDestino: 'text-teal-400',
            emailCopia: 'text-teal-300/80',
            btnListo: 'text-teal-400 hover:text-teal-300',
            tagLabel: 'Dotmed (Verde Azulado)',
        }
        : {
            key: 'cid',
            buttonText: 'text-sky-300',
            buttonActiveBorder: 'border-sky-500 ring-2 ring-sky-500/30',
            iconColor: 'text-sky-400',
            chevronActive: 'text-sky-400',
            badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
            popoverBorder: 'border-sky-500/40 shadow-sky-950/60',
            popoverHeader: 'text-sky-400',
            itemChecked: 'bg-sky-500/15 hover:bg-sky-500/20 text-sky-100 border-sky-500/40',
            principalBadge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
            copyBadge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
            checkBoxChecked: 'bg-sky-500 border-sky-400 text-slate-950 shadow-sm shadow-sky-500/40',
            emailDestino: 'text-sky-400',
            emailCopia: 'text-sky-300/80',
            btnListo: 'text-sky-400 hover:text-sky-300',
            tagLabel: 'CID (Azul Petróleo)',
        };

    const isCajaChica = tipoSol === 'Caja Chica' || (moneda === 'BOB' && Number(monto) > 0 && Number(monto) <= 300);

    // 2. Filtrar los usuarios de contabilidad según empresa y monto (Caja Chica ≤ 300 BOB vs regular)
    const filteredContas = contabilidades.filter((c) => {
        const belongsToCompany = (c.empresas || []).some((e) => Number(e.id) === Number(empresaId));
        if (!belongsToCompany) return false;

        const rol = (c.rol?.nombre || '').toLowerCase().trim();
        const isUserMixto = rol.includes('contabilidad - caja chica') || rol.includes('contabilidad-caja chica') || (rol.includes('conta') && rol.includes('caja'));
        const isUserCajaChica = (rol.includes('caja chica') || rol.includes('cajachica')) && !isUserMixto;
        const isUserContabilidad = (rol.includes('contabilidad') || rol.includes('conta')) && !isUserMixto;

        if (isCajaChica) {
            // Solicitud de Caja Chica (<= 300 BOB): Mostrar encargados de Caja Chica y personal Mixto
            return isUserCajaChica || isUserMixto;
        } else {
            // Solicitud Regular (> 300 BOB o USD): Mostrar Contabilidad y personal Mixto
            return isUserContabilidad || isUserMixto;
        }
    });

    // Auto-ajustar la selección cuando cambian empresaId, tipoSol, monto o moneda
    useEffect(() => {
        if (empresaId && filteredContas.length > 0 && onChange) {
            const validSelected = (selectedIds || []).filter((id) =>
                filteredContas.some((c) => Number(c.id) === Number(id))
            );
            if (validSelected.length === 0) {
                onChange([filteredContas[0].id]);
            } else if (validSelected.length !== selectedIds.length) {
                onChange(validSelected);
            }
        }
    }, [empresaId, tipoSol, monto, moneda, filteredContas.map((c) => c.id).join(',')]);

    // Cerrar al hacer clic afuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getContaEmail = (conta) => {
        if (!conta) return '';
        if (empresaId) {
            const empPivot = (conta.empresas || []).find((e) => Number(e.id) === Number(empresaId));
            if (empPivot && empPivot.pivot && empPivot.pivot.correo_corporativo) {
                return empPivot.pivot.correo_corporativo;
            }
            const otraEmp = (conta.empresas || []).find((e) => e.pivot && e.pivot.correo_corporativo);
            if (otraEmp && otraEmp.pivot && otraEmp.pivot.correo_corporativo) {
                return otraEmp.pivot.correo_corporativo;
            }
        }
        return conta.correo || '';
    };

    const handleToggle = (contaId, e) => {
        if (e) e.stopPropagation();
        const idNum = Number(contaId);
        let newSelection;
        if (selectedIds.includes(idNum)) {
            // No permitir desmarcar todos si solo hay uno seleccionado y es required
            if (selectedIds.length === 1 && required) {
                return;
            }
            newSelection = selectedIds.filter((id) => id !== idNum);
        } else {
            newSelection = [...selectedIds, idNum];
        }
        onChange(newSelection);
    };

    // Obtener texto para el botón cerrado
    const getDisplayText = () => {
        if (!empresaId) return 'Selecciona Empresa primero...';
        if (filteredContas.length === 0) return 'Sin personal disponible';
        if (selectedIds.length === 0) return 'Selecciona Contabilidad...';

        const firstConta = contabilidades.find((c) => Number(c.id) === Number(selectedIds[0]));
        const firstName = firstConta ? (firstConta.nombre_completo || firstConta.nombre) : 'Contabilidad';

        if (selectedIds.length === 1) {
            const isCajaChicaRole = (firstConta?.rol?.nombre || '').toLowerCase().includes('caja chica');
            return `${firstName} ${isCajaChicaRole ? '(Caja Chica)' : ''}`;
        }
        return `${firstName} (+${selectedIds.length - 1} ${selectedIds.length - 1 === 1 ? 'copia' : 'copias'})`;
    };

    const notifiedEmails = (selectedIds || [])
        .map((id) => {
            const c = contabilidades.find((u) => Number(u.id) === Number(id));
            return c ? getContaEmail(c) : null;
        })
        .filter(Boolean);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
                {label} {required && <span className="text-cyan-400">*</span>}
            </label>

            {/* Botón con apariencia de Select, icono de Calculadora y color temático de la empresa */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={!empresaId || filteredContas.length === 0}
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border transition-all text-xs flex items-center justify-between text-left font-semibold outline-none focus:ring-2 focus:ring-cyan-500 ${
                    !empresaId || filteredContas.length === 0
                        ? 'opacity-60 cursor-not-allowed text-slate-500 border-slate-800'
                        : isOpen
                        ? `${theme.buttonActiveBorder}`
                        : 'border-slate-800 hover:border-slate-700 cursor-pointer'
                }`}
            >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                    <Calculator className={`w-3.5 h-3.5 shrink-0 ${theme.iconColor}`} />
                    <span className={`truncate ${selectedIds.length > 0 ? theme.buttonText : 'text-slate-500'}`}>
                        {getDisplayText()}
                    </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? `rotate-180 ${theme.chevronActive}` : ''}`} />
            </button>

            {/* Destino de correos abajo del select */}
            {notifiedEmails.length > 0 && (
                <div className="text-[10px] mt-1 font-mono leading-tight space-y-0.5 truncate">
                    <p className={`truncate ${theme.emailDestino}`}>
                        Destino (Conta): <strong>{notifiedEmails[0]}</strong>
                    </p>
                    {notifiedEmails.slice(1).map((email, idx) => (
                        <p key={idx} className={`truncate pl-2 ${theme.emailCopia}`}>
                            ↳ Copia #{idx + 1}: <strong>{email}</strong>
                        </p>
                    ))}
                </div>
            )}

            {/* Menú Desplegable Flotante con tema de color */}
            {isOpen && empresaId && filteredContas.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-1.5 z-50 bg-slate-900/98 backdrop-blur-xl border ${theme.popoverBorder} rounded-2xl shadow-2xl p-2 min-w-[280px] animate-in fade-in zoom-in-95 duration-150`}>
                    <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-800/80">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.popoverHeader} flex items-center gap-1.5`}>
                            <Calculator className="w-3 h-3" />
                            Contabilidad / Copias
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white p-0.5 rounded-md hover:bg-slate-800 transition"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5">
                        {filteredContas.map((c) => {
                            const isChecked = selectedIds.includes(Number(c.id));
                            const email = getContaEmail(c);
                            const isCajaChicaRole = (c.rol?.nombre || '').toLowerCase().includes('caja chica');
                            const isPrincipal = selectedIds[0] === Number(c.id);

                            return (
                                <div
                                    key={c.id}
                                    onClick={(e) => handleToggle(c.id, e)}
                                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition select-none ${
                                        isChecked
                                            ? `${theme.itemChecked}`
                                            : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                                    }`}
                                >
                                    <div className="min-w-0 pr-2">
                                        <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                                            <span className="truncate">{c.nombre_completo || `${c.nombre} ${c.apellidos || ''}`}</span>
                                            {isChecked && (
                                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                                                    isPrincipal
                                                        ? theme.principalBadge
                                                        : theme.copyBadge
                                                }`}>
                                                    {isPrincipal ? 'Principal' : 'Copia'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                            <span className="text-slate-500">{isCajaChicaRole ? '🪙 Caja Chica' : (c.cargo || c.rol?.nombre || 'Contabilidad')}</span>
                                            {email && <span>• {email}</span>}
                                        </div>
                                    </div>

                                    {/* El "Bien" / Checkmark a la derecha con color temático */}
                                    <div className="shrink-0 pl-1">
                                        <div
                                            className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                                                isChecked
                                                    ? theme.checkBoxChecked
                                                    : 'border-slate-700 bg-slate-950 text-transparent hover:border-slate-500'
                                            }`}
                                        >
                                            <Check className={`w-3.5 h-3.5 stroke-[3] ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 px-2 py-1 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">
                            {selectedIds.length} {selectedIds.length === 1 ? 'seleccionado' : 'seleccionados'}
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className={`font-bold hover:underline ${theme.btnListo}`}
                        >
                            Listo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

