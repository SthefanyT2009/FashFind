<?php
require 'config.php';
require BASE_PATH . '/models/Usuario.php';

$data = json_decode(file_get_contents("php://input"), true);

$requeridos = ['cc', 'nombres', 'apellidos', 'nombre_usuario', 'contrasena', 'correo', 'telefono', 'genero', 'direccion', 'fecha_nacimiento'];

foreach ($requeridos as $campo) {
    if (!isset($data[$campo]) || trim((string)$data[$campo]) === '') {
        echo json_encode([
            "success" => false,
            "mensaje" => "El campo '$campo' es obligatorio"
        ]);
        exit;
    }
}

$resultado = Usuario::registrar([
    'cc'               => (int)$data['cc'],
    'nombres'          => $data['nombres'],
    'apellidos'        => $data['apellidos'],
    'nombre_usuario'   => $data['nombre_usuario'],
    'contrasena'       => $data['contrasena'],
    'correo'           => $data['correo'],
    'telefono'         => (int)$data['telefono'],
    'genero'           => $data['genero'],
    'direccion'        => $data['direccion'],
    'fecha_nacimiento' => $data['fecha_nacimiento'],
    'fecha_registro'   => date('Y-m-d'),
    'cargo'            => 'Cliente',
]);

echo json_encode($resultado);
?>