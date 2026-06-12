<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'config.php';
require BASE_PATH . '/models/Usuario.php';

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$action = $_GET['action'] ?? null;
$cargo  = $_GET['cargo'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $user = Usuario::obtenerPorId($id);
            if ($user) {
                echo json_encode(["success" => true, "data" => $user]);
            } else {
                http_response_code(404);
                echo json_encode(["success" => false, "mensaje" => "Usuario no encontrado"]);
            }
        } else if ($cargo) {
            $db = Database::conectar();
            $stmt = $db->prepare("SELECT id_usuario, cc, nombres, apellidos, cargo FROM Usuario WHERE cargo = ? AND estado = 'Activo' ORDER BY nombres");
            $stmt->execute([$cargo]);
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $users]);
        } else {
            $users = Usuario::listar();
            echo json_encode(["success" => true, "data" => $users]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $res = Usuario::registrar($data);
        if (!$res['success']) http_response_code(400);
        echo json_encode($res);
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "mensaje" => "ID requerido"]);
            exit;
        }

        if ($action === 'eliminar') {
            echo json_encode(Usuario::eliminar($id));
            exit;
        }

        if ($action === 'reactivar') {
            echo json_encode(Usuario::reactivar($id));
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode(Usuario::actualizar($id, $data));
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "mensaje" => "Método no permitido"]);
        break;
}
?>
