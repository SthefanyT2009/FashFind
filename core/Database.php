<?php
class Database {
    private static $conexion;

    public static function conectar() {
        if (!self::$conexion) {
            $config = require BASE_PATH . '/config/database.php';

            self::$conexion = new PDO(
                "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8",
                $config['user'],
                $config['pass'],
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
        }
        return self::$conexion;
    }
}
?>