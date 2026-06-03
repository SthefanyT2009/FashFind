<?php
class AuthMiddleware {

public static function verificarSesion() {
    if(session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (!isset($_SESSION['usuario'])) {
        header("Location: index.php?route=login");
        exit;
    }
}

public static function soloAdmin() {
    self::verificarSesion();
    if ($_SESSION['usuario']['cargo'] !== 'Administrador') {
        echo "<h3>Acceso denegado</h3>";
        exit;
    }
}
}
?>