import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, ShieldCheck, X } from 'lucide-react';

export default function JefeMultiSelect({
    jefes = [],
    empresaId,
    selectedIds = [],
    onChange,
    empresas = [],
    label = 'Jefe Aprobador',
    required = true,
    excludeUserId = null,
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

    // 2. Filtrar los jefes según la empresa seleccionada y excluir al usuario solicitante si aplica
    const filteredJefes = jefes.filter((j) => {
        if (excludeUserId && Number(j.id) === Number(excludeUserId)) return false;
        if (!empresaId) return true;
        if (!j.empresas || j.empresas.length === 0) return true;
        return j.empresas.some((e) => Number(e.id) === Number(empresaId));
    });

    // 3. Ordenar: Si Eduardo NO está excluido, poner a Eduardo (Auditor) primero. Si está excluido, poner a Gerentes primero.
    const sortedJefes = [...filteredJefes].sort((a, b) => {
        if (!excludeUserId) {
            const aIsEduardo = (a.nombre_completo || a.nombre || '').toLowerCase().includes('eduardo') ||
                               (a.cargo || '').toLowerCase().includes('auditor');
            const bIsEduardo = (b.nombre_completo || b.nombre || '').toLowerCase().includes('eduardo') ||
                               (b.cargo || '').toLowerCase().includes('auditor');
            if (aIsEduardo && !bIsEduardo) return -1;
            if (!aIsEduardo && bIsEduardo) return 1;
        } else {
            // Priorizar Gerentes (Alejandra, Raul, Leandro)
            const aIsGerente = (a.cargo || '').toLowerCase().includes('gerente');
            const bIsGerente = (b.cargo || '').toLowerCase().includes('gerente');
            if (aIsGerente && !bIsGerente) return -1;
            if (!aIsGerente && bIsGerente) return 1;
        }
        return 0;
    });

    // 4. Auto-selección por defecto
    useEffect(() => {
        if (empresaId && sortedJefes.length > 0 && onChange) {
            const validSelected = (selectedIds || []).filter((id) =>
                sortedJefes.some((j) => Number(j.id) === Number(id))
            );

            if (validSelected.length === 0) {
                if (!excludeUserId) {
                    const eduardo = sortedJefes.find((j) =>
                        (j.nombre_completo || j.nombre || '').toLowerCase().includes('eduardo') ||
                        (j.cargo || '').toLowerCase().includes('auditor')
                    );
                    if (eduardo) {
                        onChange([eduardo.id]);
                    } else {
                        onChange([sortedJefes[0].id]);
                    }
                } else {
                    onChange([sortedJefes[0].id]);
                }
            } else if (validSelected.length !== selectedIds.length) {
                onChange(validSelected);
            }
        }
    }, [empresaId, sortedJefes.map((j) => j.id).join(','), excludeUserId]);

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

    const getJefeEmail = (jefe) => {
        if (!jefe) return '';
        if (empresaId) {
            const empPivot = (jefe.empresas || []).find((e) => Number(e.id) === Number(empresaId));
            if (empPivot && empPivot.pivot && empPivot.pivot.correo_corporativo) {
                return empPivot.pivot.correo_corporativo;
            }
            const otraEmp = (jefe.empresas || []).find((e) => e.pivot && e.pivot.correo_corporativo);
            if (otraEmp && otraEmp.pivot && otraEmp.pivot.correo_corporativo) {
                return otraEmp.pivot.correo_corporativo;
            }
        }
        return jefe.correo || '';
    };

    const handleSetPrincipal = (jefeId, e) => {
        if (e) e.stopPropagation();
        const idNum = Number(jefeId);
        if (selectedIds.length <= 1) {
            onChange([idNum]);
        } else {
            const otherIds = selectedIds.filter((id) => id !== idNum);
            onChange([idNum, ...otherIds]);
        }
    };

    const handleToggle = (jefeId, e) => {
        if (e) e.stopPropagation();
        const idNum = Number(jefeId);
        let newSelection;
        if (selectedIds.includes(idNum)) {
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
        if (sortedJefes.length === 0) return 'Sin jefes/gerentes disponibles';
        if (selectedIds.length === 0) return 'Selecciona Aprobador...';

        const primaryJefe = sortedJefes.find((j) => Number(j.id) === Number(selectedIds[0]));
        if (!primaryJefe) return 'Selecciona Aprobador...';

        const name = primaryJefe.nombre_completo || primaryJefe.nombre || 'Aprobador';
        const role = primaryJefe.cargo || primaryJefe.rol?.nombre || 'Jefe';

        if (selectedIds.length > 1) {
            return `${name} (+${selectedIds.length - 1} ${selectedIds.length - 1 === 1 ? 'copia' : 'copias'})`;
        }
        return `${name} (${role})`;
    };

    // Lista de correos seleccionados
    const selectedJefesList = selectedIds
        .map((id) => sortedJefes.find((j) => Number(j.id) === Number(id)))
        .filter(Boolean);

    const primaryJefe = selectedJefesList[0];
    const primaryEmail = primaryJefe ? getJefeEmail(primaryJefe) : '';
    const copyJefes = selectedJefesList.slice(1);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
                {label} {required && <span className="text-cyan-400">*</span>}
            </label>

            {/* Botón Trigger que abre el Dropdown con icono y tema de empresa */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border transition-all text-left flex items-center justify-between gap-2 outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isOpen ? `${theme.buttonActiveBorder}` : 'border-slate-800 hover:border-slate-700'
                }`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${theme.iconColor}`} />
                    <span className={`text-xs font-semibold truncate ${
                        selectedIds.length > 0 ? theme.buttonText : 'text-slate-500'
                    }`}>
                        {getDisplayText()}
                    </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? `rotate-180 ${theme.chevronActive}` : ''}`} />
            </button>

            {/* Info de correos notificados debajo del campo */}
            {primaryEmail && (
                <div className="mt-1 space-y-0.5">
                    <p className={`text-[10px] font-mono truncate ${theme.emailDestino}`}>
                        Destino (Jefe): <strong>{primaryEmail}</strong>
                    </p>
                    {copyJefes.map((cj, idx) => {
                        const copyEmail = getJefeEmail(cj);
                        if (!copyEmail) return null;
                        return (
                            <p key={cj.id} className={`text-[10px] font-mono truncate pl-2 ${theme.emailCopia}`}>
                                ↳ Copia #{idx + 1}: <strong>{copyEmail}</strong> ({cj.nombre_completo?.split(' ')[0]})
                            </p>
                        );
                    })}
                </div>
            )}

            {/* Menú Desplegable Flotante */}
            {isOpen && (
                <div className={`absolute z-50 left-0 right-0 mt-1.5 p-2 bg-slate-900/98 backdrop-blur-xl border ${theme.popoverBorder} rounded-2xl shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-150 min-w-[280px]`}>
                    <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-800/80">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.popoverHeader} flex items-center gap-1.5`}>
                            <ShieldCheck className="w-3 h-3" />
                            Jefes Aprobadores / Copias
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
                        {sortedJefes.map((j) => {
                            const isChecked = selectedIds.includes(Number(j.id));
                            const email = getJefeEmail(j);
                            const isPrincipal = selectedIds[0] === Number(j.id);
                            const isEduardo = (j.nombre_completo || j.nombre || '').toLowerCase().includes('eduardo') ||
                                              (j.cargo || '').toLowerCase().includes('auditor');

                            return (
                                <div
                                    key={j.id}
                                    onClick={(e) => handleSetPrincipal(j.id, e)}
                                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition select-none ${
                                        isChecked
                                            ? `${theme.itemChecked}`
                                            : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                                    }`}
                                >
                                    <div className="min-w-0 pr-2">
                                        <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                                            <span className="truncate">{j.nombre_completo || `${j.nombre} ${j.apellidos || ''}`}</span>
                                            {isChecked && (
                                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                                                    isPrincipal
                                                        ? theme.principalBadge
                                                        : theme.copyBadge
                                                }`}>
                                                    {isPrincipal ? 'Principal' : 'Copia'}
                                                </span>
                                            )}
                                            {isEduardo && (
                                                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded font-semibold">
                                                    Auditoría
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                            <span className="text-slate-500">{j.cargo || j.rol?.nombre || 'Jefe Aprobador'}</span>
                                            {email && <span>• {email}</span>}
                                        </div>
                                    </div>

                                    {/* El "Bien" / Checkmark a la derecha con color temático para alternar en copia */}
                                    <div
                                        className="shrink-0 pl-1"
                                        onClick={(e) => handleToggle(j.id, e)}
                                        title={isChecked ? (isPrincipal ? "Aprobador Principal" : "Quitar de copia") : "Agregar en copia"}
                                    >
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

