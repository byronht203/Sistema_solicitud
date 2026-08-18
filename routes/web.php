<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\SolicitudController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ContabilidadController;
use App\Http\Controllers\JefaturaController;
use App\Http\Controllers\SolicitanteController;
use App\Http\Controllers\SolicitudEmailController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Rutas firmadas públicas (Signed URLs) accesibles directamente desde Zoho Mail
Route::get('/solicitudes/email-aprobar/{solicitud}', [SolicitudEmailController::class, 'aprobar'])->name('solicitudes.email-aprobar');
Route::get('/solicitudes/email-rechazar/{solicitud}', [SolicitudEmailController::class, 'rechazar'])->name('solicitudes.email-rechazar');
Route::get('/api/solicitudes/{solicitud}/comprobante-correo', [SolicitudEmailController::class, 'comprobanteCorreo'])->name('solicitudes.comprobante-correo-api');
Route::get('/solicitudes/{solicitud}/comprobante-correo', [SolicitudEmailController::class, 'comprobanteCorreo'])->name('solicitudes.comprobante-correo');

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth'])->group(function () {
    // Redirección inteligente por Rol al Dashboard correspondiente
    Route::get('/dashboard', function () {
        $user = auth()->user();
        if ($user && $user->esSolicitante()) {
            return redirect()->route('solicitante.dashboard');
        }
        if ($user && $user->esJefe()) {
            return redirect()->route('jefatura.dashboard');
        }
        if ($user && $user->esContabilidad()) {
            return redirect()->route('contabilidad.dashboard');
        }
        return app(AdminDashboardController::class)->index();
    })->name('dashboard');

    // Módulo de Solicitante / Ejecutivo de Compras
    Route::prefix('solicitante')->name('solicitante.')->group(function () {
        Route::get('/dashboard', [SolicitanteController::class, 'dashboard'])->name('dashboard');
        Route::get('/solicitudes', [SolicitanteController::class, 'solicitudes'])->name('solicitudes');
        Route::post('/solicitudes', [SolicitanteController::class, 'store'])->name('solicitudes.store');
        Route::post('/solicitudes/{solicitud}', [SolicitanteController::class, 'update'])->name('solicitudes.update');
        Route::delete('/solicitudes/{solicitud}', [SolicitanteController::class, 'destroy'])->name('solicitudes.destroy');
        Route::get('/proveedores', [SolicitanteController::class, 'proveedores'])->name('proveedores');
    });

    // Módulo de Jefatura y Aprobación de Solicitudes
    Route::prefix('jefatura')->name('jefatura.')->group(function () {
        Route::get('/dashboard', [JefaturaController::class, 'dashboard'])->name('dashboard');
        Route::get('/solicitudes', [JefaturaController::class, 'solicitudes'])->name('solicitudes');
        Route::post('/solicitudes/{solicitud}/aprobar', [JefaturaController::class, 'aprobar'])->name('solicitudes.aprobar');
        Route::post('/solicitudes/{solicitud}/observar', [JefaturaController::class, 'observar'])->name('solicitudes.observar');
        Route::post('/solicitudes/{solicitud}/rechazar', [JefaturaController::class, 'rechazar'])->name('solicitudes.rechazar');
        Route::get('/proveedores', [JefaturaController::class, 'proveedores'])->name('proveedores');
    });

    // Módulo de Contabilidad y Finanzas
    Route::prefix('contabilidad')->name('contabilidad.')->group(function () {
        Route::get('/dashboard', [ContabilidadController::class, 'dashboard'])->name('dashboard');
        Route::get('/solicitudes', [ContabilidadController::class, 'solicitudes'])->name('solicitudes');
        Route::post('/solicitudes/{solicitud}/procesar-pago', [ContabilidadController::class, 'procesarPago'])->name('solicitudes.procesar-pago');
        Route::post('/solicitudes/{solicitud}/observar', [ContabilidadController::class, 'observarSolicitud'])->name('solicitudes.observar');
        Route::get('/proveedores', [ContabilidadController::class, 'proveedores'])->name('proveedores');
    });

    // Solicitudes CRUD & Workflow
    Route::get('/solicitudes', [SolicitudController::class, 'index'])->name('solicitudes.index');
    Route::post('/solicitudes', [SolicitudController::class, 'store'])->name('solicitudes.store');
    Route::post('/solicitudes/{solicitud}', [SolicitudController::class, 'update'])->name('solicitudes.update');
    Route::post('/solicitudes/{solicitud}/cambiar-estado', [SolicitudController::class, 'cambiarEstado'])->name('solicitudes.cambiar-estado');
    Route::delete('/solicitudes/{solicitud}', [SolicitudController::class, 'destroy'])->name('solicitudes.destroy');

    // Usuarios CRUD
    Route::get('/usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
    Route::post('/usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
    Route::put('/usuarios/{usuario}', [UsuarioController::class, 'update'])->name('usuarios.update');
    Route::delete('/usuarios/{usuario}', [UsuarioController::class, 'destroy'])->name('usuarios.destroy');

    // Proveedores CRUD
    Route::get('/proveedores', [ProveedorController::class, 'index'])->name('proveedores.index');
    Route::post('/proveedores', [ProveedorController::class, 'store'])->name('proveedores.store');
    Route::put('/proveedores/{proveedor}', [ProveedorController::class, 'update'])->name('proveedores.update');
    Route::delete('/proveedores/{proveedor}', [ProveedorController::class, 'destroy'])->name('proveedores.destroy');

    // Empresas CRUD
    Route::get('/empresas', [EmpresaController::class, 'index'])->name('empresas.index');
    Route::post('/empresas', [EmpresaController::class, 'store'])->name('empresas.store');
    Route::put('/empresas/{empresa}', [EmpresaController::class, 'update'])->name('empresas.update');
    Route::delete('/empresas/{empresa}', [EmpresaController::class, 'destroy'])->name('empresas.destroy');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
