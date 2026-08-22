<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use App\Models\User;
use App\Models\Empresa;
use App\Models\Proveedor;
use App\Models\Solicitud;
use ZipArchive;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles
        $rolAdmin = Role::firstOrCreate(['nombre' => 'Administrador'], ['descripcion' => 'Acceso total al sistema y gestión completa']);
        $rolJefe = Role::firstOrCreate(['nombre' => 'Jefe'], ['descripcion' => 'Revisión y aprobación de solicitudes de su área']);
        $rolConta = Role::firstOrCreate(['nombre' => 'Contabilidad'], ['descripcion' => 'Procesamiento de pagos y desembolsos']);
        $rolSolicitante = Role::firstOrCreate(['nombre' => 'Solicitante'], ['descripcion' => 'Creación y seguimiento de solicitudes de pago']);
        $rolCajaChica = Role::firstOrCreate(['nombre' => 'Caja Chica'], ['descripcion' => 'Gestión y desembolso exclusivo de solicitudes de Caja Chica']);

        $rolesDb = [
            'Administrador' => $rolAdmin->id,
            'Jefe' => $rolJefe->id,
            'Contabilidad' => $rolConta->id,
            'Solicitante' => $rolSolicitante->id,
            'Caja Chica' => $rolCajaChica->id,
        ];

        // 2. Empresas
        $emp1 = Empresa::firstOrCreate(['nombre' => 'Fralak SRL'], ['nit' => '1029384019']);
        $emp2 = Empresa::firstOrCreate(['nombre' => 'Dotmed SRL'], ['nit' => '2049382011']);
        $emp3 = Empresa::firstOrCreate(['nombre' => 'CID SRL'], ['nit' => '3059281015']);

        // 3. Usuario Administrador
        $admin = User::updateOrCreate(
            ['correo' => 'admin@sistema.com'],
            [
                'rol_id' => $rolAdmin->id,
                'nombre' => 'Admin',
                'apellidos' => 'Sistema',
                'password' => Hash::make('123456'),
            ]
        );

        // 4. Importar o Sembrar Usuarios del Excel LISTA_USUARIOS.xlsx
        $excelPath = base_path('LISTA_USUARIOS.xlsx');
        if (file_exists($excelPath)) {
            $zip = new ZipArchive();
            if ($zip->open($excelPath) === TRUE) {
                $sharedStrings = [];
                $sharedStringsXml = $zip->getFromName('xl/sharedStrings.xml');
                if ($sharedStringsXml) {
                    $xml = simplexml_load_string($sharedStringsXml);
                    foreach ($xml->si as $val) {
                        if (isset($val->t)) {
                            $sharedStrings[] = (string)$val->t;
                        } elseif (isset($val->r)) {
                            $text = '';
                            foreach ($val->r as $r) {
                                $text .= (string)$r->t;
                            }
                            $sharedStrings[] = $text;
                        } else {
                            $sharedStrings[] = '';
                        }
                    }
                }

                $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
                if ($sheetXml) {
                    $xml = simplexml_load_string($sheetXml);
                    $rows = [];
                    foreach ($xml->sheetData->row as $row) {
                        $rowNum = (int)$row['r'];
                        $rowData = [];
                        foreach ($row->c as $c) {
                            $cellRef = (string)$c['r'];
                            $col = preg_replace('/[0-9]/', '', $cellRef);
                            $type = (string)$c['t'];
                            $val = (string)$c->v;
                            if ($type === 's') {
                                $val = $sharedStrings[(int)$val] ?? '';
                            }
                            $rowData[$col] = trim(str_replace(';', '', $val));
                        }
                        $rows[$rowNum] = $rowData;
                    }

                    $currentCompany = null;
                    $usersMap = [];

                    foreach ($rows as $num => $r) {
                        $colA = $r['A'] ?? '';
                        if (strtoupper($colA) === 'FRALAK') { $currentCompany = 'Fralak SRL'; continue; }
                        if (strtoupper($colA) === 'DOTMED') { $currentCompany = 'Dotmed SRL'; continue; }
                        if (strtoupper($colA) === 'CID') { $currentCompany = 'CID SRL'; continue; }
                        if ($colA === 'Nombres' || empty($colA)) continue;

                        $nombres = trim($r['A'] ?? '');
                        $apellidos = trim($r['B'] ?? '');
                        $correo = trim($r['C'] ?? '');
                        $password = trim($r['D'] ?? '');
                        $rol = trim($r['E'] ?? '');

                        $cargo = trim($r['F'] ?? '');

                        $normKey = mb_strtolower(trim(preg_replace('/\s+/', ' ', "{$nombres} {$apellidos}")));
                        if (strpos($normKey, 'rolita aguirre') === 0) { $normKey = 'rolita aguirre amuruz'; $nombres = 'Rolita'; $apellidos = 'Aguirre Amuruz'; }
                        if (strpos($normKey, 'jose fernando prado') === 0) { $normKey = 'jose fernando prado san martin'; $nombres = 'Jose Fernando'; $apellidos = 'Prado San Martin'; }

                        if (!isset($usersMap[$normKey])) {
                            $usersMap[$normKey] = [
                                'nombre' => $nombres,
                                'apellidos' => $apellidos,
                                'roles' => [],
                                'passwords' => [],
                                'cargos' => [],
                                'by_company' => ['Fralak SRL' => [], 'Dotmed SRL' => [], 'CID SRL' => []]
                            ];
                        }

                        if (!empty($rol)) $usersMap[$normKey]['roles'][] = $rol;
                        if (!empty($password)) $usersMap[$normKey]['passwords'][] = $password;
                        if (!empty($cargo)) $usersMap[$normKey]['cargos'][] = $cargo;
                        if (!empty($correo) && strtolower($correo) !== 'no tiene') {
                            $usersMap[$normKey]['by_company'][$currentCompany][] = $correo;
                        }
                    }

                    $specialUsers = [
                        'leandro agustin montealegre corcuy' => [
                            'login' => 'leandro.montealegre@fralak.com.bo',
                            'password' => '651419Fralak',
                            'rol' => 'Jefe',
                            'cargo' => 'Jefe Nacional de Ventas'
                        ],
                        'carmen vannessa ortega almendras' => [
                            'login' => 'administracion@fralak.com.bo',
                            'password' => '123456',
                            'rol' => 'Contabilidad',
                            'cargo' => 'Contadora'
                        ],
                        'brandon hurtado sanchez' => [
                            'login' => 'sistemas@fralak.com.bo',
                            'password' => 'v58PAxFVT7yK',
                            'rol' => 'Solicitante',
                            'cargo' => 'Asistente de Sistemas'
                        ],
                        'maribel caero agreda' => [
                            'login' => 'regente.scz@fralak.com.bo',
                            'password' => 'Fralak1155$',
                            'rol' => 'Caja Chica',
                            'cargo' => 'Regente Farmacéutico / Encargada Caja Chica',
                            'only_fralak' => true,
                        ]
                    ];

                    $usedLoginEmails = ['admin@sistema.com'];

                    foreach ($usersMap as $normKey => $u) {
                        $roleName = 'Solicitante';
                        if (isset($specialUsers[$normKey])) {
                            $roleName = $specialUsers[$normKey]['rol'];
                        } elseif (in_array('Jefe', $u['roles']) || in_array('Jefatura', $u['roles'])) {
                            $roleName = 'Jefe';
                        } elseif (in_array('Caja Chica', $u['roles'])) {
                            $roleName = 'Caja Chica';
                        } elseif (in_array('Contabilidad', $u['roles'])) {
                            $roleName = 'Contabilidad';
                        }
                        $rolId = $rolesDb[$roleName] ?? 4;

                        $userCargo = null;
                        if (isset($specialUsers[$normKey]['cargo'])) {
                            $userCargo = $specialUsers[$normKey]['cargo'];
                        } elseif (!empty($u['cargos'])) {
                            $userCargo = $u['cargos'][0];
                        }

                        $rawPass = 'Fralak1155$';
                        if (isset($specialUsers[$normKey])) {
                            $rawPass = $specialUsers[$normKey]['password'];
                        } elseif (!empty($u['passwords'])) {
                            $rawPass = $u['passwords'][0];
                        }

                        $fralakEmail = !empty($u['by_company']['Fralak SRL']) ? $u['by_company']['Fralak SRL'][0] : null;
                        $dotmedEmail = !empty($u['by_company']['Dotmed SRL']) ? $u['by_company']['Dotmed SRL'][0] : null;
                        $cidEmail    = !empty($u['by_company']['CID SRL'])    ? $u['by_company']['CID SRL'][0]    : null;

                        $allCandidateEmails = [];
                        foreach (['Fralak SRL', 'Dotmed SRL', 'CID SRL'] as $comp) {
                            foreach ($u['by_company'][$comp] as $em) {
                                $allCandidateEmails[] = $em;
                            }
                        }

                        $loginEmail = null;
                        if (isset($specialUsers[$normKey])) {
                            $loginEmail = $specialUsers[$normKey]['login'];
                        } else {
                            foreach ($allCandidateEmails as $em) {
                                if (!in_array($em, $usedLoginEmails)) {
                                    $loginEmail = $em;
                                    break;
                                }
                            }

                            if (!$loginEmail) {
                                if (!empty($allCandidateEmails)) {
                                    $loginEmail = $allCandidateEmails[0];
                                } else {
                                    $slug = strtolower(str_replace(' ', '.', trim($u['nombre'] . ' ' . $u['apellidos'])));
                                    $loginEmail = "{$slug}@fralak.com.bo";
                                }
                            }
                        }

                        $usedLoginEmails[] = $loginEmail;

                        $user = User::updateOrCreate(
                            ['correo' => $loginEmail],
                            [
                                'rol_id' => $rolId,
                                'nombre' => $u['nombre'],
                                'apellidos' => $u['apellidos'],
                                'cargo' => $userCargo,
                                'password' => Hash::make($rawPass),
                            ]
                        );

                        $syncData = [];
                        if (isset($specialUsers[$normKey]['only_fralak']) && $specialUsers[$normKey]['only_fralak']) {
                            // Usuario exclusivo de Fralak SRL (ej: Caja Chica Maribel)
                            $syncData[$emp1->id] = ['correo_corporativo' => $loginEmail];
                        } else {
                            if (!empty($fralakEmail)) $syncData[$emp1->id] = ['correo_corporativo' => $fralakEmail];
                            if (!empty($dotmedEmail)) $syncData[$emp2->id] = ['correo_corporativo' => $dotmedEmail];
                            if (!empty($cidEmail))    $syncData[$emp3->id] = ['correo_corporativo' => $cidEmail];
                        }

                        $user->empresas()->sync($syncData);
                    }
                }
                $zip->close();
            }
        }

        // 5. Proveedores Demo
        $prov1 = Proveedor::firstOrCreate(
            ['nit_ci' => '1029384019'],
            [
                'creado_por_usuario_id' => $admin->id,
                'nombre_razon_social' => 'TechSolutions Bolivia S.R.L.',
                'banco' => 'Banco Nacional de Bolivia',
                'tipo_cuenta' => 'Cuenta Corriente',
                'numero_cuenta' => '1000-2938472-01',
                'nombre_titular_cuenta' => 'TechSolutions Bolivia S.R.L.',
            ]
        );

        $prov2 = Proveedor::firstOrCreate(
            ['nit_ci' => '987654321'],
            [
                'creado_por_usuario_id' => $admin->id,
                'nombre_razon_social' => 'Servicios Médicos e Insumos Dotmed',
                'banco' => 'Banco Mercantil Santa Cruz',
                'tipo_cuenta' => 'Caja de Ahorro',
                'numero_cuenta' => '4059-192837-12',
                'nombre_titular_cuenta' => 'Juan Pedro Morales',
            ]
        );

        $prov3 = Proveedor::firstOrCreate(
            ['nit_ci' => '456789123'],
            [
                'creado_por_usuario_id' => $admin->id,
                'nombre_razon_social' => 'Comercializadora e Importadora CID',
                'banco' => 'Banco Económico',
                'tipo_cuenta' => 'Cuenta Corriente',
                'numero_cuenta' => '2001-987654-05',
                'nombre_titular_cuenta' => 'Comercializadora CID S.R.L.',
            ]
        );
    }
}
