<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected $apiToken;
    protected $from;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiToken = config('services.bulksmsnigeria.token');
        $this->from = config('services.bulksmsnigeria.from', 'SCHOOL');
        $this->baseUrl = config('services.bulksmsnigeria.base_url', 'https://www.bulksmsnigeria.com/api/v2/sms');
    }

    /**
     * Send SMS via BulkSMS Nigeria
     *
     * @param string|array $to Single number or array of numbers
     * @param string $message
     * @return array
     */
    public function send($to, string $message): array
    {
        if (is_array($to)) {
            $to = implode(',', $to);
        }

        // Normalize phone number: remove spaces
        $to = str_replace(' ', '', $to);
        // Convert 0xx (11 digits) to 234xx
        $to = preg_replace('/^0(\d{10})$/', '234$1', $to);
        // Strip leading + if present
        $to = ltrim($to, '+');

        if (empty($this->apiToken)) {
            Log::warning('SMS attempted but no API Token found in config.');
            return ['success' => false, 'message' => 'API Token not configured.'];
        }

        try {
            $response = Http::withHeaders([
                    'Accept'        => 'application/json',
                    'Authorization' => 'Bearer ' . $this->apiToken,
                ])
                ->post($this->baseUrl, [
                    'from' => $this->from,
                    'to'   => $to,
                    'body' => $message,
                    'dnd'  => 2,
                ]);

            $json = $response->json();

            if ($response->successful()) {
                Log::info('SMS sent successfully', ['to' => $to, 'response' => $json]);
                return ['success' => true, 'data' => $json];
            }

            Log::error('SMS Sending Failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
                'to'     => $to,
            ]);

            return [
                'success' => false,
                'message' => $json['error']['message'] ?? $json['message'] ?? ('Provider error: ' . $response->status()),
            ];

        } catch (\Exception $e) {
            Log::error('SMS Service Exception: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Service exception: ' . $e->getMessage()];
        }
    }
}