<?php

require 'config.php';

require BASE_PATH . '/controllers/PedidoController.php';

$data = json_decode(file_get_contents("php://input"), true);

$accion = $data['accion'] ?? '';

switch ($accion) {

    case 'listar':
        echo json_encode(
            PedidoController::listar()
        );
        break;

    case 'crear':
        echo json_encode(
            PedidoController::crear($data)
        );
        break;

    case 'actualizar':
        echo json_encode(
            PedidoController::actualizar($data)
        );
        break;

    case 'cancelar':
        echo json_encode(
            PedidoController::cancelar($data['id_pedido'])
        );
        break;

    case 'reactivar':
        echo json_encode(
            PedidoController::reactivar($data['id_pedido'])
        );
        break;

    case 'entregar':
        echo json_encode(
            PedidoController::entregar($data['id_pedido'])
        );
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida"
        ]);
}