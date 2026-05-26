<?php
require_once BASE_PATH . '/core/Database.php';
 
class Usuario {
    public static function registrar($datos) {
    $db = Database::conectar();

    // Verificar duplicados
    $stmt = $db->prepare("SELECT id_usuario FROM Usuario WHERE nombre_usuario = ? OR cc = ?");
    $stmt->execute([$datos['nombre_usuario'], $datos['cc']]);
        if ($stmt->fetch()) {
            return ["success" => false, "mensaje" => "El usuario o cédula ya está registrado"];
        }

        $hash = password_hash($datos['contrasena'], PASSWORD_DEFAULT);

        $stmt = $db->prepare("
            INSERT INTO Usuario 
                (cc, nombres, apellidos, nombre_usuario, contrasena, correo, telefono, genero, direccion, fecha_nacimiento, fecha_registro, cargo)
            VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $ok = $stmt->execute([
            $datos['cc'],
            $datos['nombres'],
            $datos['apellidos'],
            $datos['nombre_usuario'],
            $hash,
            $datos['correo'],
            $datos['telefono'],
            $datos['genero'],
            $datos['direccion'],
            $datos['fecha_nacimiento'],
            $datos['fecha_registro'],
            $datos['cargo'],
        ]);
    
        if ($ok) {
            return ["success" => true, "mensaje" => "Usuario registrado correctamente"];
        } else {
            return ["success" => false, "mensaje" => "Error al guardar en base de datos"];
        }
    }
 
    public static function login($nombre_usuario, $contrasena) {
        $db = Database::conectar();
 
        $stmt = $db->prepare("SELECT * FROM Usuario WHERE nombre_usuario=?");
        $stmt->execute([$nombre_usuario]);
 
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
 
        if ($user && password_verify($contrasena, $user['contrasena'])) { // Verifica la contraseña contra el hash
            return $user;
        }
        return false;
    }
}
?>