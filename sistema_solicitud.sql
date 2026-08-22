-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-08-2026 a las 21:37:41
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistema_solicitud`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresas`
--

CREATE TABLE `empresas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `nit` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empresas`
--

INSERT INTO `empresas` (`id`, `nombre`, `nit`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Fralak SRL', '121461022', '2026-08-14 22:31:03', '2026-08-15 01:48:01', NULL),
(2, 'Dotmed SRL', '207008020', '2026-08-14 22:31:03', '2026-08-15 01:48:12', NULL),
(3, 'CID SRL', '418656020', '2026-08-14 22:31:04', '2026-08-15 01:48:24', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_reset_tokens_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2026_08_11_000001_create_empresas_table', 1),
(6, '2026_08_11_000002_create_roles_table', 1),
(7, '2026_08_11_000003_create_usuarios_table', 1),
(8, '2026_08_11_000004_create_proveedores_table', 1),
(9, '2026_08_11_000005_create_solicitudes_table', 1),
(10, '2026_08_12_000001_create_usuario_empresa_table', 1),
(11, '2026_08_13_000001_add_jefe_id_to_solicitudes_table', 1),
(12, '2026_08_14_000001_add_contabilidad_id_to_solicitudes_table', 1),
(13, '2026_08_17_000002_make_extra_fields_nullable_in_usuarios_table', 2),
(14, '2026_08_18_000001_update_proveedores_and_solicitudes_for_caja_chica', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `creado_por_usuario_id` bigint(20) UNSIGNED NOT NULL,
  `nombre_razon_social` varchar(150) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `nit_ci` varchar(50) DEFAULT NULL,
  `banco` varchar(100) DEFAULT NULL,
  `tipo_cuenta` varchar(50) DEFAULT NULL,
  `numero_cuenta` varchar(100) DEFAULT NULL,
  `nombre_titular_cuenta` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'Acceso total al sistema y gestión completa', '2026-08-14 22:31:02', '2026-08-14 22:31:02'),
(2, 'Jefe', 'Revisión y aprobación de solicitudes de su área', '2026-08-14 22:31:02', '2026-08-14 22:31:02'),
(3, 'Contabilidad', 'Procesamiento de pagos y desembolsos', '2026-08-14 22:31:02', '2026-08-14 22:31:02'),
(4, 'Solicitante', 'Creación y seguimiento de solicitudes de pago', '2026-08-14 22:31:02', '2026-08-14 22:31:02'),
(5, 'Caja Chica', 'Gestión y desembolso exclusivo de solicitudes de Caja Chica (Hasta 300 BOB)', '2026-08-21 00:00:00', '2026-08-21 00:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes`
--

CREATE TABLE `solicitudes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `empresa_id` bigint(20) UNSIGNED NOT NULL,
  `solicitante_id` bigint(20) UNSIGNED NOT NULL,
  `tipo_solicitud` varchar(50) NOT NULL DEFAULT 'Pago a Proveedor',
  `jefe_id` bigint(20) UNSIGNED DEFAULT NULL,
  `contabilidad_id` bigint(20) UNSIGNED DEFAULT NULL,
  `proveedor_id` bigint(20) UNSIGNED NOT NULL,
  `motivo_descripcion` text NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `moneda` enum('BOB','USD') NOT NULL DEFAULT 'BOB',
  `tipo_documento` enum('Factura','Recibo','Contrato','Otro') NOT NULL,
  `emite_factura` tinyint(1) NOT NULL DEFAULT 0,
  `modalidad_pago` enum('Transferencia','Cheque','Efectivo','QR') NOT NULL,
  `archivo_respaldo_path` varchar(255) DEFAULT NULL,
  `estado` enum('Pendiente','Observado','Aprobado_Jefatura','Pagado','Rechazado') NOT NULL DEFAULT 'Pendiente',
  `comentarios_revision` text DEFAULT NULL,
  `revisado_por_jefe_id` bigint(20) UNSIGNED DEFAULT NULL,
  `procesado_por_conta_id` bigint(20) UNSIGNED DEFAULT NULL,
  `fecha_solicitud` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `solicitudes`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `rol_id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `ci` varchar(50) DEFAULT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `correo` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `rol_id`, `nombre`, `apellidos`, `ci`, `cargo`, `direccion`, `telefono`, `correo`, `password`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Admin', 'Sistema', '0000000', 'Administrador General', 'Av. 6 de Agosto #2412, La Paz', '0000000', 'admin@sistema.com', '$2y$12$WUWaTfhqhsPIXWshV31NSugJaCQ63RtyN9webwWlL2JhDqdW7klje', NULL, '2026-08-14 22:31:02', '2026-08-18 01:28:27', NULL),
(2, 2, 'Leandro Agustin', 'Montealegre Corcuy', '5948302 CB', 'Jefe Nacional de Ventas', 'Calle España #104, Cochabamba', '72345678', 'leandro.montealegre@fralak.com.bo', '$2y$12$JKpz/vz3ObfUimso4b56Vedijk3sjq/E2EqZjgCpgx6mvyOdrIf2i', NULL, '2026-08-14 22:31:03', '2026-08-18 01:28:39', NULL),
(3, 3, 'Carmen Vannessa', 'Ortega Almendras', '3920192 SC', 'Contadora', '0000000', '73456789', 'administracion@fralak.com.bo', '$2y$12$GWkJUkuVQgsadHEPtUCIYeNcqoadtHedpodd40.Lk95nHuC6MNNVa', NULL, '2026-08-14 22:31:03', '2026-08-18 01:28:40', NULL),
(4, 4, 'Brandon', 'Hurtado Sanchez', '8933239 SC', 'Asistente de Sistemas', 'Villa 1ro de mayo', '64884111', 'sistemas@fralak.com.bo', '$2y$12$2HZeHnAjo/Zc8LL0NuSJUe3ldN1JjwJcLK5Up8FYtorARHV/cbPe6', NULL, '2026-08-14 22:31:03', '2026-08-18 01:28:32', NULL),
(5, 4, 'Farid Fabricio', 'Alvares Castro', NULL, 'Coordinador Técnico', NULL, NULL, 'soporte.rx@fralak.com.bo', '$2y$12$G.beOpuLRuRKoS4wkiZOI.5Sqt9YNq4HWwaz5lpNpD3o3JG3CuqxG', NULL, '2026-08-17 22:56:41', '2026-08-18 01:28:27', NULL),
(6, 4, 'Katiusca Lizeth', 'Arrazola', NULL, 'Asistente Administrativa', NULL, NULL, 'katiusca.arrazola@fralak.com.bo', '$2y$12$m/B8fn5ezyBxsOD0CTWoy.e9ZnS.vQn.tm2o32uqE4SnOntdGHHhC', NULL, '2026-08-17 22:56:42', '2026-08-18 01:28:28', NULL),
(7, 4, 'Jose Carlos', 'Cañipa Fuentes', NULL, 'Gerente de Línea', NULL, NULL, 'medica.cbba@fralak.com.bo', '$2y$12$5bgc8wEfrci6geqsBtuoEeUymLDX4iZ/0IK3JbmNDEKwTh0Xw5ekG', NULL, '2026-08-17 22:56:43', '2026-08-18 01:28:28', NULL),
(8, 4, 'Lidia', 'Chambi Laura', NULL, 'Coordinadora de Almacén', NULL, NULL, 'bodega.lpz@fralak.com.bo', '$2y$12$YejbEnvXLsrg3aCfSqXWh.5stsjvnUuMJdrzvpepxDaxEQoQc.3xe', NULL, '2026-08-17 22:56:43', '2026-08-18 01:28:28', NULL),
(9, 4, 'Leidy', 'Cuellar vda. de Hemard', NULL, 'Gerente General', NULL, NULL, 'leidy.cuellar@fralak.com.bo', '$2y$12$kRjRNG2oP0ZqzjVhjNIHxuoaTcUJkVIXfWS/h9VOfrJSAQm/TSwq6', NULL, '2026-08-17 22:56:43', '2026-08-18 01:28:29', NULL),
(10, 4, 'Pamela', 'Cuentas Arratia', NULL, NULL, NULL, NULL, 'pamela.cuentas.arratia@fralak.com.bo', '$2y$12$G/ypirxvldsG7VgVdkpzdONMo7bJnvh4IPB1fedV05CZ8pW0U5pyy', NULL, '2026-08-17 22:56:44', '2026-08-17 22:57:53', NULL),
(11, 2, 'Eduardo Alfonzo', 'Duran Parada', NULL, 'Auditor (a)', NULL, NULL, 'auditoria@fralak.com.bo', '$2y$12$HgjpdVHTolqgbX4QhS0Tj.Vk5AH9RWKnXZ7QWowMdOc/Hl9CPgmEq', NULL, '2026-08-17 22:56:44', '2026-08-18 01:28:29', NULL),
(12, 4, 'Maria Alejandra', 'Eid Aramayo', NULL, 'Enc. de Comercio Exterior', NULL, NULL, 'comercio.exterior@fralak.com.bo', '$2y$12$q8NGbkRBEcWp8qnfHJP7M.9Uh3I.KXU1ivVnTLTz9BWtEll3mu8Ry', NULL, '2026-08-17 22:56:44', '2026-08-18 01:28:29', NULL),
(13, 4, 'Marcelo Santiago', 'Flores Ramos', NULL, 'Especialista de Línea', NULL, NULL, 'marcelo.flores@fralak.com.bo', '$2y$12$tjmc9yDEnnA4mCgNAa/8FuRkMEdu8QGtZWeO6E1LsRFiq1y6Ip0lK', NULL, '2026-08-17 22:56:45', '2026-08-18 01:28:30', NULL),
(14, 4, 'Brandon Diego', 'Copali Encinas', NULL, 'Marketing y Diseño Gráfico', NULL, NULL, 'd.grafico@fralak.com.bo', '$2y$12$NTjvVEq3ccswJlZ01Y2iqe6sLOc042SZXJJHXLjxmSAOtTjVfS7/O', NULL, '2026-08-17 22:56:45', '2026-08-18 01:28:30', NULL),
(15, 3, 'Fabiana', 'Ayllon Abrego', NULL, 'Auxiliar Contable', NULL, NULL, 'pagos@fralak.com.bo', '$2y$12$yT9qNLQiIH5PW8XQOR3jae9Gwmq56y5yQRFan/h8cQ/qOD2yW.TeK', NULL, '2026-08-17 22:56:45', '2026-08-18 01:28:31', NULL),
(16, 4, 'Andres Fernando', 'Ordoñez Severich', NULL, 'Especialista de Línea', NULL, NULL, 'endoscopia@fralak.com.bo', '$2y$12$.F2CLkDOEfPcIO0Noel/oOE.4zkQjhWlA1dXxZeshamotiK7X9BD6', NULL, '2026-08-17 22:56:46', '2026-08-18 01:28:31', NULL),
(17, 4, 'Jose Daniel', 'Salazar Arocha', NULL, 'Asistente de Servicio Técnico', NULL, NULL, 'soporte.sis@fralak.com.bo', '$2y$12$gy9AotF1PnJkhkc5QFzQjeFVcnDbB55lC2IC.nzNBRHAk3flGn5Z.', NULL, '2026-08-17 22:56:46', '2026-08-18 01:28:32', NULL),
(18, 3, 'Maribel', 'Caero Agreda', NULL, 'Regente Farmacéutico', NULL, NULL, 'regente.scz@fralak.com.bo', '$2y$12$XBMsRtXBHtbTQehHMs4E2.bKr6KUfnNIzzDR5CpgXSUa7SKYNLSbe', NULL, '2026-08-17 22:56:47', '2026-08-18 01:28:33', NULL),
(19, 4, 'Edwin Fernando', 'Daza Villanueva', NULL, 'Ingeniero de Servicio Técnico', NULL, NULL, 'soporte.cbba@fralak.com.bo', '$2y$12$18PUUBa65OBbqhMuksQGQeE/5ku3n/G8yHdr93rLtucaURVawsPim', NULL, '2026-08-17 22:56:47', '2026-08-18 01:28:33', NULL),
(20, 4, 'Antoine', 'Hemard Antelo', NULL, 'Asistente Administrativo General', NULL, NULL, 'antoine.hemard@fralak.com.bo', '$2y$12$.kxS.CG0uS7ze79nzUKdXeKqhHVGLVkFTGd6JwL23EnRgxHHwFdfK', NULL, '2026-08-17 22:56:48', '2026-08-18 01:28:34', NULL),
(21, 4, 'Julio Luis', 'Herrera Quintana', NULL, 'Especialista de Línea', NULL, NULL, 'julio.herrera@fralak.com.bo', '$2y$12$JIUBXnquIOAdHj29g/j7luJ5hrivP5dmyFoNED0o/dbdGSyoB71Km', NULL, '2026-08-17 22:56:48', '2026-08-18 01:28:34', NULL),
(22, 4, 'Jhosimar', 'Colque Lazarte', NULL, 'Dpto. de Cobranzas', NULL, NULL, 'cobranza.scz@fralak.com.bo', '$2y$12$G6E7W9i6i.Y05WdvK3gv4OQ0FDiD9wYnjhLdnSzGFRj/Y5YSgUO.W', NULL, '2026-08-17 22:56:49', '2026-08-18 01:28:35', NULL),
(23, 4, 'Kevin Antonio', 'Hemard Cuellar', NULL, 'Gerente de Línea', NULL, NULL, 'kevin.hemard@fralak.com.bo', '$2y$12$ppgR1LrK/KYmNNC5Ld0sDu3xNUtZtF7nY9Cxy.2SdrTHL0UO0L3ES', NULL, '2026-08-17 22:56:49', '2026-08-18 01:28:35', NULL),
(24, 2, 'Leidy Alejandra', 'Hemard Cuellar', NULL, 'Gerente de Línea', NULL, NULL, 'alejandra.hemard@fralak.com.bo', '$2y$12$Y4WfDGmbyizVZcRJ4I0mJOcYYr2apq2aQODvV6PPsQFKl3Pbpv2uC', NULL, '2026-08-17 22:56:50', '2026-08-18 01:28:35', NULL),
(25, 2, 'Raul Antonio', 'Hemard Cuellar', NULL, 'Gerente de Negocios', NULL, NULL, 'raul.hemard@fralak.com.bo', '$2y$12$TY5GMBGBkL.3y2D9WxZrHOAVC0JAd7hth.P3sv/LMYJOwC/KAMCDy', NULL, '2026-08-17 22:56:50', '2026-08-18 01:28:36', NULL),
(26, 4, 'Raul Sebastian', 'Hemard Roca', NULL, 'Asistente Administrativo', NULL, NULL, 'sebastian.hemard@fralak.com.bo', '$2y$12$PQ9F/HUSVFbs5E6lVAHx7uvS2jfVh8skAvfaf0U.bLhVh1QICkYQ6', NULL, '2026-08-17 22:56:50', '2026-08-18 01:28:36', NULL),
(27, 4, 'Jessica Buenaventura', 'Hemard Salinas', NULL, 'Asistente Administrativa', NULL, NULL, 'jessica.hemard@fralak.com.bo', '$2y$12$f0NQ8G5yVXckBuJMAPz8Rugt8euGP400eJnyL6H42VjoxtfadmA0q', NULL, '2026-08-17 22:56:51', '2026-08-18 01:28:37', NULL),
(28, 4, 'Esther', 'Jordan Vargas', NULL, 'Regente Farmacéutico', NULL, NULL, 'regente.farmaceuticolp@fralak.com.bo', '$2y$12$9.1nziUjo/fg1p5l0WBPkujHNXtkRbHc0Bc0/AsFZ.mOea5/TCqbi', NULL, '2026-08-17 22:56:51', '2026-08-18 01:28:37', NULL),
(29, 4, 'Abel Angel', 'Leaño Cuellar', NULL, 'Enc. de Calidad y Seguridad', NULL, NULL, 'gestion.calidad@fralak.com.bo', '$2y$12$IgExZmvSNpMcjyNz7JdTaOzZICTNR9g3PZpJ/KAguwHWwEksjPs7G', NULL, '2026-08-17 22:56:52', '2026-08-18 01:28:38', NULL),
(30, 4, 'Jhon Joaquin', 'Lima Baltazar', NULL, 'Aux. de Recursos Humanos', NULL, NULL, 'auxrrhh@fralak.com.bo', '$2y$12$A9cmS/1fRDMMS/8j1VbcXekr577KVgmg2C6bO8fN8HUnKqyrLXbQW', NULL, '2026-08-17 22:56:52', '2026-08-18 01:28:38', NULL),
(31, 4, 'Carlos Eduardo', 'Lopez Pacheco', NULL, 'Jefe de Servicio Técnico', NULL, NULL, 'carlos.lopez@fralak.com.bo', '$2y$12$2R.ydI9YYZyukwzfVf4jP.fcichyeA4S1Z4np3XHKsCko4tH9QZpS', NULL, '2026-08-17 22:56:52', '2026-08-18 01:28:38', NULL),
(32, 4, 'Nancy Candelaria', 'Mamani Lopez', NULL, 'Auxiliar Clínico (a)', NULL, NULL, 'auxiliar.clinica@fralak.com.bo', '$2y$12$/NWl07B6329.AcGEgKJlSetESSm/qwpgg4FMxuxgnxtTlbiZ6BYae', NULL, '2026-08-17 22:56:53', '2026-08-18 01:28:39', NULL),
(33, 4, 'Catherine Nuria', 'Agramont Loaysa', NULL, 'Auxiliar Contable', NULL, NULL, 'contabilidad@fralak.com.bo', '$2y$12$c32nsNUjtci98UJq/6UuN.oQq9RqqgYCrNcg1I1u9EGIuAJC1wLva', NULL, '2026-08-17 22:56:54', '2026-08-18 01:28:40', NULL),
(34, 4, 'Liz Angela', 'Ponce Blas', NULL, 'Coordinadora Clínica', NULL, NULL, 'clinica.cbba@fralak.com.bo', '$2y$12$uLNmuY/nFcMko.DydhQSIegzAL0kNVvkUiEURCd2oVomRpFpCO9ca', NULL, '2026-08-17 22:56:54', '2026-08-18 01:28:40', NULL),
(35, 4, 'Paola Andrea', 'Poris Mercado', NULL, 'Coordinadora Clínica', NULL, NULL, 'clinica.baxter@fralak.com.bo', '$2y$12$C3RVpeoFCxkaBlUZ65YdveOxub62yEwtIghL/AGNBNEXe2QEhxZai', NULL, '2026-08-17 22:56:55', '2026-08-18 01:28:41', NULL),
(36, 4, 'Fabiola Carola', 'Ramirez Jimenez', NULL, 'Jefe F. Nacional de Almacénes', NULL, NULL, 'regente.farmaceutico@fralak.com.bo', '$2y$12$lCPX6A.65q5CIMDe.0VWJO11DEe96g8Fost5OoK4dS2keQU8AkRRq', NULL, '2026-08-17 22:56:55', '2026-08-18 01:28:41', NULL),
(37, 4, 'Gonzalo', 'Ramos', NULL, 'Auxiliar de Bodega', NULL, NULL, 'bodega.cbba@fralak.com.bo', '$2y$12$J9d59ioRhik7929RKJlc7OlPlBEDvCpeDj6/OZfE2F.ohxK4HgVG2', NULL, '2026-08-17 22:56:55', '2026-08-18 01:28:42', NULL),
(38, 4, 'Javier Santos', 'Ramos Quino', NULL, 'Chofer de Reparto', NULL, NULL, 'javier.ramos@fralak.com.bo', '$2y$12$pRf1PoPA6pxzkqCsEAbUKe31WJ4tr9PJeI.87x1404l3pwUzhWAEu', NULL, '2026-08-17 22:56:56', '2026-08-18 01:28:42', NULL),
(39, 4, 'Edgar', 'Rodriguez Ramirez', NULL, 'Auxiliar de Bodega', NULL, NULL, 'bodega.scz@fralak.com.bo', '$2y$12$q9NTHBfoYm/oeaPI8ulNF.ZkLS1QxwwwDDvXXUY1.dyR4CyoFdgiK', NULL, '2026-08-17 22:56:56', '2026-08-18 01:28:42', NULL),
(40, 4, 'Rodrigo Mario', 'Tenorio Villafan', NULL, 'Auxiliar de Bodega', NULL, NULL, 'auxbodega.lpz@fralak.com.bo', '$2y$12$zHi1h3O9VfZDmQtykPwyKOc0B9W.MRTsor9ouCnZBP9Emm3hT9gli', NULL, '2026-08-17 22:56:57', '2026-08-18 01:28:43', NULL),
(41, 4, 'Rolita', 'Aguirre Amuruz', NULL, 'Auxiliar Técnico', NULL, NULL, 'servicio.cbba@fralak.com.bo', '$2y$12$tFKW5oQ9r58PNSm5.dXMfux6M.CShDmh04zg8z.kHOlb2IKNxI8gu', NULL, '2026-08-17 22:56:57', '2026-08-18 01:28:43', NULL),
(42, 4, 'Martha Aracely', 'Llanos Huanca', NULL, 'Ejecutivo de Ventas', NULL, NULL, 'medica.lp@fralak.com.bo', '$2y$12$f97CR.PJhW3Zz3kiypiOIeXA7l4mQU4u2f0q1TqpiXhsdW8sJ.OiC', NULL, '2026-08-17 22:56:57', '2026-08-18 01:28:44', NULL),
(43, 4, 'Moises Bryam', 'Tococari Tacaraya', NULL, 'Auxiliar Técnico', NULL, NULL, 'moises.tococari@fralak.com.bo', '$2y$12$bxphFnCpGMbJM9xi46ZFFeT17x885Pe6/1OchntqBzqniWy93Kw/i', NULL, '2026-08-17 22:56:58', '2026-08-18 01:28:44', NULL),
(44, 4, 'Daruska Maribel', 'Velarde Perez', NULL, 'Encargada de Recursos Humanos', NULL, NULL, 'rrhh@fralak.com.bo', '$2y$12$RNy4h.A1/utgsKAkGu/iXeKiKpJBTlBVVpqORjp/ZPue3SuCJmJH.', NULL, '2026-08-17 22:56:58', '2026-08-18 01:28:44', NULL),
(45, 4, 'Fernando', 'Veliz Encinas', NULL, 'Ingeniero de Servicio', NULL, NULL, 'servicio.tecnico@fralak.com.bo', '$2y$12$HYhd6sN.ZdziPZmvhlP7huVPDAsJsa0X/SUzIIjqReFpYP/PC7MWG', NULL, '2026-08-17 22:56:59', '2026-08-18 01:28:45', NULL),
(46, 4, 'Yamila Clara', 'Labarden Contreras', NULL, 'Ejecutivo de Ventas', NULL, NULL, 'ventas@fralak.com.bo', '$2y$12$BqqgldWzSGbo1lT6YAShEeZzKvoRgqCZHwKWB1gCx2sx061CuVpZi', NULL, '2026-08-17 22:56:59', '2026-08-18 01:28:45', NULL),
(47, 3, 'Barry Alexis', 'Bautista Aguilar', NULL, 'Dpto. Impositivo', NULL, NULL, 'impositivo@cid.com.bo', '$2y$12$3tMkzaU.ogS33l5/PPfMZ.cbtx81Afnl11edmW0auA3sdwlapYJFK', NULL, '2026-08-17 22:56:59', '2026-08-18 01:28:46', NULL),
(48, 4, 'Jimena Guisela', 'Coca Colomo', NULL, 'Asistente Administrativo', NULL, NULL, 'administrativo.lpz@fralak.com.bo', '$2y$12$Ry6fEZrKIB/6DjrmI5Mt0e2gkyX7Bl7L6x/jgzq7eiJobuwYZ1ZQy', NULL, '2026-08-17 22:57:00', '2026-08-18 01:28:46', NULL),
(49, 4, 'Valeria Tatiana', 'Anaya Vaca', NULL, 'Ejecutivo de Ventas', NULL, NULL, 'insumos@fralak.com.bo', '$2y$12$Uio/mV/AcgZdEQKSJGTUbuOUo9gGqT6.jM1NK713zPgz9aEqPxYdK', NULL, '2026-08-17 22:57:00', '2026-08-18 01:28:47', NULL),
(50, 4, 'Mariana Lizette', 'Arraya Borges', NULL, 'Ejecutivo de Ventas', NULL, NULL, 'insumo.regional@dotmed.com.bo', '$2y$12$Ei86mQXG3dWvo39L4hP4eOYaOpwFFrvrsZ8I/ZvwUc3TEfh87rw6i', NULL, '2026-08-17 22:57:01', '2026-08-18 01:28:47', NULL),
(51, 4, 'Diego Armando', 'Cardozo Rodriguez', NULL, 'Auxiliar de Bodega', NULL, NULL, 'diego.cardozo@dotmed.com.bo', '$2y$12$fIK04czPARF.aAo8Rf0ZC.ZSjzweVjpwdLnV7nrxfTXcMGPvXj.IG', NULL, '2026-08-17 22:57:01', '2026-08-18 01:28:47', NULL),
(52, 3, 'Norma Mariel', 'Murillo Severiche', NULL, 'Contadora Administrativa', NULL, NULL, 'administracion@dotmed.com.bo', '$2y$12$F8P/m66iwgK7j81q0SZHKeQY8d.1QLnmUcgykEPwJ129BSTuOvOPu', NULL, '2026-08-17 22:57:02', '2026-08-18 01:28:48', NULL),
(53, 4, 'Jose Fernando', 'Prado San Martin', NULL, 'Especialista de Línea', NULL, NULL, 'fernando.prado@dotmed.com.bo', '$2y$12$lH5FcjiHUGFOSoyMd6vYEuV4UtLVYQQ.jM2cpHmr9k.YLuh4DxASG', NULL, '2026-08-17 22:57:02', '2026-08-18 01:28:48', NULL),
(54, 4, 'Camila Shaiel', 'Hurtado Patzi', NULL, 'Asistente de Licitaciones', NULL, NULL, 'licitaciones@dotmed.com.bo', '$2y$12$0JrwdYZX772YrK7p6oZvrejM5R36Qn4cCHH.QgDcOnxZz0XAFzeU.', NULL, '2026-08-17 22:57:03', '2026-08-18 01:28:49', NULL),
(55, 4, 'Juan Pablo', 'Bravo Vincenti', NULL, 'Auxiliar Contable', NULL, NULL, 'aux.contable@dotmed.com.bo', '$2y$12$C1pOXJpWKUw2MsE8GDbyNuDBrD8GaoNm3L1hgcI3Jcuf7LRXH4QWO', NULL, '2026-08-17 22:57:03', '2026-08-18 01:28:49', NULL),
(56, 4, 'Ruth', 'Rodriguez Huaycho', NULL, 'Coordinadora Centro Diálisis', NULL, NULL, 'clinica@cid.com.bo', '$2y$12$EN.J9A0U.pLfNxz8CANSKupwI.mLMKHlt5163T4IbXtVeAMUu.N1i', NULL, '2026-08-17 22:57:03', '2026-08-18 01:28:50', NULL),
(57, 4, 'Juan Carlos', 'Mayta Lima', NULL, 'Auxiliar Contable', NULL, NULL, 'contabilidad@cid.com.bo', '$2y$12$mSAmifVD4F93Ec71Z3LLGuo4km/E//Z2us5sq4hE1PXwEiI.0g//G', NULL, '2026-08-17 22:57:04', '2026-08-18 01:28:50', NULL),
(58, 4, 'Cecilia', 'Perez Acuña', NULL, 'Coordinadora de Servicio', NULL, NULL, 'atencion.servicio@cid.com.bo', '$2y$12$uH9KPXaY8qiwxhDvK40uF.0/e6Xh4junSzqHsjFHikiEffjxdjUcu', NULL, '2026-08-17 22:57:04', '2026-08-18 01:28:50', NULL),
(59, 4, 'Marcos', 'Peñaranda', NULL, 'Ingeniero de Servicio', NULL, NULL, 'soporte.lp@cid.com.bo', '$2y$12$9dMXyHDs09ok2DbrvClsj.mZzQPpbdRz7jGwy0FwfcnLpmbjvHFky', NULL, '2026-08-17 22:57:04', '2026-08-18 01:28:51', NULL),
(60, 4, 'Nelsi', 'Chana Casas', NULL, 'Fisioterapeuta-Kinesiologa', NULL, NULL, 'fisioterapia@cid.com.bo', '$2y$12$VqVW1FmoBM2/LNk1ssO7A.JjRO28H3Q3PJavlOBtqi3FT09q9Qp6S', NULL, '2026-08-17 22:57:05', '2026-08-18 01:28:51', NULL),
(61, 4, 'Miguel', 'Castro Montaño', NULL, 'Ingeniero de Servicio Técnico', NULL, NULL, 'miguel.castro@cid.com.bo', '$2y$12$MSRuafTvfp5w5VyGpAB0ZOneGhpDiLcxLXf02qSgas.aciRM/syWe', NULL, '2026-08-17 22:57:05', '2026-08-18 01:28:52', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_empresa`
--

CREATE TABLE `usuario_empresa` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `usuario_id` bigint(20) UNSIGNED NOT NULL,
  `empresa_id` bigint(20) UNSIGNED NOT NULL,
  `correo_corporativo` varchar(150) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario_empresa`
--

INSERT INTO `usuario_empresa` (`id`, `usuario_id`, `empresa_id`, `correo_corporativo`, `created_at`, `updated_at`) VALUES
(1, 4, 1, 'sistemas@fralak.com.bo', '2026-08-14 22:31:04', '2026-08-18 01:28:32'),
(2, 4, 2, 'sistemas@dotmed.com.bo', '2026-08-14 22:31:04', '2026-08-18 01:28:32'),
(3, 4, 3, 'sistemas@cid.com.bo', '2026-08-14 22:31:04', '2026-08-18 01:28:32'),
(4, 2, 1, 'leandro.montealegre@fralak.com.bo', '2026-08-14 22:31:05', '2026-08-18 01:28:39'),
(10, 3, 1, 'administracion@fralak.com.bo', '2026-08-14 22:31:05', '2026-08-18 01:28:40'),
(13, 5, 1, 'soporte.rx@fralak.com.bo', '2026-08-17 22:56:41', '2026-08-18 01:28:27'),
(14, 5, 3, 'soporte.rx@cid.com.bo', '2026-08-17 22:56:41', '2026-08-18 01:28:27'),
(15, 6, 1, 'katiusca.arrazola@fralak.com.bo', '2026-08-17 22:56:42', '2026-08-18 01:28:28'),
(16, 7, 1, 'medica.cbba@fralak.com.bo', '2026-08-17 22:56:43', '2026-08-18 01:28:28'),
(17, 8, 1, 'bodega.lpz@fralak.com.bo', '2026-08-17 22:56:43', '2026-08-18 01:28:28'),
(18, 9, 1, 'leidy.cuellar@fralak.com.bo', '2026-08-17 22:56:43', '2026-08-18 01:28:29'),
(19, 11, 1, 'auditoria@fralak.com.bo', '2026-08-17 22:56:44', '2026-08-18 01:28:29'),
(20, 12, 1, 'comercio.exterior@fralak.com.bo', '2026-08-17 22:56:44', '2026-08-18 01:28:29'),
(21, 12, 3, 'comercio.exterior@cid.com.bo', '2026-08-17 22:56:44', '2026-08-18 01:28:30'),
(22, 13, 1, 'marcelo.flores@fralak.com.bo', '2026-08-17 22:56:45', '2026-08-18 01:28:30'),
(23, 14, 1, 'd.grafico@fralak.com.bo', '2026-08-17 22:56:45', '2026-08-18 01:28:30'),
(24, 14, 3, 'd.grafico@cid.com.bo', '2026-08-17 22:56:45', '2026-08-18 01:28:30'),
(25, 15, 1, 'pagos@fralak.com.bo', '2026-08-17 22:56:45', '2026-08-18 01:28:31'),
(26, 16, 1, 'endoscopia@fralak.com.bo', '2026-08-17 22:56:46', '2026-08-18 01:28:31'),
(27, 16, 2, 'endoscopia@dotmed.com.bo', '2026-08-17 22:56:46', '2026-08-18 01:28:31'),
(28, 17, 1, 'soporte.sis@fralak.com.bo', '2026-08-17 22:56:46', '2026-08-18 01:28:32'),
(29, 17, 3, 'soporte.sis@cid.com.bo', '2026-08-17 22:56:46', '2026-08-18 01:28:32'),
(30, 18, 1, 'regente.scz@fralak.com.bo', '2026-08-17 22:56:47', '2026-08-18 01:28:33'),
(31, 18, 2, 'regencia@dotmed.com.bo', '2026-08-17 22:56:47', '2026-08-18 01:28:33'),
(32, 19, 1, 'soporte.cbba@fralak.com.bo', '2026-08-17 22:56:47', '2026-08-18 01:28:33'),
(33, 19, 2, 'servicio.cbba@dotmed.com.bo', '2026-08-17 22:56:48', '2026-08-18 01:28:33'),
(34, 19, 3, 'plataforma.servicio@cid.com.bo', '2026-08-17 22:56:48', '2026-08-18 01:28:33'),
(35, 20, 1, 'antoine.hemard@fralak.com.bo', '2026-08-17 22:56:48', '2026-08-18 01:28:34'),
(36, 21, 1, 'julio.herrera@fralak.com.bo', '2026-08-17 22:56:48', '2026-08-18 01:28:34'),
(37, 21, 3, 'comercial.lpz@cid.com.bo', '2026-08-17 22:56:48', '2026-08-18 01:28:34'),
(38, 22, 1, 'cobranza.scz@fralak.com.bo', '2026-08-17 22:56:49', '2026-08-18 01:28:35'),
(39, 23, 1, 'kevin.hemard@fralak.com.bo', '2026-08-17 22:56:49', '2026-08-18 01:28:35'),
(40, 23, 2, 'kevin.hemard@dotmed.com.bo', '2026-08-17 22:56:49', '2026-08-18 01:28:35'),
(41, 23, 3, 'kevin.hemard@cid.com.bo', '2026-08-17 22:56:49', '2026-08-18 01:28:35'),
(42, 24, 1, 'alejandra.hemard@fralak.com.bo', '2026-08-17 22:56:50', '2026-08-18 01:28:35'),
(43, 24, 2, 'importaciones@dotmed.com.bo', '2026-08-17 22:56:50', '2026-08-18 01:28:36'),
(44, 24, 3, 'alejandra.hemard@cid.com.bo', '2026-08-17 22:56:50', '2026-08-18 01:28:36'),
(45, 25, 1, 'raul.hemard@fralak.com.bo', '2026-08-17 22:56:50', '2026-08-18 01:28:36'),
(46, 25, 2, 'gerencia@dotmed.com.bo', '2026-08-17 22:56:50', '2026-08-18 01:28:36'),
(47, 25, 3, 'raul.hemard@cid.com.bo', '2026-08-17 22:56:50', '2026-08-18 01:28:36'),
(48, 26, 1, 'sebastian.hemard@fralak.com.bo', '2026-08-17 22:56:51', '2026-08-18 01:28:36'),
(49, 27, 1, 'jessica.hemard@fralak.com.bo', '2026-08-17 22:56:51', '2026-08-18 01:28:37'),
(50, 28, 1, 'regente.farmaceuticolp@fralak.com.bo', '2026-08-17 22:56:51', '2026-08-18 01:28:37'),
(51, 29, 1, 'gestion.calidad@fralak.com.bo', '2026-08-17 22:56:52', '2026-08-18 01:28:38'),
(52, 29, 3, 'gestion.calidad@cid.com.bo', '2026-08-17 22:56:52', '2026-08-18 01:28:38'),
(53, 30, 1, 'auxrrhh@fralak.com.bo', '2026-08-17 22:56:52', '2026-08-18 01:28:38'),
(54, 31, 1, 'carlos.lopez@fralak.com.bo', '2026-08-17 22:56:52', '2026-08-18 01:28:38'),
(55, 31, 2, 'servicio.tecnico@dotmed.com.bo', '2026-08-17 22:56:52', '2026-08-18 01:28:38'),
(56, 31, 3, 'servicio.tecnico@cid.com.bo', '2026-08-17 22:56:52', '2026-08-18 01:28:38'),
(57, 32, 1, 'auxiliar.clinica@fralak.com.bo', '2026-08-17 22:56:53', '2026-08-18 01:28:39'),
(58, 33, 1, 'contabilidad@fralak.com.bo', '2026-08-17 22:56:54', '2026-08-18 01:28:40'),
(59, 34, 1, 'clinica.cbba@fralak.com.bo', '2026-08-17 22:56:54', '2026-08-18 01:28:41'),
(60, 34, 3, 'comercial.cbba@cid.com.bo', '2026-08-17 22:56:54', '2026-08-18 01:28:41'),
(61, 35, 1, 'clinica.baxter@fralak.com.bo', '2026-08-17 22:56:55', '2026-08-18 01:28:41'),
(62, 35, 3, 'comercial.scz@cid.com.bo', '2026-08-17 22:56:55', '2026-08-18 01:28:41'),
(63, 36, 1, 'regente.farmaceutico@fralak.com.bo', '2026-08-17 22:56:55', '2026-08-18 01:28:41'),
(64, 37, 1, 'bodega.cbba@fralak.com.bo', '2026-08-17 22:56:56', '2026-08-18 01:28:42'),
(65, 38, 1, 'javier.ramos@fralak.com.bo', '2026-08-17 22:56:56', '2026-08-18 01:28:42'),
(66, 39, 1, 'bodega.scz@fralak.com.bo', '2026-08-17 22:56:56', '2026-08-18 01:28:42'),
(67, 40, 1, 'auxbodega.lpz@fralak.com.bo', '2026-08-17 22:56:57', '2026-08-18 01:28:43'),
(68, 41, 1, 'servicio.cbba@fralak.com.bo', '2026-08-17 22:56:57', '2026-08-18 01:28:43'),
(69, 41, 2, 'soporte@dotmed.com.bo', '2026-08-17 22:56:57', '2026-08-18 01:28:43'),
(70, 42, 1, 'medica.lp@fralak.com.bo', '2026-08-17 22:56:57', '2026-08-18 01:28:44'),
(71, 43, 1, 'moises.tococari@fralak.com.bo', '2026-08-17 22:56:58', '2026-08-18 01:28:44'),
(72, 43, 2, 'servicio.scz@dotmed.com.bo', '2026-08-17 22:56:58', '2026-08-18 01:28:44'),
(73, 43, 3, 'servicio.scz@cid.com.bo', '2026-08-17 22:56:58', '2026-08-18 01:28:44'),
(74, 44, 1, 'rrhh@fralak.com.bo', '2026-08-17 22:56:58', '2026-08-18 01:28:44'),
(75, 45, 1, 'servicio.tecnico@fralak.com.bo', '2026-08-17 22:56:59', '2026-08-18 01:28:45'),
(76, 45, 3, 'servicio.tecnico@cid.com.bo', '2026-08-17 22:56:59', '2026-08-18 01:28:45'),
(77, 46, 1, 'ventas@fralak.com.bo', '2026-08-17 22:56:59', '2026-08-18 01:28:45'),
(78, 46, 3, 'regencia@cid.com.bo', '2026-08-17 22:56:59', '2026-08-18 01:28:45'),
(79, 47, 1, 'impositivo@cid.com.bo', '2026-08-17 22:57:00', '2026-08-18 01:28:46'),
(80, 47, 3, 'administracion@cid.com.bo', '2026-08-17 22:57:00', '2026-08-18 01:28:46'),
(81, 48, 1, 'administrativo.lpz@fralak.com.bo', '2026-08-17 22:57:00', '2026-08-18 01:28:46'),
(82, 49, 1, 'insumos@fralak.com.bo', '2026-08-17 22:57:00', '2026-08-18 01:28:47'),
(83, 49, 2, 'insumos@dotmed.com.bo', '2026-08-17 22:57:00', '2026-08-18 01:28:47'),
(84, 50, 2, 'insumo.regional@dotmed.com.bo', '2026-08-17 22:57:01', '2026-08-18 01:28:47'),
(85, 51, 2, 'diego.cardozo@dotmed.com.bo', '2026-08-17 22:57:01', '2026-08-18 01:28:48'),
(86, 51, 3, 'bodega@cid.com.bo', '2026-08-17 22:57:01', '2026-08-18 01:28:48'),
(87, 52, 2, 'administracion@dotmed.com.bo', '2026-08-17 22:57:02', '2026-08-18 01:28:48'),
(88, 53, 2, 'fernando.prado@dotmed.com.bo', '2026-08-17 22:57:02', '2026-08-18 01:28:48'),
(89, 54, 2, 'licitaciones@dotmed.com.bo', '2026-08-17 22:57:03', '2026-08-18 01:28:49'),
(90, 54, 3, 'licitaciones@cid.com.bo', '2026-08-17 22:57:03', '2026-08-18 01:28:49'),
(91, 55, 2, 'aux.contable@dotmed.com.bo', '2026-08-17 22:57:03', '2026-08-18 01:28:49'),
(92, 56, 3, 'clinica@cid.com.bo', '2026-08-17 22:57:03', '2026-08-18 01:28:50'),
(93, 57, 3, 'contabilidad@cid.com.bo', '2026-08-17 22:57:04', '2026-08-18 01:28:50'),
(94, 58, 3, 'atencion.servicio@cid.com.bo', '2026-08-17 22:57:04', '2026-08-18 01:28:50'),
(95, 59, 3, 'soporte.lp@cid.com.bo', '2026-08-17 22:57:05', '2026-08-18 01:28:51'),
(96, 60, 3, 'fisioterapia@cid.com.bo', '2026-08-17 22:57:05', '2026-08-18 01:28:51'),
(97, 61, 3, 'miguel.castro@cid.com.bo', '2026-08-17 22:57:05', '2026-08-18 01:28:52');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proveedores_creado_por_usuario_id_foreign` (`creado_por_usuario_id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `solicitudes_empresa_id_foreign` (`empresa_id`),
  ADD KEY `solicitudes_solicitante_id_foreign` (`solicitante_id`),
  ADD KEY `solicitudes_proveedor_id_foreign` (`proveedor_id`),
  ADD KEY `solicitudes_revisado_por_jefe_id_foreign` (`revisado_por_jefe_id`),
  ADD KEY `solicitudes_procesado_por_conta_id_foreign` (`procesado_por_conta_id`),
  ADD KEY `solicitudes_jefe_id_foreign` (`jefe_id`),
  ADD KEY `solicitudes_contabilidad_id_foreign` (`contabilidad_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuarios_correo_unique` (`correo`),
  ADD KEY `usuarios_rol_id_foreign` (`rol_id`);

--
-- Indices de la tabla `usuario_empresa`
--
ALTER TABLE `usuario_empresa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_empresa_usuario_id_empresa_id_unique` (`usuario_id`,`empresa_id`),
  ADD KEY `usuario_empresa_empresa_id_foreign` (`empresa_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `empresas`
--
ALTER TABLE `empresas`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT de la tabla `usuario_empresa`
--
ALTER TABLE `usuario_empresa`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD CONSTRAINT `proveedores_creado_por_usuario_id_foreign` FOREIGN KEY (`creado_por_usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD CONSTRAINT `solicitudes_contabilidad_id_foreign` FOREIGN KEY (`contabilidad_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `solicitudes_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`),
  ADD CONSTRAINT `solicitudes_jefe_id_foreign` FOREIGN KEY (`jefe_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `solicitudes_procesado_por_conta_id_foreign` FOREIGN KEY (`procesado_por_conta_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `solicitudes_proveedor_id_foreign` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  ADD CONSTRAINT `solicitudes_revisado_por_jefe_id_foreign` FOREIGN KEY (`revisado_por_jefe_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `solicitudes_solicitante_id_foreign` FOREIGN KEY (`solicitante_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_rol_id_foreign` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);

--
-- Filtros para la tabla `usuario_empresa`
--
ALTER TABLE `usuario_empresa`
  ADD CONSTRAINT `usuario_empresa_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `usuario_empresa_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
