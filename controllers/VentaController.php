<?php
require_once BASE_PATH . '/models/Venta.php';
require_once BASE_PATH . '/core/AuthMiddleware.php';

class VentaController {

    public function listar() {
        AuthMiddleware::verificarSesion();
        $ventas = Venta::obtenerTodos();
        require BASE_PATH . '/views/ventas/listar.php';
    }

    public function ver() {
        AuthMiddleware::verificarSesion();
        $venta    = Venta::obtenerPorId($_GET['id']);
        $detalles = Venta::obtenerDetalles($_GET['id']);

        if (!$venta) {
            header("Location: index.php?route=ventas");
            exit;
        }

        require BASE_PATH . '/views/ventas/ver.php';
    }

    public function crear() {
        AuthMiddleware::soloAdmin();

        $vendedores = Venta::obtenerVendedores();
        $productos  = Venta::obtenerProductosActivos();

        if ($_POST) {
            $detalles = [];
            foreach ($_POST['id_producto'] as $i => $id_prod) {
                $detalles[] = [
                    'id_producto' => $id_prod,
                    'cantidad'    => $_POST['cantidad'][$i],
                    'precio'      => $_POST['precio'][$i],
                ];
            }

            $datos = [
                'fecha_venta'   => $_POST['fecha_venta'],
                'hora'          => $_POST['hora'],
                'metodo_pago'   => $_POST['metodo_pago'],
                'costo_total'   => $_POST['costo_total'],
                'pago_recibido' => $_POST['pago_recibido'],
                'cambio'        => $_POST['cambio'],
                'id_usuario'    => $_POST['id_usuario'],
            ];

            $resultado = Venta::crear($datos, $detalles);

            if ($resultado) {
                header("Location: index.php?route=ventas");
            } else {
                $error = "Error al registrar la venta. Verifica el stock disponible.";
                require BASE_PATH . '/views/ventas/crear.php';
            }
            exit;
        }

        require BASE_PATH . '/views/ventas/crear.php';
    }

    public function editar() {
        AuthMiddleware::soloAdmin();

        $venta      = Venta::obtenerPorId($_GET['id']);
        $detalles   = Venta::obtenerDetalles($_GET['id']);
        $vendedores = Venta::obtenerVendedores();

        if (!$venta) {
            header("Location: index.php?route=ventas");
            exit;
        }

        if ($_POST) {
            $datos = [
                'fecha_venta'   => $_POST['fecha_venta'],
                'hora'          => $_POST['hora'],
                'metodo_pago'   => $_POST['metodo_pago'],
                'costo_total'   => $_POST['costo_total'],
                'pago_recibido' => $_POST['pago_recibido'],
                'cambio'        => $_POST['cambio'],
                'id_usuario'    => $_POST['id_usuario'],
            ];

            Venta::actualizar($_GET['id'], $datos);
            header("Location: index.php?route=ventas");
            exit;
        }

        require BASE_PATH . '/views/ventas/editar.php';
    }

    public function eliminar() {
        AuthMiddleware::soloAdmin();
        Venta::eliminar($_GET['id']);
        header("Location: index.php?route=ventas");
        exit;
    }

    public function reactivar() {
        AuthMiddleware::soloAdmin();
        Venta::reactivar($_GET['id']);
        header("Location: index.php?route=ventas");
        exit;
    }
}
?>