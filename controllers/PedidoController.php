<?php

require_once BASE_PATH . '/models/Pedido.php';

class PedidoController {

    public static function listar() {

        return [
            "success" => true,
            "pedidos" => Pedido::listar()
        ];
    }

    public static function crear($data) {

        return Pedido::crear($data);
    }

    public static function actualizar($data) {

        $ok = Pedido::actualizar($data);

        return [
            "success" => $ok
        ];
    }

    public static function cancelar($id_pedido) {

        $ok = Pedido::cancelar($id_pedido);

        return [
            "success" => $ok
        ];
    }

    public static function reactivar($id_pedido) {

        $ok = Pedido::reactivar($id_pedido);

        return [
            "success" => $ok
        ];
    }

    public static function entregar($id_pedido) {

        $ok = Pedido::entregar($id_pedido);

        return [
            "success" => $ok
        ];
    }
}