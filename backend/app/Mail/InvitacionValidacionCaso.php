<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InvitacionValidacionCaso extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $url, public string $tipoCaso, public ?string $respuestaRevisor = null)
    {
    }

    public function build(): self
    {
        return $this->subject('Solicitud de validacion de caso')
            ->view('emails.validacion.invitacion');
    }
}