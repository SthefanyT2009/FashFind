<?php
require_once BASE_PATH . '/core/Database.php';

class Venta {

    public static function obtenerTodos() {
        return Database::conectar()
            ->query("
                SELECT v.*, u.nombres, u.apellidos
                FROM Venta v
                INNER JOIN Usuario u ON v.id_usuario = u.id_usuario
                ORDER BY v.fecha_venta DESC, v.hora DESC
            ")
            ->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function obtenerPorId($id) {
        $stmt = Database::conectar()
            ->prepare("
                SELECT v.*, u.nombres, u.apellidos
                FROM Venta v
                INNER JOIN Usuario u ON v.id_usuario = u.id_usuario
                WHERE v.id_venta = ?
            ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ─── OBTENER DETALLES DE UNA VENTA 
    public static function obtenerDetalles($id_venta) {
        $stmt = Database::conectar()
            ->prepare("
                SELECT dv.*, p.nombre_producto, p.talla, p.color
                FROM Detalle_Venta dv
                INNER JOIN Producto p ON dv.id_producto = p.id_producto
                WHERE dv.id_venta = ?
            ");
        $stmt->execute([$id_venta]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function crear($datos, $detalles) {
        $db = Database::conectar();

        try {
            $db->beginTransaction();

            // Validar que los productos estén activos
            $stmtCheck = $db->prepare("SELECT estado FROM Producto WHERE id_producto = ?");
            foreach ($detalles as $d) {
                $stmtCheck->execute([$d['id_producto']]);
                $prod = $stmtCheck->fetch(PDO::FETCH_ASSOC);
                if (!$prod || $prod['estado'] !== 'Activo') {
                    throw new Exception("El producto con ID " . $d['id_producto'] . " no está activo.");
                }
            }

            $stmt = $db->prepare("
                INSERT INTO Venta (fecha_venta, hora, metodo_pago, costo_total,
                                   pago_recibido, cambio, estado, id_usuario)
                VALUES (?, ?, ?, ?, ?, ?, 'Activo', ?)
            ");
            $stmt->execute([
                $datos['fecha_venta'],
                $datos['hora'],
                $datos['metodo_pago'],
                $datos['costo_total'],
                $datos['pago_recibido'],
                $datos['cambio'],
                $datos['id_usuario']
            ]);
            $id_venta = $db->lastInsertId();

            $stmtDetalle = $db->prepare("
                INSERT INTO Detalle_Venta (cantidad, precio, sub_total, id_venta, id_producto)
                VALUES (?, ?, ?, ?, ?)
            ");
            foreach ($detalles as $d) {
                $sub_total = $d['cantidad'] * $d['precio'];
                $stmtDetalle->execute([$d['cantidad'], $d['precio'], $sub_total, $id_venta, $d['id_producto']]);
            }

            $db->commit();
            return $id_venta;

        } catch (Exception $e) {
            $db->rollBack();
            return false;
        }
    }

    public static function actualizar($id, $datos) {
        $db = Database::conectar();
        try {
            $db->beginTransaction();

            // Obtener estado actual
            $stmtActual = $db->prepare("SELECT estado FROM Venta WHERE id_venta = ?");
            $stmtActual->execute([$id]);
            $ventaActual = $stmtActual->fetch(PDO::FETCH_ASSOC);

            // Si cambia de Activo a Inactivo, devolver stock
            if ($ventaActual && $ventaActual['estado'] === 'Activo' && isset($datos['estado']) && $datos['estado'] === 'Inactivo') {
                self::eliminar($id); // El método eliminar ya tiene la lógica de devolver stock
            } 
            // Si cambia de Inactivo a Activo, descontar stock (validando disponibilidad)
            else if ($ventaActual && $ventaActual['estado'] === 'Inactivo' && isset($datos['estado']) && $datos['estado'] === 'Activo') {
                self::reactivar($id); // El método reactivar ya tiene la lógica de descontar stock
            }

            // Actualizar campos básicos (incluyendo estado si viene en los datos)
            $estadoFinal = $datos['estado'] ?? $ventaActual['estado'];
            
            $stmt = $db->prepare("
                UPDATE Venta
                SET fecha_venta   = ?,
                    hora          = ?,
                    metodo_pago   = ?,
                    costo_total   = ?,
                    pago_recibido = ?,
                    cambio        = ?,
                    id_usuario    = ?,
                    estado        = ?
                WHERE id_venta = ?
            ");
            $stmt->execute([
                $datos['fecha_venta'],
                $datos['hora'],
                $datos['metodo_pago'],
                $datos['costo_total'],
                $datos['pago_recibido'],
                $datos['cambio'],
                $datos['id_usuario'],
                $estadoFinal,
                $id
            ]);

            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            return false;
        }
    }

    public static function eliminar($id) {
        $db = Database::conectar();
        try {
            $db->beginTransaction();

            // 1. Cambiar estado de la venta
            $stmt = $db->prepare("UPDATE Venta SET estado = 'Inactivo' WHERE id_venta = ?");
            $stmt->execute([$id]);

            // 2. Devolver stock de los productos
            $stmtDetalles = $db->prepare("SELECT id_producto, cantidad FROM Detalle_Venta WHERE id_venta = ?");
            $stmtDetalles->execute([$id]);
            $detalles = $stmtDetalles->fetchAll(PDO::FETCH_ASSOC);

            $stmtStock = $db->prepare("UPDATE Inventario SET stock_disponible = stock_disponible + ? WHERE id_producto = ?");
            foreach ($detalles as $d) {
                $stmtStock->execute([$d['cantidad'], $d['id_producto']]);
            }

            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            return false;
        }
    }

    public static function reactivar($id) {
        $db = Database::conectar();
        try {
            $db->beginTransaction();

            // 1. Obtener detalles para validar stock y estado de productos
            $stmtDetalles = $db->prepare("
                SELECT dv.id_producto, dv.cantidad, p.estado, i.stock_disponible 
                FROM Detalle_Venta dv
                JOIN Producto p ON dv.id_producto = p.id_producto
                JOIN Inventario i ON dv.id_producto = i.id_producto
                WHERE dv.id_venta = ?
            ");
            $stmtDetalles->execute([$id]);
            $detalles = $stmtDetalles->fetchAll(PDO::FETCH_ASSOC);

            foreach ($detalles as $d) {
                if ($d['estado'] !== 'Activo') {
                    throw new Exception("No se puede reactivar la venta porque el producto ID " . $d['id_producto'] . " está inactivo.");
                }
                if ($d['stock_disponible'] < $d['cantidad']) {
                    throw new Exception("No hay suficiente stock para el producto ID " . $d['id_producto']);
                }
            }

            // 2. Cambiar estado de la venta
            $stmt = $db->prepare("UPDATE Venta SET estado = 'Activo' WHERE id_venta = ?");
            $stmt->execute([$id]);

            // 3. Descontar stock nuevamente
            $stmtStock = $db->prepare("UPDATE Inventario SET stock_disponible = stock_disponible - ? WHERE id_producto = ?");
            foreach ($detalles as $d) {
                $stmtStock->execute([$d['cantidad'], $d['id_producto']]);
            }

            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            return false;
        }
    }

    // ─── HELPERS 
    public static function obtenerVendedores() {
        return Database::conectar()
            ->query("
                SELECT id_usuario, nombres, apellidos
                FROM Usuario
                WHERE cargo IN ('Administrador','Vendedor')
                  AND estado = 'Activo'
                ORDER BY nombres
            ")
            ->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function obtenerProductosActivos() {
        return Database::conectar()
            ->query("
                SELECT p.id_producto, p.nombre_producto, p.talla, p.color,
                       p.precio, i.stock_disponible
                FROM Producto p
                INNER JOIN Inventario i ON p.id_producto = i.id_producto
                WHERE p.estado = 'Activo' AND i.stock_disponible > 0
                ORDER BY p.nombre_producto
            ")
            ->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>