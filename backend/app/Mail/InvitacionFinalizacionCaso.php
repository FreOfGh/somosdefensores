<?php

namespace App\Mail;

use Carbon\CarbonInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitacionFinalizacionCaso extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $url,
        public CarbonInterface $expiresAt,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Formulario de finalizacion de caso');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.finalizacion.invitacion');
    }
}