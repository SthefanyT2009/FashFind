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
        return Pedido::actualizar($data);
    }

    public static function cancelar($id_pedido) {
        return Pedido::cancelar($id_pedido);
    }

    public static function reactivar($id_pedido) {
        return Pedido::reactivar($id_pedido);
    }

    public static function entregar($id_pedido) {
        return Pedido::entregar($id_pedido);
    }
}
?>
