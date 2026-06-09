<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'config.php';

$db = Database::conectar();

try {
    // Usuarios Activos
    $usuariosActivos = $db->query("SELECT COUNT(*) as total FROM Usuario WHERE estado = 'Activo'")->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Usuarios Inactivos
    $usuariosInactivos = $db->query("SELECT COUNT(*) as total FROM Usuario WHERE estado = 'Inactivo'")->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Clientes Registrados (cargo = 'Cliente' y estado = 'Activo')
    $clientesRegistrados = $db->query("SELECT COUNT(*) as total FROM Usuario WHERE cargo = 'Cliente' AND estado = 'Activo'")->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Clientes Inactivos (cargo = 'Cliente' y estado = 'Inactivo')
    $clientesInactivos = $db->query("SELECT COUNT(*) as total FROM Usuario WHERE cargo = 'Cliente' AND estado = 'Inactivo'")->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Ventas Quincenales (últimos 15 días, solo ACTIVAS)
    $ventasQuincenales = $db->query("SELECT SUM(costo_total) as total FROM Venta WHERE fecha_venta >= DATE_SUB(CURDATE(), INTERVAL 15 DAY) AND estado = 'Activo'")->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
    
    // Pedidos Por Entregar
    $pedidosPorEntregar = $db->query("SELECT COUNT(*) as total FROM Pedido WHERE estado = 'Por Entregar'")->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Pedidos Entregados
    $pedidosEntregados = $db->query("SELECT COUNT(*) as total FROM Pedido WHERE estado = 'Entregado'")->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Productos Activos
    $productosActivos = $db->query("SELECT COUNT(*) as total FROM Producto WHERE estado = 'Activo'")->fetch(PDO::FETCH_ASSOC)['total'];

    echo json_encode([
        'success' => true,
        'data' => [
            'usuarios_activos' => (int)$usuariosActivos,
            'usuarios_inactivos' => (int)$usuariosInactivos,
            'clientes_registrados' => (int)$clientesRegistrados,
            'clientes_inactivos' => (int)$clientesInactivos,
            'ventas_quincenales' => (int)$ventasQuincenales,
            'pedidos_por_entregar' => (int)$pedidosPorEntregar,
            'pedidos_entregados' => (int)$pedidosEntregados,
            'productos_activos' => (int)$productosActivos,
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'mensaje' => 'Error al obtener estadísticas: ' . $e->getMessage()
    ]);
}
?>