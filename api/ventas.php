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

$db     = Database::conectar();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($method) {

    // GET: listar todas o una por ID 
    case 'GET':

        if ($id) {
            $stmt = $db->prepare("
                SELECT v.*, u.nombres, u.apellidos
                FROM Venta v
                INNER JOIN Usuario u ON v.id_usuario = u.id_usuario
                WHERE v.id_venta = ?
            ");
            $stmt->execute([$id]);
            $venta = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$venta) {
                http_response_code(404);
                echo json_encode(["success" => false, "mensaje" => "Venta no encontrada"]);
                exit;
            }

            $stmtD = $db->prepare("
                SELECT dv.*, p.nombre_producto, p.talla, p.color
                FROM Detalle_Venta dv
                INNER JOIN Producto p ON dv.id_producto = p.id_producto
                WHERE dv.id_venta = ?
            ");
            $stmtD->execute([$id]);
            $venta['detalles'] = $stmtD->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["success" => true, "data" => $venta]);

        } else {
            $ventas = $db->query("
                SELECT v.*, u.nombres, u.apellidos
                FROM Venta v
                INNER JOIN Usuario u ON v.id_usuario = u.id_usuario
                ORDER BY v.id_venta DESC
            ")->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["success" => true, "data" => $ventas]);
        }
        break;

    // POST: crear venta con detalles 
    case 'POST':

        $data = json_decode(file_get_contents("php://input"), true);

        $requeridos = ['fecha_venta','hora','metodo_pago','costo_total',
                       'pago_recibido','cambio','id_usuario','detalles'];

        foreach ($requeridos as $campo) {
            if (!isset($data[$campo])) {
                http_response_code(400);
                echo json_encode(["success" => false, "mensaje" => "Campo requerido: $campo"]);
                exit;
            }
        }

        if (empty($data['detalles'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "mensaje" => "La venta debe tener al menos un producto"]);
            exit;
        }

        try {
            $db->beginTransaction();

            $stmt = $db->prepare("
                INSERT INTO Venta (fecha_venta, hora, metodo_pago, costo_total,
                                   pago_recibido, cambio, estado, id_usuario)
                VALUES (?, ?, ?, ?, ?, ?, 'Activo', ?)
            ");
            $stmt->execute([
                $data['fecha_venta'],
                $data['hora'],
                $data['metodo_pago'],
                $data['costo_total'],
                $data['pago_recibido'],
                $data['cambio'],
                $data['id_usuario']
            ]);
            $id_venta = $db->lastInsertId();

            $stmtDet   = $db->prepare("
                INSERT INTO Detalle_Venta (cantidad, precio, sub_total, id_venta, id_producto)
                VALUES (?, ?, ?, ?, ?)
            ");
            foreach ($data['detalles'] as $d) {
                $sub_total = $d['cantidad'] * $d['precio'];
                $stmtDet->execute([$d['cantidad'], $d['precio'], $sub_total, $id_venta, $d['id_producto']]);
            }

            $db->commit();
            http_response_code(201);
            echo json_encode(["success" => true, "mensaje" => "Venta registrada correctamente", "id_venta" => $id_venta]);

        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "mensaje" => "Error al registrar la venta: " . $e->getMessage()]);
        }
        break;

    // PUT: actualizar / eliminar (Inactivo) / reactivar (Activo) 
    case 'PUT':

        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "mensaje" => "ID requerido"]);
            exit;
        }

        if ($action === 'eliminar') {
            require_once BASE_PATH . '/models/Venta.php';
            $resultado = Venta::eliminar($id);
            if ($resultado) {
                echo json_encode(["success" => true, "mensaje" => "Venta desactivada correctamente y stock devuelto"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "mensaje" => "Error al desactivar la venta"]);
            }
            exit;
        }

        if ($action === 'reactivar') {
            require_once BASE_PATH . '/models/Venta.php';
            $resultado = Venta::reactivar($id);
            if ($resultado) {
                echo json_encode(["success" => true, "mensaje" => "Venta reactivada correctamente y stock descontado"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "mensaje" => "Error al reactivar la venta. Verifique stock y estado de productos."]);
            }
            exit;
        }

        // Sin acción: actualizar cabecera
        $data = json_decode(file_get_contents("php://input"), true);

        $requeridos = ['fecha_venta','hora','metodo_pago','costo_total','pago_recibido','cambio','id_usuario'];
        foreach ($requeridos as $campo) {
            if (!isset($data[$campo])) {
                http_response_code(400);
                echo json_encode(["success" => false, "mensaje" => "Campo requerido: $campo"]);
                exit;
            }
        }

        require_once BASE_PATH . '/models/Venta.php';
        $resultado = Venta::actualizar($id, $data);

        if ($resultado) {
            echo json_encode(["success" => true, "mensaje" => "Venta actualizada correctamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "mensaje" => "Error al actualizar la venta"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "mensaje" => "Método no permitido"]);
        break;
}
?>