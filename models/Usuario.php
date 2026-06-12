<?php
require_once BASE_PATH . '/core/Database.php';
 
class Usuario {

    public static function listar() {
        return Database::conectar()
            ->query("SELECT * FROM Usuario ORDER BY id_usuario DESC")
            ->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function obtenerPorId($id) {
        $stmt = Database::conectar()->prepare("SELECT * FROM Usuario WHERE id_usuario = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

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
                (cc, nombres, apellidos, nombre_usuario, contrasena, correo, telefono, genero, direccion, fecha_nacimiento, fecha_registro, cargo, estado)
            VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Activo')
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

    public static function actualizar($id, $datos) {
        $db = Database::conectar();
        
        // Si viene contraseña, se hashea. Si no, se mantiene la anterior.
        $sql = "UPDATE Usuario SET 
                    cc = ?, nombres = ?, apellidos = ?, correo = ?, 
                    telefono = ?, genero = ?, direccion = ?, 
                    fecha_nacimiento = ?, cargo = ?, estado = ?";
        $params = [
            $datos['cc'], $datos['nombres'], $datos['apellidos'], $datos['correo'],
            $datos['telefono'], $datos['genero'], $datos['direccion'],
            $datos['fecha_nacimiento'], $datos['cargo'], $datos['estado']
        ];

        if (!empty($datos['contrasena'])) {
            $sql .= ", contrasena = ?";
            $params[] = password_hash($datos['contrasena'], PASSWORD_DEFAULT);
        }

        $sql .= " WHERE id_usuario = ?";
        $params[] = $id;

        $stmt = $db->prepare($sql);
        $ok = $stmt->execute($params);

        return ["success" => $ok, "mensaje" => $ok ? "Usuario actualizado" : "Error al actualizar"];
    }

    public static function eliminar($id) {
        // En lugar de borrar físicamente, cambiamos el estado a Inactivo
        $stmt = Database::conectar()->prepare("UPDATE Usuario SET estado = 'Inactivo' WHERE id_usuario = ?");
        $ok = $stmt->execute([$id]);
        return ["success" => $ok, "mensaje" => $ok ? "Usuario desactivado" : "Error al desactivar"];
    }

    public static function reactivar($id) {
        $stmt = Database::conectar()->prepare("UPDATE Usuario SET estado = 'Activo' WHERE id_usuario = ?");
        $ok = $stmt->execute([$id]);
        return ["success" => $ok, "mensaje" => $ok ? "Usuario reactivado" : "Error al reactivar"];
    }
 
    public static function login($nombre_usuario, $contrasena) {
        $db = Database::conectar();
 
        $stmt = $db->prepare("SELECT * FROM Usuario WHERE nombre_usuario=? AND estado = 'Activo'");
        $stmt->execute([$nombre_usuario]);
 
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
 
        if ($user && password_verify($contrasena, $user['contrasena'])) {
            return $user;
        }
        return false;
    }
}
?>
