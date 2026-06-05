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
require BASE_PATH . '/controllers/PedidoController.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($method) {

    // GET: listar todos o uno por ID
    case 'GET':
        if ($id) {
            $db = Database::conectar();
            $stmt = $db->prepare("
                SELECT p.*, u.nombres, u.apellidos
                FROM Pedido p
                INNER JOIN Usuario u ON p.id_usuario = u.id_usuario
                WHERE p.id_pedido = ?
            ");
            $stmt->execute([$id]);
            $pedido = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$pedido) {
                http_response_code(404);
                echo json_encode(["success" => false, "mensaje" => "Pedido no encontrado"]);
                exit;
            }

            $stmtD = $db->prepare("
                SELECT dp.*, pr.nombre_producto, pr.talla, pr.color
                FROM Detalle_Pedido dp
                INNER JOIN Producto pr ON dp.id_producto = pr.id_producto
                WHERE dp.id_pedido = ?
            ");
            $stmtD->execute([$id]);
            $pedido['detalles'] = $stmtD->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["success" => true, "data" => $pedido]);
        } else {
            $resultado = PedidoController::listar();
            echo json_encode(["success" => true, "data" => $resultado['pedidos']]);
        }
        break;

    // POST: crear pedido
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        $requeridos = ['metodo_pago', 'costo_envio', 'tipo_entrega',
                       'direccion_entrega', 'ciudad_entrega',
                       'telefono_contacto', 'fecha_entrega',
                       'estado', 'id_usuario', 'productos'];

        foreach ($requeridos as $campo) {
            if (!isset($data[$campo])) {
                http_response_code(400);
                echo json_encode(["success" => false, "mensaje" => "Campo requerido: $campo"]);
                exit;
            }
        }

        if (empty($data['productos'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "mensaje" => "El pedido debe tener al menos un producto"]);
            exit;
        }

        $resultado = PedidoController::crear($data);
        http_response_code($resultado['success'] ? 201 : 500);
        echo json_encode($resultado);
        break;

    // PUT: actualizar / cancelar / reactivar / entregar
    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "mensaje" => "ID requerido"]);
            exit;
        }

        // ── ACCIÓN RÁPIDA: CANCELAR ──
        if ($action === 'cancelar') {
            $ok = PedidoController::cancelar($id);
            echo json_encode(["success" => $ok['success'], "mensaje" => "Pedido cancelado correctamente"]);
            exit;
        }

        // ── ACCIÓN RÁPIDA: REACTIVAR ──
        if ($action === 'reactivar') {
            $ok = PedidoController::reactivar($id);
            echo json_encode(["success" => $ok['success'], "mensaje" => "Pedido reactivado correctamente"]);
            exit;
        }

        // ── ACCIÓN RÁPIDA: ENTREGAR ──
        if ($action === 'entregar') {
            $ok = PedidoController::entregar($id);
            echo json_encode(["success" => $ok['success'], "mensaje" => "Pedido entregado correctamente"]);
            exit;
        }

        // ── ACTUALIZACIÓN COMPLETA (sin action) ──
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(["success" => false, "mensaje" => "Datos inválidos"]);
            exit;
        }

        $data['id_pedido'] = $id;
        $resultado = PedidoController::actualizar($data);
        
        if ($resultado['success']) {
            echo json_encode(["success" => true, "mensaje" => "Pedido actualizado correctamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "mensaje" => "Error al actualizar el pedido"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "mensaje" => "Método no permitido"]);
        break;
}
?>
