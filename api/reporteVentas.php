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

    // Ventas activas de la quincena
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

    // ── JSON (para la app móvil) ─────────────────────────────────
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
        header('Content-Type: application/vnd.ms-excel; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $nombreArchivo . '.xls"');
        header('Cache-Control: max-age=0');

        echo "\xEF\xBB\xBF"; // BOM UTF-8

        $out  = "<table border='1' style='border-collapse:collapse;font-family:Arial;font-size:11px'>";

        // Encabezado
        $out .= "<tr><td colspan='9' style='background:#6b2d8b;color:#e91e8c;font-size:14px;font-weight:bold;padding:8px'>FashFind — Reporte de Ventas Quincenales</td></tr>";
        $out .= "<tr><td colspan='9' style='padding:4px'>Período: {$inicio_quincena} al {$fin_quincena} &nbsp;|&nbsp; Total ventas: {$total_ventas} &nbsp;|&nbsp; Total ingresos: $" . number_format($total_ingresos, 0, ',', '.') . "</td></tr>";
        $out .= "<tr><td colspan='9'></td></tr>";

        foreach ($ventas as $v) {
            $cliente = $v['nombres'] . ' ' . $v['apellidos'];
            // Fila cabecera venta
            $out .= "<tr style='background:#e91e8c;color:white;font-weight:bold'>"
                  . "<td colspan='9' style='padding:5px'>Venta #{$v['id_venta']} — {$v['fecha_venta']} {$v['hora']} — Cliente: {$cliente} (CC: {$v['cc']}) — Método: {$v['metodo_pago']} — Recibido: $" . number_format($v['pago_recibido'],0,',','.') . " — Cambio: $" . number_format($v['cambio'],0,',','.') . "</td>"
                  . "</tr>";
            // Cabecera columnas
            $out .= "<tr style='background:#dcdcdc;font-weight:bold'>"
                  . "<td style='padding:4px'>Producto</td><td>Talla</td><td>Color</td>"
                  . "<td style='text-align:center'>Cant.</td><td style='text-align:right'>Precio Unit.</td>"
                  . "<td style='text-align:right'>Subtotal</td><td colspan='3'></td></tr>";
            // Detalles
            foreach ($v['detalles'] as $d) {
                $out .= "<tr><td style='padding:4px'>" . htmlspecialchars($d['nombre_producto']) . "</td>"
                      . "<td>" . htmlspecialchars($d['talla']) . "</td>"
                      . "<td>" . htmlspecialchars($d['color']) . "</td>"
                      . "<td style='text-align:center'>{$d['cantidad']}</td>"
                      . "<td style='text-align:right'>$" . number_format($d['precio'],0,',','.') . "</td>"
                      . "<td style='text-align:right'>$" . number_format($d['sub_total'],0,',','.') . "</td>"
                      . "<td colspan='3'></td></tr>";
            }
            // Total venta
            $out .= "<tr style='background:#6b2d8b;color:#e91e8c;font-weight:bold'>"
                  . "<td colspan='5' style='text-align:right;padding:4px'>TOTAL VENTA:</td>"
                  . "<td style='text-align:right'>$" . number_format($v['costo_total'],0,',','.') . "</td>"
                  . "<td colspan='3'></td></tr>";
            $out .= "<tr><td colspan='9'></td></tr>";
        }

        $out .= "</table>";
        echo $out;
        exit;
    }

    // ── PDF (HTML + window.print) ────────────────────────────────
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
  body{font-family:Arial,sans-serif;font-size:12px;color:#333}
  .header{background:#6b2d8b;color:white;padding:20px 24px;display:flex;justify-content:space-between;align-items:center}
  .header-titulo{color:#e91e8c;font-size:22px;font-weight:bold}
  .header-sub{color:#ccc;font-size:11px;margin-top:4px}
  .header-fecha{color:#aaa;font-size:10px}
  .resumen{background:#f5f5f5;margin:16px;padding:14px;border-radius:4px;display:flex;gap:40px}
  .resumen-item label{font-weight:bold;font-size:10px;color:#6b2d8b;display:block}
  .resumen-item span{font-size:11px;color:#555}
  .venta-bloque{margin:0 16px 18px 16px;border:1px solid #eee;border-radius:4px;overflow:hidden}
  .venta-header{background:#e91e8c;color:white;padding:7px 12px;display:flex;justify-content:space-between;font-weight:bold;font-size:11px}
  .venta-info{background:#fcfcfc;padding:8px 12px;border-bottom:1px solid #eee}
  .venta-info p{font-size:10px;color:#555;margin-bottom:3px}
  .tabla-productos{width:100%;border-collapse:collapse;font-size:10px}
  .tabla-productos thead tr{background:#dcdcdc}
  .tabla-productos th{padding:5px 8px;text-align:left;font-size:9px;color:#282828}
  .tabla-productos td{padding:5px 8px;border-bottom:1px solid #f0f0f0}
  .venta-total{background:#6b2d8b;color:white;padding:6px 12px;text-align:right;font-size:11px}
  .venta-total strong{color:#e91e8c}
  .footer{background:#6b2d8b;color:#aaa;text-align:center;padding:10px;font-size:9px;margin-top:20px}
  @media print{.venta-bloque{page-break-inside:avoid}}
</style>
</head>
<body>
<div class='header'>
  <div>
    <div class='header-titulo'>FashFind</div>
    <div class='header-sub'>Reporte de Ventas Quincenales</div>
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
<script>{$autoprint}</script>
</body></html>";

} catch (PDOException $e) {
    echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
}