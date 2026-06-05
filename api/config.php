<?php

//Permitir conexion desde app movil
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

//JSON siempre
header("Content-Type: application/json");

//Ruta base del proyecto
define('BASE_PATH', dirname(__DIR__));
require BASE_PATH . '/core/Database.php';
?>