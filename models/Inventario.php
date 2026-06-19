<?php
require_once BASE_PATH . '/core/Database.php';

class Inventario {

    public static function obtenerTodos() {
        return Database::conectar()
            ->query("
                SELECT i.*, p.nombre_producto, p.talla, p.color, p.precio
                FROM Inventario i
                INNER JOIN Producto p ON i.id_producto = p.id_producto
                WHERE p.estado = 'Activo' AND i.estado = 'Activo'
                ORDER BY p.nombre_producto ASC
            ")
            ->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function obtenerPorId($id) {
        $stmt = Database::conectar()
            ->prepare("
                SELECT i.*, p.nombre_producto, p.talla, p.color, p.precio
                FROM Inventario i
                INNER JOIN Producto p ON i.id_producto = p.id_producto
                WHERE i.id_inventario = ?
            ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function crear($datos) {
        $stmt = Database::conectar()->prepare("
            INSERT INTO Inventario (stock_disponible, stock_minimo, id_producto, estado)
            VALUES (?, ?, ?, 'Activo')
        ");
        return $stmt->execute([
            $datos['stock_disponible'],
            $datos['stock_minimo'],
            $datos['id_producto']
        ]);
    }

    public static function actualizar($id, $datos) {
        $stmt = Database::conectar()->prepare("
            UPDATE Inventario
            SET stock_disponible = ?,
                stock_minimo     = ?,
                id_producto      = ?
            WHERE id_inventario = ?
        ");
        return $stmt->execute([
            $datos['stock_disponible'],
            $datos['stock_minimo'],
            $datos['id_producto'],
            $id
        ]);
    }

    // ─── HELPERS ───────────────────────────────────────────────────────────
    public static function obtenerProductos() {
        return Database::conectar()
            ->query("
                SELECT id_producto, nombre_producto, talla, color, precio
                FROM Producto
                WHERE estado = 'Activo'
                ORDER BY nombre_producto ASC
            ")
            ->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>