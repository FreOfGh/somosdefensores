<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\admin\casos;
Route::get('/', function () {
    return view('welcome');
});

//crear caso
use Illuminate\Support\Facades\Mail;
use App\Mail\TestMail;

Route::get('/test-email', function () {

    Mail::to('sitorress@unal.edu.co')
        ->send(new TestMail());

    return 'Correo enviado correctamente';
});