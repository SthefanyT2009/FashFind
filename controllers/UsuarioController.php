<?php
require_once BASE_PATH . '/models/Usuario.php';
require_once BASE_PATH . '/core/AuthMiddleware.php';

class UsuarioController {

    public function listar() {
        AuthMiddleware::soloAdmin();
        $usuarios = Usuario::listar();
        require BASE_PATH . '/views/Interfaz/vistaAdministrador.php'; // O una vista específica de usuarios
    }

    public function crear() {
        AuthMiddleware::soloAdmin();
        if ($_POST) {
            $datos = [
                'cc' => $_POST['cc'],
                'nombres' => $_POST['nombres'],
                'apellidos' => $_POST['apellidos'],
                'nombre_usuario' => $_POST['nombre_usuario'],
                'contrasena' => $_POST['contrasena'],
                'correo' => $_POST['correo'],
                'telefono' => $_POST['telefono'],
                'genero' => $_POST['genero'],
                'direccion' => $_POST['direccion'],
                'fecha_nacimiento' => $_POST['fecha_nacimiento'],
                'fecha_registro' => date('Y-m-d'),
                'cargo' => $_POST['cargo']
            ];
            $res = Usuario::registrar($datos);
            if ($res['success']) {
                header("Location: index.php?route=usuarios");
            } else {
                $error = $res['mensaje'];
                require BASE_PATH . '/views/Registros/registroUsuarios.html';
            }
            exit;
        }
        require BASE_PATH . '/views/Registros/registroUsuarios.html';
    }

    public function editar() {
        AuthMiddleware::soloAdmin();
        $id = $_GET['id'];
        $usuario = Usuario::obtenerPorId($id);

        if ($_POST) {
            $datos = [
                'cc' => $_POST['cc'],
                'nombres' => $_POST['nombres'],
                'apellidos' => $_POST['apellidos'],
                'correo' => $_POST['correo'],
                'telefono' => $_POST['telefono'],
                'genero' => $_POST['genero'],
                'direccion' => $_POST['direccion'],
                'fecha_nacimiento' => $_POST['fecha_nacimiento'],
                'cargo' => $_POST['cargo'],
                'estado' => $_POST['estado'],
                'contrasena' => $_POST['contrasena'] // Opcional
            ];
            $res = Usuario::actualizar($id, $datos);
            header("Location: index.php?route=usuarios");
            exit;
        }
        require BASE_PATH . '/views/Actualizaciones/editarUsuarios.html';
    }

    public function eliminar() {
        AuthMiddleware::soloAdmin();
        Usuario::eliminar($_GET['id']);
        header("Location: index.php?route=usuarios");
        exit;
    }

    public function reactivar() {
        AuthMiddleware::soloAdmin();
        Usuario::reactivar($_GET['id']);
        header("Location: index.php?route=usuarios");
        exit;
    }
}
?>
