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
        // Verificamos que el estado sea uno de los permitidos en el ENUM: "Por Entregar", "Entregado", "Cancelado"
        $stmt = $db->prepare("
            UPDATE Pedido
            SET estado = 'Cancelado'
            WHERE id_pedido = ?
        ");
        $ok = $stmt->execute([$id_pedido]);
        return ["success" => $ok];
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
        // Reactivar vuelve al estado inicial del ENUM
        $stmt = $db->prepare("
            UPDATE Pedido
            SET estado = 'Por Entregar'
            WHERE id_pedido = ?
        ");
        $ok = $stmt->execute([$id_pedido]);
        return ["success" => $ok];
    }

    public static function actualizar($datos) {
        $db = Database::conectar();
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
