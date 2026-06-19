<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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

    // GET: listar todos o uno por ID
    case 'GET':

        if ($id) {
            $stmt = $db->prepare("
                SELECT i.*, p.nombre_producto, p.talla, p.color, p.precio
                FROM Inventario i
                INNER JOIN Producto p ON i.id_producto = p.id_producto
                WHERE i.id_inventario = ?
            ");
            $stmt->execute([$id]);
            $inventario = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$inventario) {
                http_response_code(404);
                echo json_encode(["success" => false, "mensaje" => "Inventario no encontrado"]);
                exit;
            }

            echo json_encode(["success" => true, "data" => $inventario]);

        } else {
            $inventarios = $db->query("
                SELECT i.*, p.nombre_producto, p.talla, p.color, p.precio
                FROM Inventario i
                INNER JOIN Producto p ON i.id_producto = p.id_producto
                ORDER BY i.id_inventario DESC
            ")->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["success" => true, "data" => $inventarios]);
        }
        break;

    // POST: crear registro de inventario
    case 'POST':

        $data = json_decode(file_get_contents("php://input"), true);

        $requeridos = ['stock_disponible', 'stock_minimo', 'id_producto'];

        foreach ($requeridos as $campo) {
            if (!isset($data[$campo])) {
                http_response_code(400);
                echo json_encode(["success" => false, "mensaje" => "Campo requerido: $campo"]);
                exit;
            }
        }

        try {
            $stmt = $db->prepare("
                INSERT INTO Inventario (stock_disponible, stock_minimo, id_producto)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([
                $data['stock_disponible'],
                $data['stock_minimo'],
                $data['id_producto']
            ]);

            http_response_code(201);
            echo json_encode([
                "success"       => true,
                "mensaje"       => "Inventario registrado correctamente",
                "id_inventario" => $db->lastInsertId()
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "mensaje" => "Error al registrar el inventario: " . $e->getMessage()]);
        }
        break;

    // PUT: actualizar
    case 'PUT':

        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "mensaje" => "ID requerido"]);
            exit;
        }

        // Actualizar
        $data = json_decode(file_get_contents("php://input"), true);

        $requeridos = ['stock_disponible', 'stock_minimo', 'id_producto'];
        foreach ($requeridos as $campo) {
            if (!isset($data[$campo])) {
                http_response_code(400);
                echo json_encode(["success" => false, "mensaje" => "Campo requerido: $campo"]);
                exit;
            }
        }

        $stmt = $db->prepare("
            UPDATE Inventario
            SET stock_disponible = ?,
                stock_minimo     = ?,
                id_producto      = ?
            WHERE id_inventario = ?
        ");
        $resultado = $stmt->execute([
            $data['stock_disponible'],
            $data['stock_minimo'],
            $data['id_producto'],
            $id
        ]);

        if ($resultado) {
            echo json_encode(["success" => true, "mensaje" => "Inventario actualizado correctamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "mensaje" => "Error al actualizar el inventario"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "mensaje" => "Método no permitido"]);
        break;
}
?>