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

    // GET: listar todos o uno por ID
    case 'GET':

        if ($id) {
            $stmt = $db->prepare("
                SELECT p.*, i.stock_disponible, i.stock_minimo, i.id_inventario
                FROM Producto p
                LEFT JOIN Inventario i ON p.id_producto = i.id_producto
                WHERE p.id_producto = ?
            ");
            $stmt->execute([$id]);
            $producto = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$producto) {
                http_response_code(404);
                echo json_encode(["success" => false, "mensaje" => "Producto no encontrado"]);
                exit;
            }

            echo json_encode(["success" => true, "data" => $producto]);

        } else {
            $productos = $db->query("
                SELECT p.*, i.stock_disponible, i.stock_minimo
                FROM Producto p
                LEFT JOIN Inventario i ON p.id_producto = i.id_producto
                ORDER BY p.id_producto DESC
            ")->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["success" => true, "data" => $productos]);
        }
        break;

    // POST: crear producto
    case 'POST':

        $data = $_POST;

        $requeridos = ['nombre_producto', 'categoria', 'talla', 'color', 'precio'];

        foreach ($requeridos as $campo) {
            if (!isset($data[$campo]) || trim($data[$campo]) === '') {
                http_response_code(400);
                echo json_encode(["success" => false, "mensaje" => "Campo requerido: $campo"]);
                exit;
            }
        }

        try {
            $stmt = $db->prepare("
                INSERT INTO Producto (nombre_producto, descripcion, categoria,
                                      talla, color, precio, estado)
                VALUES (?, ?, ?, ?, ?, ?, 'Activo')
            ");
            $stmt->execute([
                trim($data['nombre_producto']),
                isset($data['descripcion']) ? trim($data['descripcion']) : null,
                trim($data['categoria']),
                trim($data['talla']),
                trim($data['color']),
                (int)$data['precio']
            ]);
            $id_producto = $db->lastInsertId();

            http_response_code(201);
            echo json_encode([
                "success"     => true,
                "mensaje"     => "Producto registrado correctamente",
                "id_producto" => $id_producto
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "mensaje" => "Error al registrar el producto: " . $e->getMessage()]);
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
            $stmt = $db->prepare("UPDATE Producto SET estado = 'Inactivo' WHERE id_producto = ?");
            $stmt->execute([$id]);
            echo json_encode(["success" => true, "mensaje" => "Producto desactivado correctamente"]);
            exit;
        }

        if ($action === 'reactivar') {
            $stmt = $db->prepare("UPDATE Producto SET estado = 'Activo' WHERE id_producto = ?");
            $stmt->execute([$id]);
            echo json_encode(["success" => true, "mensaje" => "Producto reactivado correctamente"]);
            exit;
        }

        // Sin acción: actualizar producto
        // PHP no llena $_POST en PUT; hay que leer el input crudo
        $data = [];
        parse_str(file_get_contents('php://input'), $data);

        $requeridos = ['nombre_producto', 'categoria', 'talla', 'color', 'precio'];

        foreach ($requeridos as $campo) {
            if (!isset($data[$campo]) || trim($data[$campo]) === '') {
                http_response_code(400);
                echo json_encode(["success" => false, "mensaje" => "Campo requerido: $campo"]);
                exit;
            }
        }

        try {
            $stmt = $db->prepare("
                UPDATE Producto
                SET nombre_producto = ?,
                    descripcion     = ?,
                    categoria       = ?,
                    talla           = ?,
                    color           = ?,
                    precio          = ?
                WHERE id_producto = ?
            ");
            $stmt->execute([
                trim($data['nombre_producto']),
                isset($data['descripcion']) ? trim($data['descripcion']) : null,
                trim($data['categoria']),
                trim($data['talla']),
                trim($data['color']),
                (int)$data['precio'],
                $id
            ]);

            echo json_encode(["success" => true, "mensaje" => "Producto actualizado correctamente"]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "mensaje" => "Error al actualizar el producto: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "mensaje" => "Método no permitido"]);
        break;
}
?>