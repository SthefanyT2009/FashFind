<?php
require_once BASE_PATH . '/models/Producto.php';
require_once BASE_PATH . '/core/AuthMiddleware.php';

class ProductoController {

    public function listar() {
        AuthMiddleware::verificarSesion();
        $productos = Producto::obtenerTodos();
        require BASE_PATH . '/views/productos/listar.php';
    }

    public function ver() {
        AuthMiddleware::verificarSesion();
        $producto = Producto::obtenerPorId($_GET['id']);

        if (!$producto) {
            header("Location: index.php?route=productos");
            exit;
        }

        require BASE_PATH . '/views/productos/ver.php';
    }

    public function crear() {
        AuthMiddleware::soloAdmin();

        if ($_POST) {
            $datos = [
                'nombre_producto' => $_POST['nombre_producto'],
                'descripcion'     => $_POST['descripcion'] ?? null,
                'categoria'       => $_POST['categoria'],
                'talla'           => $_POST['talla'],
                'color'           => $_POST['color'],
                'precio'          => $_POST['precio'],
            ];

            $resultado = Producto::crear($datos);

            if ($resultado) {
                header("Location: index.php?route=productos");
            } else {
                $error = "Error al registrar el producto. Inténtalo de nuevo.";
                require BASE_PATH . '/views/productos/crear.php';
            }
            exit;
        }

        require BASE_PATH . '/views/productos/crear.php';
    }

    public function editar() {
        AuthMiddleware::soloAdmin();

        $producto = Producto::obtenerPorId($_GET['id']);

        if (!$producto) {
            header("Location: index.php?route=productos");
            exit;
        }

        if ($_POST) {
            $datos = [
                'nombre_producto' => $_POST['nombre_producto'],
                'descripcion'     => $_POST['descripcion'] ?? null,
                'categoria'       => $_POST['categoria'],
                'talla'           => $_POST['talla'],
                'color'           => $_POST['color'],
                'precio'          => $_POST['precio'],
            ];

            $resultado = Producto::actualizar($_GET['id'], $datos);

            if ($resultado) {
                header("Location: index.php?route=productos");
            } else {
                $error = "Error al actualizar el producto.";
                require BASE_PATH . '/views/productos/editar.php';
            }
            exit;
        }

        require BASE_PATH . '/views/productos/editar.php';
    }

    public function eliminar() {
        AuthMiddleware::soloAdmin();
        Producto::eliminar($_GET['id']);
        header("Location: index.php?route=productos");
        exit;
    }

    public function reactivar() {
        AuthMiddleware::soloAdmin();
        Producto::reactivar($_GET['id']);
        header("Location: index.php?route=productos");
        exit;
    }
}
?>