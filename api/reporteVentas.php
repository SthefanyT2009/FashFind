<?php
header("Access-Control-Allow-Origin: *");

$host = "localhost";
$db   = "Fash_Find";
$user = "root";
$pass = "";

$formato = $_GET['formato'] ?? 'pdf'; // pdf | excel | json
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Últimos 15 días (rango rodante, igual criterio que Pedidos)
    $hoy = new DateTime();
    $inicio_quincena = (clone $hoy)->modify('-15 days')->format('Y-m-d');
    $fin_quincena    = $hoy->format('Y-m-d');

    // Ventas activas de los últimos 15 días
    $sqlVentas = "
        SELECT DISTINCT v.id_venta, v.fecha_venta, v.hora, v.metodo_pago,
               v.costo_total, v.pago_recibido, v.cambio, v.estado,
               u.nombres, u.apellidos, u.cc
        FROM Venta v
        INNER JOIN Usuario u ON v.id_usuario = u.id_usuario
        WHERE v.estado = 'Activo'
          AND v.fecha_venta BETWEEN :inicio AND :fin
        GROUP BY v.id_venta, v.fecha_venta, v.hora, v.metodo_pago,
                 v.costo_total, v.pago_recibido, v.cambio, v.estado,
                 u.nombres, u.apellidos, u.cc
        ORDER BY v.id_venta DESC
    ";
    $stmtVentas = $pdo->prepare($sqlVentas);
    $stmtVentas->execute([':inicio' => $inicio_quincena, ':fin' => $fin_quincena]);
    $ventas = $stmtVentas->fetchAll(PDO::FETCH_ASSOC);

    // Detalles
    $sqlDetalle = "
        SELECT dv.id_venta, dv.cantidad, dv.precio, dv.sub_total,
               p.nombre_producto, p.talla, p.color
        FROM Detalle_Venta dv
        INNER JOIN Producto p ON dv.id_producto = p.id_producto
        WHERE dv.id_venta IN (
            SELECT v.id_venta FROM Venta v
            WHERE v.estado = 'Activo'
              AND v.fecha_venta BETWEEN :inicio AND :fin
        )
        ORDER BY dv.id_venta
    ";
    $stmtDetalle = $pdo->prepare($sqlDetalle);
    $stmtDetalle->execute([':inicio' => $inicio_quincena, ':fin' => $fin_quincena]);
    $detalles = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);

    $detallesPorVenta = [];
    foreach ($detalles as $d) {
        $detallesPorVenta[$d['id_venta']][] = $d;
    }
    foreach ($ventas as &$v) {
        $v['detalles'] = $detallesPorVenta[$v['id_venta']] ?? [];
    }
    unset($v);

    $total_ventas   = count($ventas);
    $total_ingresos = array_sum(array_column($ventas, 'costo_total'));
    $fechaHoy       = (new DateTime())->format('d/m/Y');
    $nombreArchivo  = 'reporte_ventas_' . str_replace('-', '', $inicio_quincena);

    // JSON (para la app móvil)
    if ($formato === 'json') {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'inicio_quincena' => $inicio_quincena,
            'fin_quincena'    => $fin_quincena,
            'total_ventas'    => $total_ventas,
            'total_ingresos'  => $total_ingresos,
            'ventas'          => $ventas,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
// ── EXCEL ────────────────────────────────────────────────────
    if ($formato === 'excel') {
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $nombreArchivo . '.xlsx"');
        header('Cache-Control: max-age=0');

        $html = "
<html xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns:ss='urn:schemas-microsoft-com:office:spreadsheet'>
<head>
<meta charset='UTF-8'>
<style>
  table { border-collapse: collapse; }
  td { border: 1px solid #e91e8c; padding: 6px; font-family: Arial; font-size: 10px; }
</style>
</head>
<body>
<table border='1' cellpadding='6' cellspacing='0'>
<tr><td colspan='6' bgcolor='#e91e8c' style='color:white;font-weight:bold;font-size:14px;'>FashFind — Reporte de Ventas (Últimos 15 días)</td></tr>
<tr><td colspan='6' bgcolor='#fff0f7' style='color:#555;font-size:11px;'>Generado: {$fechaHoy} &nbsp;|&nbsp; Período: {$inicio_quincena} al {$fin_quincena} &nbsp;|&nbsp; Total ventas: {$total_ventas} &nbsp;|&nbsp; Total ingresos: \$" . number_format($total_ingresos) . "</td></tr>
<tr><td colspan='6'>&nbsp;</td></tr>";

        foreach ($ventas as $v) {
            $cliente = htmlspecialchars($v['nombres'] . ' ' . $v['apellidos']);

            $html .= "
<tr><td colspan='6' bgcolor='#e91e8c' style='color:white;font-weight:bold;'>Venta #{$v['id_venta']} | " . htmlspecialchars($v['fecha_venta']) . " | Cliente: {$cliente} | CC: " . htmlspecialchars($v['cc']) . " | Método: " . htmlspecialchars($v['metodo_pago']) . "</td></tr>
<tr>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;'>Producto</td>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;text-align:center;'>Talla</td>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;text-align:center;'>Color</td>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;text-align:center;'>Cantidad</td>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;text-align:right;'>Precio Unit.</td>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;text-align:right;'>Subtotal</td>
</tr>";

            foreach ($v['detalles'] as $i => $d) {
                $bg = $i % 2 === 0 ? '#ffffff' : '#fff7fb';
                $html .= "
<tr bgcolor='{$bg}'>
  <td>" . htmlspecialchars($d['nombre_producto']) . "</td>
  <td align='center'>" . htmlspecialchars($d['talla']) . "</td>
  <td align='center'>" . htmlspecialchars($d['color']) . "</td>
  <td align='center'>" . htmlspecialchars($d['cantidad']) . "</td>
  <td align='right'>\$" . number_format($d['precio']) . "</td>
  <td align='right'>\$" . number_format($d['sub_total']) . "</td>
</tr>";
            }

            $html .= "
<tr bgcolor='#f9c0dd'>
  <td colspan='4' align='right' style='color:#c0166e;font-weight:bold;'>Recibido:</td>
  <td colspan='2' align='right' style='color:#c0166e;font-weight:bold;'>\$" . number_format($v['pago_recibido']) . "</td>
</tr>
<tr bgcolor='#f9c0dd'>
  <td colspan='4' align='right' style='color:#c0166e;font-weight:bold;'>Cambio:</td>
  <td colspan='2' align='right' style='color:#c0166e;font-weight:bold;'>\$" . number_format($v['cambio']) . "</td>
</tr>
<tr bgcolor='#e91e8c'>
  <td colspan='4' align='right' style='color:white;font-weight:bold;'>TOTAL VENTA:</td>
  <td colspan='2' align='right' style='color:white;font-weight:bold;'>\$" . number_format($v['costo_total']) . "</td>
</tr>
<tr><td colspan='6'>&nbsp;</td></tr>";
        }

        $html .= "
<tr><td colspan='6' bgcolor='#e91e8c' style='color:#ffd6ec;text-align:center;font-size:9px;padding:10px;'>FashFind — Reporte generado automáticamente</td></tr>
</table>
</body>
</html>";

        echo $html;
        exit;
    }
    // PDF (HTML + window.print) 
    $autoprint = ($formato === 'pdf') ? "window.onload=function(){window.print();}" : "";

    $filas_ventas = '';
    foreach ($ventas as $v) {
        $cliente  = htmlspecialchars($v['nombres'] . ' ' . $v['apellidos']);
        $cc       = htmlspecialchars($v['cc']);
        $fecha    = htmlspecialchars($v['fecha_venta']);
        $hora     = htmlspecialchars($v['hora']);
        $metodo   = htmlspecialchars($v['metodo_pago']);
        $total    = '$' . number_format($v['costo_total'],    0, ',', '.');
        $recibido = '$' . number_format($v['pago_recibido'],  0, ',', '.');
        $cambio   = '$' . number_format($v['cambio'],         0, ',', '.');

        $filas_productos = '';
        foreach ($v['detalles'] as $i => $d) {
            $bg = $i % 2 === 0 ? '#ffffff' : '#f8f8f8';
            $filas_productos .= "
            <tr style='background:{$bg}'>
                <td>" . htmlspecialchars($d['nombre_producto']) . "</td>
                <td style='text-align:center'>" . htmlspecialchars($d['talla']) . "</td>
                <td style='text-align:center'>" . htmlspecialchars($d['color']) . "</td>
                <td style='text-align:center'>{$d['cantidad']}</td>
                <td style='text-align:right'>$" . number_format($d['precio'],    0, ',', '.') . "</td>
                <td style='text-align:right'>$" . number_format($d['sub_total'], 0, ',', '.') . "</td>
            </tr>";
        }

        $filas_ventas .= "
        <div class='venta-bloque'>
            <div class='venta-header'>
                <span>Venta #{$v['id_venta']}</span>
                <span>{$fecha} &nbsp; {$hora}</span>
            </div>
            <div class='venta-info'>
                <p><strong>Cliente:</strong> {$cliente} &nbsp;|&nbsp; <strong>CC:</strong> {$cc}</p>
                <p><strong>Método de pago:</strong> {$metodo} &nbsp;|&nbsp; <strong>Recibido:</strong> {$recibido} &nbsp;|&nbsp; <strong>Cambio:</strong> {$cambio}</p>
            </div>
            <table class='tabla-productos'>
                <thead>
                    <tr><th>Producto</th><th>Talla</th><th>Color</th><th>Cant.</th><th>Precio Unit.</th><th>Subtotal</th></tr>
                </thead>
                <tbody>{$filas_productos}</tbody>
            </table>
            <div class='venta-total'><span>TOTAL VENTA: <strong>{$total}</strong></span></div>
        </div>";
    }

    header('Content-Type: text/html; charset=utf-8');
    echo "<!DOCTYPE html>
<html lang='es'>
<head>
<meta charset='UTF-8'>
<title>Reporte de Ventas</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;font-size:12px;color:#333;background:#f0f0f0}
  .pagina{max-width:700px;margin:0 auto;background:#fff;padding:0 0 20px 0}
  .header{background:#e91e8c;color:white;padding:18px 24px;display:flex;justify-content:space-between;align-items:center}
  .header-titulo{color:#fff;font-size:22px;font-weight:bold;letter-spacing:1px}
  .header-sub{color:#ffd6ec;font-size:11px;margin-top:4px}
  .header-fecha{color:#ffd6ec;font-size:10px}
  .resumen{background:#fff0f7;margin:16px;padding:12px 16px;border-radius:6px;display:flex;gap:32px;border-left:4px solid #e91e8c}
  .resumen-item label{font-weight:bold;font-size:10px;color:#e91e8c;display:block;margin-bottom:2px}
  .resumen-item span{font-size:11px;color:#555}
  .venta-bloque{margin:0 16px 16px 16px;border:1px solid #f9c0dd;border-radius:6px;overflow:hidden}
  .venta-header{background:#e91e8c;color:white;padding:7px 12px;display:flex;justify-content:space-between;font-weight:bold;font-size:11px}
  .venta-info{background:#fff7fb;padding:8px 12px;border-bottom:1px solid #f9c0dd}
  .venta-info p{font-size:10px;color:#555;margin-bottom:3px}
  .tabla-productos{width:100%;border-collapse:collapse;font-size:10px}
  .tabla-productos thead tr{background:#fde8f3}
  .tabla-productos th{padding:5px 8px;text-align:left;font-size:9px;color:#c0166e;border-bottom:2px solid #e91e8c}
  .tabla-productos td{padding:5px 8px;border-bottom:1px solid #fde8f3}
  .venta-total{background:#fde8f3;color:#c0166e;padding:6px 12px;text-align:right;font-size:11px;font-weight:bold;border-top:2px solid #e91e8c}
  .venta-total strong{color:#e91e8c}
  .footer{background:#e91e8c;color:#ffd6ec;text-align:center;padding:10px;font-size:9px;margin-top:20px}
  @media print{body{background:#fff}.pagina{max-width:100%}.venta-bloque{page-break-inside:avoid}}
</style>
</head>
<body>
<div class='pagina'>
<div class='header'>
  <div>
    <div class='header-titulo'>FashFind</div>
    <div class='header-sub'>Reporte de Ventas (Últimos 15 días)</div>
  </div>
  <div class='header-fecha'>Generado: {$fechaHoy}</div>
</div>
<div class='resumen'>
  <div class='resumen-item'><label>Período</label><span>{$inicio_quincena} al {$fin_quincena}</span></div>
  <div class='resumen-item'><label>Total Ventas</label><span>{$total_ventas}</span></div>
  <div class='resumen-item'><label>Total Ingresos</label><span>$" . number_format($total_ingresos,0,',','.') . "</span></div>
</div>
{$filas_ventas}
<div class='footer'>FashFind &mdash; Reporte generado automáticamente</div>
</div>
<script>{$autoprint}</script>
</body></html>";

} catch (PDOException $e) {
    echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
}