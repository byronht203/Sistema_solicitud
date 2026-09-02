<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestMailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:test {to? : Correo destinatario de la prueba}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica la conexión SMTP y envía un correo de prueba';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $recipient = $this->argument('to') ?? config('mail.from.address');
        $defaultMailer = config('mail.default');

        $this->info("=========================================");
        $this->info("   DIAGNÓSTICO DE CONEXIÓN DE CORREO     ");
        $this->info("=========================================");
        $this->line("Driver Activo: " . $defaultMailer);
        if ($defaultMailer === 'zoho') {
            $this->line("Método:        Zoho Mail REST API (HTTPS / Puerto 443)");
            $this->line("Client ID:     " . config('mail.mailers.zoho.client_id'));
            $this->line("Account ID:    " . config('mail.mailers.zoho.account_id'));
        } elseif ($defaultMailer === 'smtp') {
            $this->line("Host:          " . config('mail.mailers.smtp.host'));
            $this->line("Puerto:        " . config('mail.mailers.smtp.port'));
            $this->line("Cifrado:       " . config('mail.mailers.smtp.encryption'));
            $this->line("Usuario:       " . config('mail.mailers.smtp.username'));
        }
        $this->line("Remitente:     " . config('mail.from.address'));
        $this->line("Destino:       " . $recipient);
        $this->newLine();

        $this->comment("Conectando y enviando correo de prueba...");

        try {
            Mail::raw("✅ ¡Envío de correo exitoso!\n\nEste es un correo de prueba generado desde el Sistema de Solicitudes (Fralak / Dotmed / CID) utilizando el driver [$defaultMailer].\n\nFecha y hora: " . now()->toDateTimeString(), function ($message) use ($recipient, $defaultMailer) {
                $message->to($recipient)
                        ->subject("✅ Prueba Exitosa de Correo [{$defaultMailer}] - Sistema de Solicitudes");
            });

            $this->info(">>> [ÉXITO] El correo de prueba fue enviado satisfactoriamente a: {$recipient}");
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error(">>> [ERROR] No se pudo enviar el correo.");
            $this->error("Detalle: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
