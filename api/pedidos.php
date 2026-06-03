<?php

require 'config.php';
require BASE_PATH . '/models/Pedido.php';

$data = json_decode(file_get_contents("php://input"), true);

$accion = $data['accion'] ?? '';

switch ($accion) {

    case 'listar':

        echo json_encode([
            'success' => true,
            'pedidos' => Pedido::listar()
        ]);

        break;

    case 'crear':

        echo json_encode(
            Pedido::crear($data)
        );

        break;

    case 'actualizar':

        $ok = Pedido::actualizar($data);

        echo json_encode([
            'success' => $ok
        ]);

        break;

    case 'cancelar':

        $ok = Pedido::cancelar(
            $data['id_pedido']
        );

        echo json_encode([
            'success' => $ok
        ]);

        break;

    case 'reactivar':

        $ok = Pedido::reactivar(
            $data['id_pedido']
        );

        echo json_encode([
            'success' => $ok
        ]);

        break;

    case 'entregar':

        $ok = Pedido::entregar(
            $data['id_pedido']
        );

        echo json_encode([
            'success' => $ok
        ]);

        break;

    default:

        echo json_encode([
            'success' => false,
            'mensaje' => 'Acción no válida'
        ]);
}
?> 