<?php

namespace App\Mail\Transport;

use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mime\MessageConverter;
use Symfony\Component\Mime\Email;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ZohoMailTransport extends AbstractTransport
{
    protected string $clientId;
    protected string $clientSecret;
    protected string $refreshToken;
    protected string $accountId;
    protected string $apiDomain;

    public function __construct(array $config = [])
    {
        parent::__construct();
        $this->clientId = $config['client_id'] ?? env('ZOHO_CLIENT_ID', '1000.RM6T2D50KLYXR9CWDDZFKUUYI3FFOD');
        $this->clientSecret = $config['client_secret'] ?? env('ZOHO_CLIENT_SECRET', 'e78fba230a3a5ea68bf2297125bebe287b2123df21');
        $this->refreshToken = $config['refresh_token'] ?? env('ZOHO_REFRESH_TOKEN', '1000.11453557c2ef9b3b7619d4b416bbdea0.233660f47fd9bde338b2d469b1b964eb');
        $this->accountId = $config['account_id'] ?? env('ZOHO_ACCOUNT_ID', '4064114000000008002');
        $this->apiDomain = $config['api_domain'] ?? env('ZOHO_API_DOMAIN', 'https://mail.zoho.com');
    }

    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());
        
        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            throw new \Exception("No se pudo obtener access_token de Zoho Mail API");
        }

        $fromAddress = '';
        foreach ($email->getFrom() as $address) {
            $fromAddress = $address->getAddress();
            break;
        }
        if (empty($fromAddress)) {
            $fromAddress = config('mail.from.address', 'sistemas@fralak.com.bo');
        }

        $toAddresses = [];
        foreach ($email->getTo() as $address) {
            $toAddresses[] = $address->getAddress();
        }

        $ccAddresses = [];
        foreach ($email->getCc() as $address) {
            $ccAddresses[] = $address->getAddress();
        }

        $bccAddresses = [];
        foreach ($email->getBcc() as $address) {
            $bccAddresses[] = $address->getAddress();
        }

        $replyTo = '';
        foreach ($email->getReplyTo() as $address) {
            $replyTo = $address->getAddress();
            break;
        }

        $subject = $email->getSubject() ?: '(Sin Asunto)';
        $htmlContent = $email->getHtmlBody();
        $textContent = $email->getTextBody();
        $content = $htmlContent ?: $textContent ?: '';

        // Construir payload
        $payload = [
            'fromAddress' => $fromAddress,
            'toAddress' => implode(',', array_filter($toAddresses)),
            'subject' => $subject,
            'content' => $content,
            'mailFormat' => $htmlContent ? 'html' : 'plaintext',
        ];

        if (!empty($ccAddresses)) {
            $payload['ccAddress'] = implode(',', array_filter($ccAddresses));
        }
        if (!empty($bccAddresses)) {
            $payload['bccAddress'] = implode(',', array_filter($bccAddresses));
        }
        if (!empty($replyTo)) {
            $payload['replyTo'] = $replyTo;
        }

        // Manejo de adjuntos si existen
        $attachments = $email->getAttachments();
        if (!empty($attachments)) {
            $parts = [];
            foreach ($attachments as $att) {
                $body = $att->getBody();
                $filename = $att->getFilename() ?: 'adjunto';
                $parts[] = [
                    'storeName' => $filename,
                    'attachmentPath' => '',
                    'content' => base64_encode($body),
                ];
            }
            if (!empty($parts)) {
                $payload['attachments'] = $parts;
            }
        }

        $url = rtrim($this->apiDomain, '/') . "/api/accounts/{$this->accountId}/messages";

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Zoho-oauthtoken ' . $accessToken,
            'Content-Type: application/json',
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode < 200 || $httpCode >= 300) {
            Log::error("Error enviando correo via Zoho Mail API: HTTP $httpCode - $response ($error)");
            throw new \Exception("Zoho Mail API Error (HTTP $httpCode): " . ($response ?: $error));
        }

        Log::info("Correo enviado exitosamente via Zoho Mail API a: " . $payload['toAddress']);
    }

    public function getAccessToken(): ?string
    {
        return Cache::remember('zoho_mail_api_access_token', 3300, function () {
            $ch = curl_init('https://accounts.zoho.com/oauth/v2/token');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                'grant_type' => 'refresh_token',
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'refresh_token' => $this->refreshToken,
            ]));
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $res = curl_exec($ch);
            curl_close($ch);

            $data = json_decode($res, true);
            return $data['access_token'] ?? null;
        });
    }

    public function __toString(): string
    {
        return 'zoho';
    }
}
