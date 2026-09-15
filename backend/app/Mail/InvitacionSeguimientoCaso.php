<?php

namespace App\Mail;

use Carbon\CarbonInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitacionSeguimientoCaso extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $url,
        public CarbonInterface $expiresAt,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Formulario de seguimiento de caso');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.seguimiento.invitacion');
    }
}
