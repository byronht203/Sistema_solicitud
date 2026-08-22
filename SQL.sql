-- 0. Crear la base de datos asegurando la compatibilidad con caracteres especiales (ñ, tildes)
CREATE DATABASE IF NOT EXISTS sistema_solicitud
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sistema_solicitud;

-- 1. Tabla de Empresas
CREATE TABLE empresas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    nit VARCHAR(50) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Roles
CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Usuarios (Modificada: Con datos personales, contacto y cargo)
CREATE TABLE usuarios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rol_id BIGINT UNSIGNED NOT NULL,
    
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    ci VARCHAR(50) NULL,
    cargo VARCHAR(100) NULL,
    direccion VARCHAR(255) NULL,
    telefono VARCHAR(50) NULL,
    
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Proveedores
CREATE TABLE proveedores (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    creado_por_usuario_id BIGINT UNSIGNED NOT NULL,
    nombre_razon_social VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255) NULL,
    nit_ci VARCHAR(50) NULL,
    banco VARCHAR(100) NULL,
    tipo_cuenta ENUM('Caja de Ahorro', 'Cuenta Corriente', 'Otro') NULL DEFAULT 'Caja de Ahorro',
    numero_cuenta VARCHAR(100) NULL,
    nombre_titular_cuenta VARCHAR(150) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (creado_por_usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla de Solicitudes
CREATE TABLE solicitudes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id BIGINT UNSIGNED NOT NULL,
    solicitante_id BIGINT UNSIGNED NOT NULL,
    tipo_solicitud VARCHAR(50) DEFAULT 'Pago a Proveedor',
    jefe_id BIGINT UNSIGNED NULL,
    contabilidad_id BIGINT UNSIGNED NULL,
    proveedor_id BIGINT UNSIGNED NOT NULL,
    
    motivo_descripcion TEXT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    moneda ENUM('BOB', 'USD') DEFAULT 'BOB',
    
    tipo_documento ENUM('Factura', 'Recibo', 'Contrato', 'Otro') NOT NULL,
    emite_factura BOOLEAN DEFAULT FALSE,
    modalidad_pago ENUM('Transferencia', 'Cheque', 'Efectivo', 'QR') NOT NULL,
    archivo_respaldo_path VARCHAR(255) NULL,
    
    estado ENUM('Pendiente', 'Observado', 'Aprobado_Jefatura', 'Pagado', 'Rechazado') DEFAULT 'Pendiente',
    comentarios_revision TEXT NULL,
    
    revisado_por_jefe_id BIGINT UNSIGNED NULL,
    procesado_por_conta_id BIGINT UNSIGNED NULL,
    fecha_solicitud DATE NOT NULL,
    
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT,
    FOREIGN KEY (solicitante_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE RESTRICT,
    FOREIGN KEY (revisado_por_jefe_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (procesado_por_conta_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Registros Iniciales (Seeders)
-- Se registran automáticamente las 3 empresas base del sistema
INSERT INTO empresas (nombre) VALUES 
('Fralak SRL'),
('Dotmed SRL'),
('CID SRL');

-- Roles base del sistema
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso total al sistema y gestión completa'),
('Jefe', 'Revisión y aprobación de solicitudes de su área'),
('Contabilidad', 'Procesamiento de pagos y desembolsos generales'),
('Solicitante', 'Creación y seguimiento de solicitudes de pago'),
('Caja Chica', 'Gestión y desembolso exclusivo de solicitudes de Caja Chica (Hasta 300 BOB)');