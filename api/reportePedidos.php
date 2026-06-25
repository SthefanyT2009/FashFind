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

    // Pedidos activos de los últimos 15 días (excluyendo cancelados)
    $sqlPedidos = "
        SELECT p.id_pedido, p.fecha_pedido, p.hora_pedido, p.metodo_pago,
               p.total_pedido, p.costo_envio, p.tipo_entrega, p.direccion_entrega,
               p.ciudad_entrega, p.telefono_contacto, p.fecha_entrega, p.estado, p.id_usuario
        FROM Pedido p
        WHERE p.fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 15 DAY)
        AND p.estado != 'Cancelado'
        ORDER BY p.id_pedido DESC
    ";
    $stmtPedidos = $pdo->prepare($sqlPedidos);
    $stmtPedidos->execute();
    $pedidosList = $stmtPedidos->fetchAll(PDO::FETCH_ASSOC);

    // Obtener detalles para cada pedido
    $sqlDetalles = "
        SELECT dp.id_detalle_pedido, dp.cantidad, dp.precio, dp.sub_total,
               pr.nombre_producto, dp.id_pedido
        FROM Detalle_Pedido dp
        INNER JOIN Producto pr ON dp.id_producto = pr.id_producto
        WHERE dp.id_pedido = ?
        ORDER BY dp.id_detalle_pedido ASC
    ";
    $stmtDetalles = $pdo->prepare($sqlDetalles);

    $pedidos = [];
    foreach ($pedidosList as $pedido) {
        $stmtDetalles->execute([$pedido['id_pedido']]);
        $detalles = $stmtDetalles->fetchAll(PDO::FETCH_ASSOC);
        $pedido['detalles'] = $detalles;
        $pedidos[] = $pedido;
    }

    $total_pedidos = count($pedidos);
    $monto_total   = array_sum(array_column($pedidos, 'total_pedido'));
    $fechaHoy      = (new DateTime())->format('d/m/Y');
    $nombreArchivo = 'reporte_pedidos_quincenal_' . date('Y-m-d');

    // ── JSON (para la app móvil) ─────────────────────────────────
    if ($formato === 'json') {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'fecha_generacion'  => $fechaHoy,
            'total_pedidos'     => $total_pedidos,
            'monto_total'       => $monto_total,
            'pedidos'           => $pedidos,
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
<tr><td colspan='4' bgcolor='#e91e8c' style='color:white;font-weight:bold;font-size:14px;'>FashFind — Reporte Quincenal de Pedidos</td></tr>
<tr><td colspan='4' bgcolor='#fff0f7' style='color:#555;font-size:11px;'>Generado: {$fechaHoy} | Últimos 15 días &nbsp;|&nbsp; Total pedidos: {$total_pedidos} &nbsp;|&nbsp; Monto total: \$" . number_format($monto_total) . "</td></tr>
<tr><td colspan='4'>&nbsp;</td></tr>";

        foreach ($pedidos as $ped) {
            $subtotal = $ped['total_pedido'] - $ped['costo_envio'];
            
            $html .= "
<tr><td colspan='4' bgcolor='#e91e8c' style='color:white;font-weight:bold;'>Pedido #{$ped['id_pedido']} | " . htmlspecialchars($ped['fecha_pedido']) . " | Usuario: {$ped['id_usuario']}</td></tr>
<tr>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;'>Producto</td>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;text-align:center;'>Cantidad</td>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;text-align:right;'>Precio</td>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;text-align:right;'>Subtotal</td>
</tr>";

            foreach ($ped['detalles'] as $i => $det) {
                $bg = $i % 2 === 0 ? '#ffffff' : '#fff7fb';
                $html .= "
<tr bgcolor='{$bg}'>
  <td>" . htmlspecialchars($det['nombre_producto']) . "</td>
  <td align='center'>" . htmlspecialchars($det['cantidad']) . "</td>
  <td align='right'>\$" . number_format($det['precio']) . "</td>
  <td align='right'>\$" . number_format($det['sub_total']) . "</td>
</tr>";
            }

            $html .= "
<tr bgcolor='#f9c0dd'>
  <td colspan='3' align='right' style='color:#c0166e;font-weight:bold;'>Subtotal:</td>
  <td align='right' style='color:#c0166e;font-weight:bold;'>\$" . number_format($subtotal) . "</td>
</tr>
<tr bgcolor='#f9c0dd'>
  <td colspan='3' align='right' style='color:#c0166e;font-weight:bold;'>Envío:</td>
  <td align='right' style='color:#c0166e;font-weight:bold;'>\$" . number_format($ped['costo_envio']) . "</td>
</tr>
<tr bgcolor='#e91e8c'>
  <td colspan='3' align='right' style='color:white;font-weight:bold;'>TOTAL:</td>
  <td align='right' style='color:white;font-weight:bold;'>\$" . number_format($ped['total_pedido']) . "</td>
</tr>
<tr><td colspan='4'>&nbsp;</td></tr>";
        }

        $html .= "
<tr><td colspan='4' bgcolor='#e91e8c' style='color:#ffd6ec;text-align:center;font-size:9px;padding:10px;'>FashFind — Reporte generado automáticamente</td></tr>
</table>
</body>
</html>";

        echo $html;
        exit;
    }

    // ── PDF (HTML + window.print) ────────────────────────────────
    $filas_pedidos = '';
    foreach ($pedidos as $ped) {
        $estado_color = $ped['estado'] === 'Entregado' ? '#27ae60' : ($ped['estado'] === 'Cancelado' ? '#e74c3c' : '#f39c12');
        $fecha        = htmlspecialchars($ped['fecha_pedido']);
        $hora         = htmlspecialchars($ped['hora_pedido']);
        $metodo_pago  = htmlspecialchars($ped['metodo_pago']);
        $tipo_entrega = htmlspecialchars($ped['tipo_entrega']);
        $direccion    = htmlspecialchars($ped['direccion_entrega']);
        $ciudad       = htmlspecialchars($ped['ciudad_entrega']);
        $telefono     = htmlspecialchars($ped['telefono_contacto']);
        $fecha_entrega = htmlspecialchars($ped['fecha_entrega']);
        $estado       = htmlspecialchars($ped['estado']);
        $subtotal     = $ped['total_pedido'] - $ped['costo_envio'];

        $detalles_html = '';
        foreach ($ped['detalles'] as $i => $det) {
            $bg = $i % 2 === 0 ? '#ffffff' : '#f8f8f8';
            $nombre_prod = htmlspecialchars($det['nombre_producto']);
            $detalles_html .= "
            <tr style='background:{$bg}'>
              <td style='padding:6px'>{$nombre_prod}</td>
              <td style='text-align:center'>" . htmlspecialchars($det['cantidad']) . "</td>
              <td style='text-align:right'>\$" . number_format($det['precio']) . "</td>
              <td style='text-align:right'>\$" . number_format($det['sub_total']) . "</td>
            </tr>";
        }

        $filas_pedidos .= "
        <div class='pedido-bloque'>
            <div class='pedido-header'>
                <span>Pedido #{$ped['id_pedido']}</span>
                <span>{$fecha} &nbsp; {$hora}</span>
            </div>
            <div class='pedido-info'>
                <p><strong>Usuario ID:</strong> {$ped['id_usuario']} &nbsp;|&nbsp; <strong>Método:</strong> {$metodo_pago}</p>
                <p><strong>Tipo Entrega:</strong> {$tipo_entrega} &nbsp;|&nbsp; <strong>Destino:</strong> {$direccion}, {$ciudad}</p>
                <p><strong>Teléfono:</strong> {$telefono} &nbsp;|&nbsp; <strong>Fecha Entrega:</strong> {$fecha_entrega} &nbsp;|&nbsp; <strong>Estado:</strong> {$estado}</p>
            </div>
            <table class='tabla-productos'>
                <thead>
                    <tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr>
                </thead>
                <tbody>{$detalles_html}</tbody>
            </table>
            <div class='pedido-totales'>
                <p><strong>Subtotal:</strong> \$" . number_format($subtotal) . "</p>
                <p><strong>Envío:</strong> \$" . number_format($ped['costo_envio']) . "</p>
                <p style='font-size:13px;color:#e91e8c'><strong>Total Pedido:</strong> \$" . number_format($ped['total_pedido']) . "</p>
            </div>
        </div>";
    }

    header('Content-Type: text/html; charset=utf-8');
    echo "<!DOCTYPE html>
