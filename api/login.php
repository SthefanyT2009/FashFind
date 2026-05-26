<?php
require 'config.php';
require BASE_PATH . '/models/Usuario.php';

//Leer datos JSON desde React Native
$data = json_decode(file_get_contents("php://input"), true);

//Validar datos
if (!$data || !isset($data['nombre_usuario']) || !isset($data['contrasena'])) {
    echo json_encode([
        "success" => false,
        "mensaje" => "Datos incompletos"
    ]);
    exit;
}

//Intentar Login
$user = Usuario::login($data['nombre_usuario'], $data['contrasena']);

if ($user) {
    echo json_encode([
        "success" => true,
        "usuario" => [
            "id"             => $user['id_usuario'],
            "nombre_usuario" => $user['nombre_usuario'],  
            "cargo"          => $user['cargo'],
            "nombres"        => $user['nombres'],          
            "apellidos"      => $user['apellidos'],       
        ]
    ]);
} else {
    echo json_encode([
        "success" => false,
        "mensaje" => "Credenciales incorrectas"
    ]);
}

?>