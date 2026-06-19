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
        header('Content-Type: application/vnd.ms-excel; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $nombreArchivo . '.xls"');
        header('Cache-Control: max-age=0');

        echo "\xEF\xBB\xBF"; // BOM UTF-8

        $out  = "<table border='1' style='border-collapse:collapse;font-family:Arial;font-size:11px'>";

        // Encabezado
        $out .= "<tr><td colspan='8' style='background:#6b2d8b;color:#e91e8c;font-size:14px;font-weight:bold;padding:8px'>FashFind — Reporte Quincenal de Pedidos</td></tr>";
        $out .= "<tr><td colspan='8' style='padding:4px'>Generado: {$fechaHoy} | Últimos 15 días &nbsp;|&nbsp; Total pedidos: {$total_pedidos} &nbsp;|&nbsp; Monto total: $" . number_format($monto_total) . "</td></tr>";
        $out .= "<tr><td colspan='8'></td></tr>";

        // Detalles
        foreach ($pedidos as $ped) {
            $estadoColor = $ped['estado'] === 'Entregado' ? '#27ae60' : ($ped['estado'] === 'Cancelado' ? '#e74c3c' : '#f39c12');
            
            $out .= "<tr style='background:#e91e8c;color:white;font-weight:bold'>"
                  . "<td colspan='8' style='padding:4px'>Pedido #" . htmlspecialchars($ped['id_pedido']) . " | " . htmlspecialchars($ped['fecha_pedido']) . " | Usuario: " . htmlspecialchars($ped['id_usuario']) . " | <span style='background:{$estadoColor};padding:2px 6px;border-radius:2px'>" . htmlspecialchars($ped['estado']) . "</span></td>"
                  . "</tr>";
            
            $out .= "<tr style='background:#dcdcdc;font-weight:bold;font-size:10px'>"
                  . "<td style='padding:4px'>Producto</td><td style='text-align:center'>Cantidad</td><td style='text-align:right'>Precio</td>"
                  . "<td style='text-align:right'>Subtotal</td><td colspan='4'></td>"
                  . "</tr>";

            foreach ($ped['detalles'] as $det) {
                $out .= "<tr>"
                      . "<td style='padding:4px'>" . htmlspecialchars($det['nombre_producto']) . "</td>"
                      . "<td style='text-align:center'>" . htmlspecialchars($det['cantidad']) . "</td>"
                      . "<td style='text-align:right'>" . htmlspecialchars($det['precio']) . "</td>"
                      . "<td style='text-align:right'>" . htmlspecialchars($det['sub_total']) . "</td>"
                      . "<td colspan='4'></td>"
                      . "</tr>";
            }

            $subtotal = $ped['total_pedido'] - $ped['costo_envio'];
            $out .= "<tr style='background:#f5f5f5;font-weight:bold;font-size:10px'>"
                  . "<td colspan='3' style='text-align:right;padding:4px'>Subtotal:</td><td style='text-align:right'>$" . number_format($subtotal) . "</td><td colspan='4'></td>"
                  . "</tr>";
            $out .= "<tr style='background:#f5f5f5;font-weight:bold;font-size:10px'>"
                  . "<td colspan='3' style='text-align:right;padding:4px'>Envío:</td><td style='text-align:right'>$" . number_format($ped['costo_envio']) . "</td><td colspan='4'></td>"
                  . "</tr>";
            $out .= "<tr style='background:#e91e8c;color:white;font-weight:bold'>"
                  . "<td colspan='3' style='text-align:right;padding:4px'>TOTAL:</td><td style='text-align:right'>$" . number_format($ped['total_pedido']) . "</td><td colspan='4'></td>"
                  . "</tr>";
            
            $out .= "<tr style='height:12px'><td colspan='8'></td></tr>";
        }

        $out .= "</table>";
        echo $out;
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
        foreach ($ped['detalles'] as $det) {
            $nombre_prod = htmlspecialchars($det['nombre_producto']);
            $detalles_html .= "
            <tr>
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
                <span style='background:{$estado_color};color:white;padding:2px 8px;border-radius:3px;font-size:10px'>{$estado}</span>
            </div>
            <div class='pedido-info'>
                <p><strong>Fecha:</strong> {$fecha} | <strong>Hora:</strong> {$hora} | <strong>Usuario ID:</strong> {$ped['id_usuario']}</p>
                <p><strong>Pago:</strong> {$metodo_pago} | <strong>Entrega:</strong> {$tipo_entrega} | <strong>Fecha Entrega:</strong> {$fecha_entrega}</p>
                <p><strong>Destino:</strong> {$direccion}, {$ciudad} | <strong>Teléfono:</strong> {$telefono}</p>
            </div>
            <div class='pedido-detalles'>
                <table style='width:100%;border-collapse:collapse'>
                    <tr style='background:#e91e8c;color:white;font-weight:bold;font-size:10px'>
                        <td style='padding:6px'>Producto</td>
                        <td style='text-align:center'>Cantidad</td>
                        <td style='text-align:right'>Precio</td>
                        <td style='text-align:right'>Subtotal</td>
                    </tr>
                    {$detalles_html}
                </table>
            </div>
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
<title>Reporte Quincenal de Pedidos</title>
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
  .pedido-bloque{margin:0 16px 18px 16px;border:1px solid #eee;border-radius:4px;overflow:hidden;page-break-inside:avoid}
  .pedido-header{background:#e91e8c;color:white;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;font-weight:bold;font-size:11px}
  .pedido-info{background:#fcfcfc;padding:8px 12px;border-bottom:1px solid #eee}
  .pedido-info p{font-size:10px;color:#555;margin-bottom:3px}
  .pedido-detalles{background:#f9f9f9;padding:8px 12px;border-bottom:1px solid #eee}
  .pedido-detalles table{font-size:10px;width:100%}
  .pedido-detalles td{border-bottom:1px solid #eee}
  .pedido-totales{background:#fcfcfc;padding:8px 12px;text-align:right}
  .pedido-totales p{font-size:10px;color:#555;margin-bottom:2px}
  .footer{background:#6b2d8b;color:#aaa;text-align:center;padding:10px;font-size:9px;margin-top:20px}
  @media print{.pedido-bloque{page-break-inside:avoid}}
</style>
</head>
<body>
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
<script>window.onload=function(){window.print();}</script>
</body></html>";

} catch (PDOException $e) {
    echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
}
?>