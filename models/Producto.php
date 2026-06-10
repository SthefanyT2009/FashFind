<?php
require_once BASE_PATH . '/core/Database.php';

class Producto {

    public static function obtenerTodos() {
        return Database::conectar()
            ->query("
                SELECT *
                FROM Producto
                ORDER BY id_producto DESC
            ")
            ->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function obtenerPorId($id) {
        $stmt = Database::conectar()
            ->prepare("
                SELECT *
                FROM Producto
                WHERE id_producto = ?
            ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function crear($datos) {
        $db = Database::conectar();

        try {
            $stmt = $db->prepare("
                INSERT INTO Producto (nombre_producto, descripcion, categoria,
                                      talla, color, precio, estado)
                VALUES (?, ?, ?, ?, ?, ?, 'Activo')
            ");
            $stmt->execute([
                $datos['nombre_producto'],
                $datos['descripcion'],
                $datos['categoria'],
                $datos['talla'],
                $datos['color'],
                $datos['precio']
            ]);
            return $db->lastInsertId();

        } catch (Exception $e) {
            return false;
        }
    }

    public static function actualizar($id, $datos) {
        $db = Database::conectar();

        try {
            $stmt = $db->prepare("
                UPDATE Producto
                SET nombre_producto = ?,
                    descripcion     = ?,
                    categoria       = ?,
                    talla           = ?,
                    color           = ?,
                    precio          = ?
                WHERE id_producto = ?
            ");
            $stmt->execute([
                $datos['nombre_producto'],
                $datos['descripcion'],
                $datos['categoria'],
                $datos['talla'],
                $datos['color'],
                $datos['precio'],
                $id
            ]);
            return true;

        } catch (Exception $e) {
            return false;
        }
    }

    public static function eliminar($id) {
        $stmt = Database::conectar()
            ->prepare("UPDATE Producto SET estado = 'Inactivo' WHERE id_producto = ?");
        return $stmt->execute([$id]);
    }

    public static function reactivar($id) {
        $stmt = Database::conectar()
            ->prepare("UPDATE Producto SET estado = 'Activo' WHERE id_producto = ?");
        return $stmt->execute([$id]);
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    public static function obtenerCategorias() {
        return Database::conectar()
            ->query("
                SELECT DISTINCT categoria
                FROM Producto
                ORDER BY categoria ASC
            ")
            ->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>