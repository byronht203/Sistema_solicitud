# 📋 Reporte Maestro y Estado del Proyecto: Sistema de Solicitudes (Fralak / Dotmed / CID)

> **Fecha de Actualización:** 31 de Agosto de 2026  
> **Dominio de Producción:** [https://pagos.fralak.com.bo](https://pagos.fralak.com.bo)  
> **Propósito:** Documento de transferencia técnica de contexto integral para conexión remota, arquitectura, estado actual y tareas pendientes.

---

## 🔑 1. Acceso al Servidor de Producción (SSH / cPanel)

### 📌 Datos de Conexión
- **Host / IP Servidor:** `148.72.2.40`
- **Puerto SSH:** `22`
- **Usuario SSH / cPanel:** `kevinhemard`
- **Contraseña Usuario / Base de Datos:** `Fralak1155$`
- **Archivos de Llaves SSH en el proyecto:**
  - `admin_sol` (Llave privada original generada en cPanel).
  - `admin_sol_key` (Llave privada lista sin passphrase para conexiones no interactivas).

### 📂 Rutas Clave en el Servidor
- **Directorio Público Web:** `/home/kevinhemard/public_html/pagos.fralak.com.bo/`
- **Directorio de la Aplicación Laravel:** `/home/kevinhemard/public_html/pagos.fralak.com.bo/sistema_solicitud/`
- **Directorio de Assets Compilados (Build):** `/home/kevinhemard/public_html/pagos.fralak.com.bo/build/`
- **Buzones de Correo cPanel:** `/home/kevinhemard/mail/`

### 💻 Comandos Rápidos de Trabajo Remoto (PowerShell / Terminal)
```powershell
# 1. Conexión SSH interactiva
ssh -i admin_sol_key -p 22 kevinhemard@148.72.2.40

# 2. Limpieza de caché de Laravel en el servidor
ssh -i admin_sol_key -p 22 kevinhemard@148.72.2.40 "bash -l -c 'cd /home/kevinhemard/public_html/pagos.fralak.com.bo/sistema_solicitud && php artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan view:clear'"

# 3. Subir archivo individual actualizado (ejemplo: controlador)
scp -i admin_sol_key -P 22 app/Http/Controllers/JefaturaController.php kevinhemard@148.72.2.40:/home/kevinhemard/public_html/pagos.fralak.com.bo/sistema_solicitud/app/Http/Controllers/

# 4. Subir carpeta compilada de Vite/React
scp -i admin_sol_key -P 22 -r public/build/* kevinhemard@148.72.2.40:/home/kevinhemard/public_html/pagos.fralak.com.bo/build/

# 5. Ajustar permisos web tras subir archivos en el servidor (Importante para evitar 403 Forbidden)
ssh -i admin_sol_key -p 22 kevinhemard@148.72.2.40 "chmod -R 755 /home/kevinhemard/public_html/pagos.fralak.com.bo/build && find /home/kevinhemard/public_html/pagos.fralak.com.bo/build -type f -exec chmod 644 {} \;"
```

---

## 🏗️ 2. Arquitectura y Stack del Proyecto

- **Backend:** Laravel 10 / PHP 8.2
- **Frontend:** React 18 + Inertia.js + Tailwind CSS + Lucide Icons + Vite
- **Base de Datos:** MySQL (`solicitudes` / usuario: `admin_sol`)
- **Almacenamiento de Justificantes:** `storage/app/public/respaldos/` expuesto vía symlink en `public/storage`.

### 👥 Roles y Flujo de Trabajo (Workflow)
1. **Solicitante / Empleado:**
   - Registra solicitudes de pago a proveedores o caja chica.
   - Selecciona Empresa (Fralak, Dotmed, CID), Aprobador Principal, Jefes en Copia y Personal de Contabilidad.
2. **Jefe / Jefatura (Aprobaciones):**
   - Recibe notificación por correo con enlaces firmados (*Signed URLs*) y bandeja web.
   - Puede **Aprobar**, **Observar** o **Rechazar** con un solo clic.
   - Puede crear solicitudes propias (si selecciona a otro aprobador/gerente, pasa a revisión; si no, se auto-aprueba hacia Contabilidad).
3. **Caja Chica (Maribel Caero - Fralak):**
   - Las solicitudes en moneda **BOB <= 300** o marcadas como Caja Chica se asignan automáticamente al flujo de Caja Chica.
4. **Contabilidad / Finanzas:**
   - Procesa los pagos autorizados, sube el comprobante de transferencia/cheque y notifica al solicitante.
5. **Administrador:**
   - Control total de usuarios, roles, asignación de correos corporativos por empresa y catálogo de proveedores.

---

## 🚀 3. Estado Actual de Cambios Implementados (Completados)

### ✅ Homogeneización de Formularios de Proveedores
- Se estandarizaron los formularios y modales de registro de proveedores en todas las vistas (`Admin`, `Solicitante`, `Jefatura`, `Contabilidad` y `Mis Solicitudes`).
- El catálogo de proveedores es **global** y visible para todos los usuarios.
- Detección inteligente de duplicados por coincidencia insensible a mayúsculas/minúsculas de razón social, NIT o número de cuenta.

### ✅ Corrección de Excepción al Elegir Otros Aprobadores
- Se corrigió el método `SolicitudNuevaMail::notificarJefatura` y su alias `notificarNuevaSolicitud` en [SolicitudNuevaMail.php](file:///C:/Users/franco/Desktop/sistema_solicitud/sistema_solicitud/app/Mail/SolicitudNuevaMail.php).
- Se inicializó explícitamente `$primaryContaId` en [SolicitanteController.php](file:///C:/Users/franco/Desktop/sistema_solicitud/sistema_solicitud/app/Http/Controllers/SolicitanteController.php).
- Se optimizó el componente [JefeMultiSelect.jsx](file:///C:/Users/franco/Desktop/sistema_solicitud/sistema_solicitud/resources/js/Components/JefeMultiSelect.jsx) para que al hacer **un solo clic** sobre cualquier jefe/gerente (ej. Carlos, Alejandra, Raul), quede seleccionado de inmediato como **Aprobador Principal**, permitiendo opcionalmente añadir copias mediante su casilla de verificación.

### ✅ Despliegue en Producción
- Código backend subido y sincronizado en el servidor cPanel.
- Frontend compilado (`build/`) subido y verificado con respuesta `HTTP/2 200 OK`.
- Migraciones de base de datos verificadas al día (Batch 6 completado).

---

## 📡 4. Diagnóstico Técnico de Correos (Zoho vs GoDaddy)

### 🔍 Hallazgos del Escaneo de Red en el Servidor
| Destino / Protocolo | Puerto | Estado en el Servidor | Causa Técnica |
|---|---|---|---|
| `smtppro.zoho.com` (SMTP SSL) | `465` | ❌ **Connection timed out** | Bloqueado por firewall GoDaddy / cPanel |
| `smtppro.zoho.com` (SMTP TLS) | `587` | ❌ **Connection timed out** | Bloqueado por firewall GoDaddy / cPanel |
| `smtpout.secureserver.net` | `25 / 465 / 587` | ❌ **Connection timed out** | Bloqueado por firewall GoDaddy / cPanel |
| `accounts.zoho.com` / `mail.zoho.com` | `443 (HTTPS)` | ✅ **100% ABIERTO (0.10s)** | Conexión web segura sin restricciones |
| APIs de Correo (Brevo / Resend / SendGrid) | `443 (HTTPS)` | ✅ **100% ABIERTO (0.07s)** | Conexión ultra rápida por HTTPS |

### 🔐 Credenciales e Integración Zoho Mail REST API (Implementado y Activo)
- **Driver Activo en Laravel:** `MAIL_MAILER=zoho` (Transporte nativo HTTPS / Puerto 443)
- **Cuenta Remitente:** `sistemas@fralak.com.bo`
- **Zoho Account ID:** `4064114000000008002`
- **Client ID:** `1000.RM6T2D50KLYXR9CWDDZFKUUYI3FFOD`
- **Client Secret:** `e78fba230a3a5ea68bf2297125bebe287b2123df21`
- **Refresh Token Permanente:** `1000.11453557c2ef9b3b7619d4b416bbdea0.233660f47fd9bde338b2d469b1b964eb`
- **Endpoint API:** `https://mail.zoho.com/api/accounts/4064114000000008002/messages`

---

## 🎯 5. Estado de Correos: RESUELTO AL 100%

✅ **Integración Zoho Mail REST API Completada:**
- Se implementó el driver [ZohoMailTransport.php](file:///C:/Users/franco/Desktop/sistema_solicitud/sistema_solicitud/app/Mail/Transport/ZohoMailTransport.php) que se comunica directamente con la API REST de Zoho Mail vía HTTPS (Puerto 443).
- **Inmune a bloqueos de GoDaddy:** Al no usar puertos SMTP tradicionales (25/465/587), los correos viajan por HTTPS con entrega instantánea.
- **Registro en Zoho:** Todos los correos quedan registrados en la carpeta de **"Enviados"** de `sistemas@fralak.com.bo` y se entregan a cualquier destinatario.
- **Verificación en Producción:** Ejecutado `php artisan mail:test sistemas@fralak.com.bo` con resultado `[ÉXITO]`.
