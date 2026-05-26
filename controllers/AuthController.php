<?php 
require_once BASE_PATH . '/models/Usuario.php';

class AuthController {

    public function login(){
        if ($_POST) {
            $user = Usuario::login($_POST['nombre_usuario'], $_POST['contrasena']);

            if ($user){
                if(session_status() === PHP_SESSION_NONE) session_start();
                $_SESSION['usuario'] = $user;

                if ($user['cargo'] === 'admin') {
                    header("Location: index.php?route=vistaAdministrador");
                } else if ($user['cargo'] === 'vendedor'){
                    header("Location: index.php?route=vistaVendedor");
                } else if ($user['cargo'] === 'domiciliario'){
                    header("Location: index.php?route=vistaDomiciliario");
                } else {
                    header("Location: index.php?route=vistaCliente.php");
                }
                exit;
            }
        }
        
        require BASE_PATH . '/views/Login/login.php';
    }

    public function registro() {
        if ($_POST) {
            Usuario::registrar($_POST['nombre_usuario'], $_POST['contrasena'], $_POST['cargo']);
            header("Location: index.php?route=registro");
            exit;
        }

        require BASE_PATH . '/views/Login/registro.php';
    }

    public function logout() {
        if(session_status() === PHP_SESSION_NONE) session_start();
        session_destroy();
        header("Location: index.php?route=login");
    }
}