<html lang='es'>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1'>
<title>Reporte Quincenal de Pedidos</title>
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
  .pedido-bloque{margin:0 16px 16px 16px;border:1px solid #f9c0dd;border-radius:6px;overflow:hidden;page-break-inside:avoid}
  .pedido-header{background:#e91e8c;color:white;padding:7px 12px;display:flex;justify-content:space-between;font-weight:bold;font-size:11px}
  .pedido-info{background:#fff7fb;padding:8px 12px;border-bottom:1px solid #f9c0dd}
  .pedido-info p{font-size:10px;color:#555;margin-bottom:3px}
  .tabla-productos{width:100%;border-collapse:collapse;font-size:10px}
  .tabla-productos thead tr{background:#fde8f3}
  .tabla-productos th{padding:5px 8px;text-align:left;font-size:9px;color:#c0166e;border-bottom:2px solid #e91e8c}
  .tabla-productos td{padding:5px 8px;border-bottom:1px solid #fde8f3}
  .pedido-totales{background:#fff7fb;padding:8px 12px;text-align:right;border-top:1px solid #f9c0dd}
  .pedido-totales p{font-size:10px;color:#555;margin-bottom:2px}
  .footer{background:#e91e8c;color:#ffd6ec;text-align:center;padding:10px;font-size:9px;margin-top:20px}
  @media print{body{background:#fff}.pagina{max-width:100%}.pedido-bloque{page-break-inside:avoid}}
</style>
</head>
<body>
<div class='pagina'>
<div class='header'>
  <div>
    <div class='header-titulo'>FashFind</div>
    <div class='header-sub'>Reporte Quincenal de Pedidos</div>
  </div>
  <div class='header-fecha'>Generado: {$fechaHoy}</div>
</div>
<div class='resumen'>
  <div class='resumen-item'><label>Total Pedidos</label><span>{$total_pedidos}</span></div>
  <div class='resumen-item'><label>Monto Total</label><span>\$" . number_format($monto_total) . "</span></div>
</div>
{$filas_pedidos}
<div class='footer'>FashFind &mdash; Reporte generado automáticamente</div>
</div>
<script>window.onload=function(){window.print();}</script>
</body></html>";

} catch (PDOException $e) {
    echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
}
?>