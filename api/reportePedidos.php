<?php
header("Access-Control-Allow-Origin: *");

$host = "localhost";
$db   = "Fash_Find";
$user = "root";
$pass = "";

$formato = $_GET['formato'] ?? 'pdf'; // pdf | excel

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Quincena actual
    $hoy = new DateTime();
    $dia = (int)$hoy->format('d');
    if ($dia <= 15) {
        $inicio_quincena = $hoy->format('Y-m-') . '01';
        $fin_quincena    = $hoy->format('Y-m-') . '15';
    } else {
        $ultimo_dia = $hoy->format('t');
        $inicio_quincena = $hoy->format('Y-m-') . '16';
        $fin_quincena    = $hoy->format('Y-m-') . $ultimo_dia;
    }

    // Pedidos de la quincena (todos los estados)
    $sqlPedidos = "
        SELECT p.id_pedido, p.fecha_pedido, p.hora_pedido, p.metodo_pago,
               p.total_pedido, p.costo_envio, p.tipo_entrega,
               p.direccion_entrega, p.ciudad_entrega, p.telefono_contacto,
               p.fecha_entrega, p.estado,
               u.nombres, u.apellidos, u.cc
        FROM Pedido p
        INNER JOIN Usuario u ON p.id_usuario = u.id_usuario
        WHERE p.fecha_pedido BETWEEN :inicio AND :fin
        ORDER BY p.id_pedido DESC
    ";
    $stmtPedidos = $pdo->prepare($sqlPedidos);
    $stmtPedidos->execute([':inicio' => $inicio_quincena, ':fin' => $fin_quincena]);
    $pedidos = $stmtPedidos->fetchAll(PDO::FETCH_ASSOC);

    // Detalles
    $sqlDetalle = "
        SELECT dp.id_pedido, dp.cantidad, dp.precio, dp.sub_total,
               pr.nombre_producto, pr.talla, pr.color
        FROM Detalle_Pedido dp
        INNER JOIN Producto pr ON dp.id_producto = pr.id_producto
        WHERE dp.id_pedido IN (
            SELECT p.id_pedido FROM Pedido p
            WHERE p.fecha_pedido BETWEEN :inicio AND :fin
        )
        ORDER BY dp.id_pedido
    ";
    $stmtDetalle = $pdo->prepare($sqlDetalle);
    $stmtDetalle->execute([':inicio' => $inicio_quincena, ':fin' => $fin_quincena]);
    $detalles = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);

    $detallesPorPedido = [];
    foreach ($detalles as $d) {
        $detallesPorPedido[$d['id_pedido']][] = $d;
    }
    foreach ($pedidos as &$p) {
        $p['detalles'] = $detallesPorPedido[$p['id_pedido']] ?? [];
    }
    unset($p);

    $total_pedidos  = count($pedidos);
    $por_entregar   = count(array_filter($pedidos, fn($p) => $p['estado'] === 'Por Entregar'));
    $entregados     = count(array_filter($pedidos, fn($p) => $p['estado'] === 'Entregado'));
    $cancelados     = count(array_filter($pedidos, fn($p) => $p['estado'] === 'Cancelado'));
    $total_ingresos = array_sum(array_column(
        array_filter($pedidos, fn($p) => $p['estado'] !== 'Cancelado'),
        'total_pedido'
    ));
    $fechaHoy      = (new DateTime())->format('d/m/Y');
    $nombreArchivo = 'reporte_pedidos_' . str_replace('-', '', $inicio_quincena);

    // Color por estado
    $colorEstado = [
        'Por Entregar' => '#f39c12',
        'Entregado'    => '#27ae60',
        'Cancelado'    => '#e74c3c',
    ];

    // ── EXCEL ────────────────────────────────────────────────────
    if ($formato === 'excel') {
        header('Content-Type: application/vnd.ms-excel; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $nombreArchivo . '.xls"');
        header('Cache-Control: max-age=0');

        echo "\xEF\xBB\xBF";

        $out  = "<table border='1' style='border-collapse:collapse;font-family:Arial;font-size:11px'>";
        $out .= "<tr><td colspan='10' style='background:#6b2d8b;color:#e91e8c;font-size:14px;font-weight:bold;padding:8px'>FashFind — Reporte de Pedidos Quincenales</td></tr>";
        $out .= "<tr><td colspan='10' style='padding:4px'>Período: {$inicio_quincena} al {$fin_quincena} &nbsp;|&nbsp; Total: {$total_pedidos} &nbsp;|&nbsp; Por entregar: {$por_entregar} &nbsp;|&nbsp; Entregados: {$entregados} &nbsp;|&nbsp; Cancelados: {$cancelados} &nbsp;|&nbsp; Ingresos: $" . number_format($total_ingresos,0,',','.') . "</td></tr>";
        $out .= "<tr><td colspan='10'></td></tr>";

        foreach ($pedidos as $p) {
            $cliente = $p['nombres'] . ' ' . $p['apellidos'];
            $estado  = $p['estado'];
            $bgEstado = $colorEstado[$estado] ?? '#6b2d8b';

            $out .= "<tr style='background:{$bgEstado};color:white;font-weight:bold'>"
                  . "<td colspan='10' style='padding:5px'>Pedido #{$p['id_pedido']} — {$p['fecha_pedido']} {$p['hora_pedido']} — Estado: {$estado} — Cliente: {$cliente} (CC: {$p['cc']})</td>"
                  . "</tr>";
            $out .= "<tr style='background:#f0f0f0'>"
                  . "<td colspan='10' style='padding:4px;font-size:10px'>"
                  . "Método: {$p['metodo_pago']} &nbsp;|&nbsp; Entrega: {$p['tipo_entrega']} &nbsp;|&nbsp; Ciudad: {$p['ciudad_entrega']} &nbsp;|&nbsp; Dirección: {$p['direccion_entrega']} &nbsp;|&nbsp; Tel: {$p['telefono_contacto']} &nbsp;|&nbsp; Fecha entrega: {$p['fecha_entrega']} &nbsp;|&nbsp; Costo envío: $" . number_format($p['costo_envio'],0,',','.') . "</td>"
                  . "</tr>";
            $out .= "<tr style='background:#dcdcdc;font-weight:bold'>"
                  . "<td style='padding:4px'>Producto</td><td>Talla</td><td>Color</td>"
                  . "<td style='text-align:center'>Cant.</td><td style='text-align:right'>Precio Unit.</td>"
                  . "<td style='text-align:right'>Subtotal</td><td colspan='4'></td></tr>";

            foreach ($p['detalles'] as $d) {
                $out .= "<tr><td style='padding:4px'>" . htmlspecialchars($d['nombre_producto']) . "</td>"
                      . "<td>" . htmlspecialchars($d['talla']) . "</td>"
                      . "<td>" . htmlspecialchars($d['color']) . "</td>"
                      . "<td style='text-align:center'>{$d['cantidad']}</td>"
                      . "<td style='text-align:right'>$" . number_format($d['precio'],    0,',','.') . "</td>"
                      . "<td style='text-align:right'>$" . number_format($d['sub_total'], 0,',','.') . "</td>"
                      . "<td colspan='4'></td></tr>";
            }
            $out .= "<tr style='background:#6b2d8b;color:#e91e8c;font-weight:bold'>"
                  . "<td colspan='5' style='text-align:right;padding:4px'>TOTAL PEDIDO:</td>"
                  . "<td style='text-align:right'>$" . number_format($p['total_pedido'],0,',','.') . "</td>"
                  . "<td colspan='4'></td></tr>";
            $out .= "<tr><td colspan='10'></td></tr>";
        }

        $out .= "</table>";
        echo $out;
        exit;
    }

    // ── PDF (HTML + window.print) ────────────────────────────────
    $autoprint = ($formato === 'pdf') ? "window.onload=function(){window.print();}" : "";

    $filas_pedidos = '';
    foreach ($pedidos as $p) {
        $cliente        = htmlspecialchars($p['nombres'] . ' ' . $p['apellidos']);
        $cc             = htmlspecialchars($p['cc']);
        $fecha          = htmlspecialchars($p['fecha_pedido']);
        $hora           = htmlspecialchars($p['hora_pedido']);
        $metodo         = htmlspecialchars($p['metodo_pago']);
        $tipo_entrega   = htmlspecialchars($p['tipo_entrega']);
        $direccion      = htmlspecialchars($p['direccion_entrega']);
        $ciudad         = htmlspecialchars($p['ciudad_entrega']);
        $telefono       = htmlspecialchars($p['telefono_contacto']);
        $fecha_entrega  = htmlspecialchars($p['fecha_entrega']);
        $estado         = htmlspecialchars($p['estado']);
        $total          = '$' . number_format($p['total_pedido'], 0, ',', '.');
        $envio          = '$' . number_format($p['costo_envio'],  0, ',', '.');
        $bgEstado       = $colorEstado[$p['estado']] ?? '#6b2d8b';

        $filas_productos = '';
        foreach ($p['detalles'] as $i => $d) {
            $bg = $i % 2 === 0 ? '#ffffff' : '#f8f8f8';
            $filas_productos .= "
            <tr style='background:{$bg}'>
                <td>" . htmlspecialchars($d['nombre_producto']) . "</td>
                <td style='text-align:center'>" . htmlspecialchars($d['talla']) . "</td>
                <td style='text-align:center'>" . htmlspecialchars($d['color']) . "</td>
                <td style='text-align:center'>{$d['cantidad']}</td>
                <td style='text-align:right'>$" . number_format($d['precio'],    0,',','.') . "</td>
                <td style='text-align:right'>$" . number_format($d['sub_total'], 0,',','.') . "</td>
            </tr>";
        }

        $filas_pedidos .= "
        <div class='pedido-bloque'>
            <div class='pedido-header'>
                <span>Pedido #{$p['id_pedido']}</span>
                <span>{$fecha} &nbsp; {$hora}</span>
                <span class='estado-badge' style='background:{$bgEstado}'>{$estado}</span>
            </div>
            <div class='pedido-info'>
                <p><strong>Cliente:</strong> {$cliente} &nbsp;|&nbsp; <strong>CC:</strong> {$cc}</p>
                <p><strong>Método de pago:</strong> {$metodo} &nbsp;|&nbsp; <strong>Costo envío:</strong> {$envio}</p>
                <p><strong>Tipo entrega:</strong> {$tipo_entrega} &nbsp;|&nbsp; <strong>Ciudad:</strong> {$ciudad} &nbsp;|&nbsp; <strong>Tel:</strong> {$telefono}</p>
                <p><strong>Dirección:</strong> {$direccion} &nbsp;|&nbsp; <strong>Fecha entrega:</strong> {$fecha_entrega}</p>
            </div>
            <table class='tabla-productos'>
                <thead>
                    <tr><th>Producto</th><th>Talla</th><th>Color</th><th>Cant.</th><th>Precio Unit.</th><th>Subtotal</th></tr>
                </thead>
                <tbody>{$filas_productos}</tbody>
            </table>
            <div class='pedido-total'><span>TOTAL PEDIDO: <strong>{$total}</strong></span></div>
        </div>";
    }

    header('Content-Type: text/html; charset=utf-8');
    echo "<!DOCTYPE html>
<html lang='es'>
<head>
<meta charset='UTF-8'>
<title>Reporte de Pedidos</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;font-size:12px;color:#333}
  .header{background:#6b2d8b;color:white;padding:20px 24px;display:flex;justify-content:space-between;align-items:center}
  .header-titulo{color:#e91e8c;font-size:22px;font-weight:bold}
  .header-sub{color:#ccc;font-size:11px;margin-top:4px}
  .header-fecha{color:#aaa;font-size:10px}
  .resumen{background:#f5f5f5;margin:16px;padding:14px;border-radius:4px;display:flex;flex-wrap:wrap;gap:24px}
  .resumen-item label{font-weight:bold;font-size:10px;color:#6b2d8b;display:block}
  .resumen-item span{font-size:11px;color:#555}
  .pedido-bloque{margin:0 16px 18px 16px;border:1px solid #eee;border-radius:4px;overflow:hidden}
  .pedido-header{background:#e91e8c;color:white;padding:7px 12px;display:flex;justify-content:space-between;align-items:center;font-weight:bold;font-size:11px;gap:8px}
  .estado-badge{padding:2px 8px;border-radius:10px;font-size:10px;font-weight:bold}
  .pedido-info{background:#fcfcfc;padding:8px 12px;border-bottom:1px solid #eee}
  .pedido-info p{font-size:10px;color:#555;margin-bottom:3px}
  .tabla-productos{width:100%;border-collapse:collapse;font-size:10px}
  .tabla-productos thead tr{background:#dcdcdc}
  .tabla-productos th{padding:5px 8px;text-align:left;font-size:9px;color:#282828}
  .tabla-productos td{padding:5px 8px;border-bottom:1px solid #f0f0f0}
  .pedido-total{background:#6b2d8b;color:white;padding:6px 12px;text-align:right;font-size:11px}
  .pedido-total strong{color:#e91e8c}
  .footer{background:#6b2d8b;color:#aaa;text-align:center;padding:10px;font-size:9px;margin-top:20px}
  @media print{.pedido-bloque{page-break-inside:avoid}}
</style>
</head>
<body>
<div class='header'>
  <div>
    <div class='header-titulo'>FashFind</div>
    <div class='header-sub'>Reporte de Pedidos Quincenales</div>
  </div>
  <div class='header-fecha'>Generado: {$fechaHoy}</div>
</div>
<div class='resumen'>
  <div class='resumen-item'><label>Período</label><span>{$inicio_quincena} al {$fin_quincena}</span></div>
  <div class='resumen-item'><label>Total Pedidos</label><span>{$total_pedidos}</span></div>
  <div class='resumen-item'><label>Por Entregar</label><span>{$por_entregar}</span></div>
  <div class='resumen-item'><label>Entregados</label><span>{$entregados}</span></div>
  <div class='resumen-item'><label>Cancelados</label><span>{$cancelados}</span></div>
  <div class='resumen-item'><label>Total Ingresos</label><span>$" . number_format($total_ingresos,0,',','.') . "</span></div>
</div>
{$filas_pedidos}
<div class='footer'>FashFind &mdash; Reporte generado automáticamente</div>
<script>{$autoprint}</script>
</body></html>";

} catch (PDOException $e) {
    echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
}