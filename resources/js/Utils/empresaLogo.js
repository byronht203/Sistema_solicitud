export const getEmpresaLogo = (nombreEmpresa, sinFondo = false) => {
    const nombre = (nombreEmpresa || '').toLowerCase();
    if (nombre.includes('fralak')) {
        return sinFondo ? '/images/Logo_Fralak_SF.png' : '/images/Logo_Fralak.PNG';
    }
    if (nombre.includes('dotmed') || nombre.includes('dormed')) {
        return sinFondo ? '/images/Logo_Dormed_SF.png' : '/images/Logo_Dotmed.png';
    }
    if (nombre.includes('cid')) {
        return sinFondo ? '/images/Logo_CID_SF.PNG' : '/images/Logo_CID.PNG';
    }
    return null;
};
