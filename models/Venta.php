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
            $stmtStock = $db->prepare("
                UPDATE Inventario
                SET stock_disponible = stock_disponible - ?
                WHERE id_producto = ?
            ");

            foreach ($detalles as $d) {
                $sub_total = $d['cantidad'] * $d['precio'];
                $stmtDetalle->execute([$d['cantidad'], $d['precio'], $sub_total, $id_venta, $d['id_producto']]);
                $stmtStock->execute([$d['cantidad'], $d['id_producto']]);
            }

            $db->commit();
            return $id_venta;

        } catch (Exception $e) {
            $db->rollBack();
            return false;
        }
    }

    public static function actualizar($id, $datos) {
        $stmt = Database::conectar()->prepare("
            UPDATE Venta
            SET fecha_venta   = ?,
                hora          = ?,
                metodo_pago   = ?,
                costo_total   = ?,
                pago_recibido = ?,
                cambio        = ?,
                id_usuario    = ?
            WHERE id_venta = ?
        ");
        return $stmt->execute([
            $datos['fecha_venta'],
            $datos['hora'],
            $datos['metodo_pago'],
            $datos['costo_total'],
            $datos['pago_recibido'],
            $datos['cambio'],
            $datos['id_usuario'],
            $id
        ]);
    }

    public static function eliminar($id) {
        $stmt = Database::conectar()
            ->prepare("UPDATE Venta SET estado = 'Inactivo' WHERE id_venta = ?");
        return $stmt->execute([$id]);
    }

    public static function reactivar($id) {
        $stmt = Database::conectar()
            ->prepare("UPDATE Venta SET estado = 'Activo' WHERE id_venta = ?");
        return $stmt->execute([$id]);
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