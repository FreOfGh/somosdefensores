<?php

namespace App\Mail\AyudaHumanitaria;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use InvalidArgumentException;

class desembolso extends Mailable
{
    use Queueable, SerializesModels;

    public string $cedula;
    public int $numeroDesembolso;
    public string $nombreDesembolso;

    public function __construct(
        string $cedula,
        int $numeroDesembolso
    ) {
        if (!in_array($numeroDesembolso, [1, 2, 3])) {
            throw new InvalidArgumentException(
                'El número de desembolso debe ser 1, 2 o 3.'
            );
        }

        $this->cedula = $cedula;
        $this->numeroDesembolso = $numeroDesembolso;

        $this->nombreDesembolso = match ($numeroDesembolso) {
            1 => 'Primer',
            2 => 'Segundo',
            3 => 'Tercer',
        };
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "{$this->nombreDesembolso} desembolso realizado",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.desembolso.desembolso-ayuda-humanitaria',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}