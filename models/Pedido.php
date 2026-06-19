<?php

require_once BASE_PATH . '/core/Database.php';

class Pedido {

    public static function listar() {
        $db = Database::conectar();
        // Usamos los nombres exactos de la DB: Pedido, id_pedido, etc.
        $stmt = $db->prepare("
            SELECT
                p.id_pedido,
                p.fecha_pedido,
                p.hora_pedido,
                p.metodo_pago,
                p.total_pedido,
                p.costo_envio,
                p.tipo_entrega,
                p.direccion_entrega,
                p.ciudad_entrega,
                p.telefono_contacto,
                p.fecha_entrega,
                p.estado,
                p.id_usuario,
                u.nombres,
                u.apellidos
            FROM Pedido p
            INNER JOIN Usuario u
                ON p.id_usuario = u.id_usuario
            ORDER BY p.id_pedido DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function crear($datos) {
        $db = Database::conectar();
        try {
            $db->beginTransaction();

            // Validar que los productos estén activos
            $stmtCheck = $db->prepare("SELECT estado FROM Producto WHERE id_producto = ?");
            foreach ($datos['productos'] as $producto) {
                $stmtCheck->execute([$producto['id_producto']]);
                $prod = $stmtCheck->fetch(PDO::FETCH_ASSOC);
                if (!$prod || $prod['estado'] !== 'Activo') {
                    throw new Exception("El producto con ID " . $producto['id_producto'] . " no está activo.");
                }
            }

            $stmt = $db->prepare("
                INSERT INTO Pedido(
                    fecha_pedido,
                    hora_pedido,
                    metodo_pago,
                    total_pedido,
                    costo_envio,
                    tipo_entrega,
                    direccion_entrega,
                    ciudad_entrega,
                    telefono_contacto,
                    fecha_entrega,
                    estado,
                    id_usuario
                )
                VALUES(CURDATE(), CURTIME(), ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $datos['metodo_pago'],
                $datos['costo_envio'],
                $datos['tipo_entrega'],
                $datos['direccion_entrega'],
                $datos['ciudad_entrega'],
                $datos['telefono_contacto'],
                $datos['fecha_entrega'],
                $datos['estado'],
                $datos['id_usuario']
            ]);
            $idPedido = $db->lastInsertId();
            foreach ($datos['productos'] as $producto) {
                $stmtDetalle = $db->prepare("
                    INSERT INTO Detalle_Pedido(cantidad, precio, id_pedido, id_producto)
                    VALUES(?,?,?,?)
                ");
                $stmtDetalle->execute([
                    $producto['cantidad'],
                    $producto['precio'],
                    $idPedido,
                    $producto['id_producto']
                ]);
            }
            $db->commit();
            return ["success" => true, "mensaje" => "Pedido registrado correctamente"];
        } catch (Exception $e) {
            $db->rollBack();
            return ["success" => false, "mensaje" => $e->getMessage()];
        }
    }

    public static function cancelar($id_pedido) {
        $db = Database::conectar();
        try {
            $db->beginTransaction();

            // 1. Cambiar estado
            $stmt = $db->prepare("UPDATE Pedido SET estado = 'Cancelado' WHERE id_pedido = ?");
            $stmt->execute([$id_pedido]);

            // 2. Devolver stock
            $stmtDetalles = $db->prepare("SELECT id_producto, cantidad FROM Detalle_Pedido WHERE id_pedido = ?");
            $stmtDetalles->execute([$id_pedido]);
            $detalles = $stmtDetalles->fetchAll(PDO::FETCH_ASSOC);

            $stmtStock = $db->prepare("UPDATE Inventario SET stock_disponible = stock_disponible + ? WHERE id_producto = ?");
            foreach ($detalles as $d) {
                $stmtStock->execute([$d['cantidad'], $d['id_producto']]);
            }

            $db->commit();
            return ["success" => true];
        } catch (Exception $e) {
            $db->rollBack();
            return ["success" => false, "mensaje" => $e->getMessage()];
        }
    }

    public static function entregar($id_pedido) {
        $db = Database::conectar();
        $stmt = $db->prepare("
            UPDATE Pedido
            SET estado = 'Entregado'
            WHERE id_pedido = ?
        ");
        $ok = $stmt->execute([$id_pedido]);
        return ["success" => $ok];
    }

    public static function reactivar($id_pedido) {
        $db = Database::conectar();
        try {
            $db->beginTransaction();

            // 1. Validar stock y estado de productos
            $stmtDetalles = $db->prepare("
                SELECT dp.id_producto, dp.cantidad, p.estado, i.stock_disponible 
                FROM Detalle_Pedido dp
                JOIN Producto p ON dp.id_producto = p.id_producto
                JOIN Inventario i ON dp.id_producto = i.id_producto
                WHERE dp.id_pedido = ?
            ");
            $stmtDetalles->execute([$id_pedido]);
            $detalles = $stmtDetalles->fetchAll(PDO::FETCH_ASSOC);

            foreach ($detalles as $d) {
                if ($d['estado'] !== 'Activo') {
                    throw new Exception("No se puede reactivar el pedido porque el producto ID " . $d['id_producto'] . " está inactivo.");
                }
                if ($d['stock_disponible'] < $d['cantidad']) {
                    throw new Exception("No hay suficiente stock para el producto ID " . $d['id_producto']);
                }
            }

            // 2. Cambiar estado
            $stmt = $db->prepare("UPDATE Pedido SET estado = 'Por Entregar' WHERE id_pedido = ?");
            $stmt->execute([$id_pedido]);

            // 3. Descontar stock
            $stmtStock = $db->prepare("UPDATE Inventario SET stock_disponible = stock_disponible - ? WHERE id_producto = ?");
            foreach ($detalles as $d) {
                $stmtStock->execute([$d['cantidad'], $d['id_producto']]);
            }

            $db->commit();
            return ["success" => true];
        } catch (Exception $e) {
            $db->rollBack();
            return ["success" => false, "mensaje" => $e->getMessage()];
        }
    }

    public static function actualizar($datos) {
        $db = Database::conectar();

        // Validar que la fecha de entrega no sea anterior a la fecha en que se registró el pedido
        $stmtFecha = $db->prepare("SELECT fecha_pedido FROM Pedido WHERE id_pedido = ?");
        $stmtFecha->execute([$datos['id_pedido']]);
        $pedidoActual = $stmtFecha->fetch(PDO::FETCH_ASSOC);

        if (!$pedidoActual) {
            return ["success" => false, "mensaje" => "Pedido no encontrado"];
        }

        if ($datos['fecha_entrega'] < $pedidoActual['fecha_pedido']) {
            return [
                "success" => false,
                "mensaje" => "La fecha de entrega no puede ser anterior a la fecha del pedido (" . $pedidoActual['fecha_pedido'] . ")"
            ];
        }

        $stmt = $db->prepare("
            UPDATE Pedido
            SET
                metodo_pago = ?,
                costo_envio = ?,
                tipo_entrega = ?,
                direccion_entrega = ?,
                ciudad_entrega = ?,
                telefono_contacto = ?,
                fecha_entrega = ?,
                estado = ?,
                id_usuario = ?
            WHERE id_pedido = ?
        ");
        $ok = $stmt->execute([
            $datos['metodo_pago'],
            $datos['costo_envio'],
            $datos['tipo_entrega'],
            $datos['direccion_entrega'],
            $datos['ciudad_entrega'],
            $datos['telefono_contacto'],
            $datos['fecha_entrega'],
            $datos['estado'],
            $datos['id_usuario'],
            $datos['id_pedido']
        ]);
        return ["success" => $ok];
    }
}
?>