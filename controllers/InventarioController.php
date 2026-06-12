<?php
require_once BASE_PATH . '/models/Inventario.php';
require_once BASE_PATH . '/core/AuthMiddleware.php';

class InventarioController {

    public function listar() {
        AuthMiddleware::verificarSesion();
        $inventarios = Inventario::obtenerTodos();
        require BASE_PATH . '/views/inventario/listar.php';
    }

    public function ver() {
        AuthMiddleware::verificarSesion();
        $inventario = Inventario::obtenerPorId($_GET['id']);

        if (!$inventario) {
            header("Location: index.php?route=inventario");
            exit;
        }

        require BASE_PATH . '/views/inventario/ver.php';
    }

    public function crear() {
        AuthMiddleware::soloAdmin();

        $productos = Inventario::obtenerProductos();

        if ($_POST) {
            $datos = [
                'stock_disponible' => $_POST['stock_disponible'],
                'stock_minimo'     => $_POST['stock_minimo'],
                'id_producto'      => $_POST['id_producto'],
            ];

            $resultado = Inventario::crear($datos);

            if ($resultado) {
                header("Location: index.php?route=inventario");
            } else {
                $error = "Error al registrar el inventario.";
                require BASE_PATH . '/views/inventario/crear.php';
            }
            exit;
        }

        require BASE_PATH . '/views/inventario/crear.php';
    }

    public function editar() {
        AuthMiddleware::soloAdmin();

        $inventario = Inventario::obtenerPorId($_GET['id']);
        $productos  = Inventario::obtenerProductos();

        if (!$inventario) {
            header("Location: index.php?route=inventario");
            exit;
        }

        if ($_POST) {
            $datos = [
                'stock_disponible' => $_POST['stock_disponible'],
                'stock_minimo'     => $_POST['stock_minimo'],
                'id_producto'      => $_POST['id_producto'],
            ];

            Inventario::actualizar($_GET['id'], $datos);
            header("Location: index.php?route=inventario");
            exit;
        }

        require BASE_PATH . '/views/inventario/editar.php';
    }

}
?>