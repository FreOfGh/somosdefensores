<?php

namespace App\Mail\casos;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class agregar extends Mailable
{
    use Queueable, SerializesModels;

    public string $tipo_caso;
    public string $fecha_ingreso;


    public function __construct(string $tipo_caso)
    {
        $this->tipo_caso = $tipo_caso;
        $this->fecha_ingreso = $this->obtener_fecha_actual();
    }

    private function obtener_fecha_actual()
    {
        return now()->format('d/m/Y H:i:s');
    }
    

    protected function envelope(): Envelope
    {
        return new Envelope(
            subject: ' Ingreso de caso' ,
        );
    }

    protected function content(): Content
    {
        return new Content(
            view: 'emails.casos.ingreso',
        );
    }

    protected function attachments(): array
    {
        return [];
    }
}