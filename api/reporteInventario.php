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

    // Todos los inventarios activos
    $sqlInventarios = "
        SELECT i.id_inventario, i.stock_disponible, i.stock_minimo, i.estado,
               p.id_producto, p.nombre_producto, p.talla, p.color
        FROM Inventario i
        INNER JOIN Producto p ON i.id_producto = p.id_producto
        WHERE i.estado = 'Activo'
        ORDER BY i.id_inventario DESC
    ";
    $stmtInventarios = $pdo->prepare($sqlInventarios);
    $stmtInventarios->execute();
    $inventarios = $stmtInventarios->fetchAll(PDO::FETCH_ASSOC);

    $total_inventarios = count($inventarios);
    $stock_total       = array_sum(array_column($inventarios, 'stock_disponible'));
    $fechaHoy          = (new DateTime())->format('d/m/Y');
    $nombreArchivo     = 'reporte_inventario_' . date('Y-m-d');

    // ── JSON (para la app móvil) ─────────────────────────────────
    if ($formato === 'json') {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'fecha_generacion'  => $fechaHoy,
            'total_inventarios' => $total_inventarios,
            'stock_total'       => $stock_total,
            'inventarios'       => $inventarios,
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
  tr.header { background-color: #e91e8c; color: white; font-weight: bold; }
  tr.subheader { background-color: #fde8f3; color: #c0166e; font-weight: bold; }
  tr.data-odd { background-color: #ffffff; }
  tr.data-even { background-color: #fff7fb; }
  td { border: 1px solid #e91e8c; padding: 6px; font-family: Arial; font-size: 10px; }
  td.header { background-color: #e91e8c; color: white; border: 1px solid #e91e8c; }
  td.subheader { background-color: #fde8f3; color: #c0166e; font-weight: bold; border: 1px solid #e91e8c; }
  td.title { background-color: #e91e8c; color: white; font-weight: bold; font-size: 14px; padding: 10px; }
  td.info { background-color: #fff0f7; color: #555; font-size: 11px; padding: 6px; }
</style>
</head>
<body>
<table border='1' cellpadding='6' cellspacing='0' style='border-collapse:collapse;'>
<tr><td colspan='7' bgcolor='#e91e8c' style='color:white;font-weight:bold;font-size:14px;'>FashFind — Reporte de Inventario Completo</td></tr>
<tr><td colspan='7' bgcolor='#fff0f7' style='color:#555;font-size:11px;'>Generado: {$fechaHoy} &nbsp;|&nbsp; Total inventarios: {$total_inventarios} &nbsp;|&nbsp; Stock total: {$stock_total} unidades</td></tr>
<tr><td colspan='7'>&nbsp;</td></tr>";

        foreach ($inventarios as $inv) {
            $html .= "
<tr><td colspan='7' bgcolor='#e91e8c' style='color:white;font-weight:bold;'>Inventario #{$inv['id_inventario']}</td></tr>
<tr>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;'>Producto</td>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;'>ID Prod.</td>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;'>Talla</td>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;'>Color</td>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;text-align:center;'>Stock Disp.</td>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;text-align:center;'>Stock Mín.</td>
  <td bgcolor='#fde8f3' style='color:#c0166e;font-weight:bold;text-align:center;'>Estado</td>
</tr>
<tr bgcolor='#ffffff'>
  <td>" . htmlspecialchars($inv['nombre_producto']) . "</td>
  <td>" . htmlspecialchars($inv['id_producto']) . "</td>
  <td>" . htmlspecialchars($inv['talla']) . "</td>
  <td>" . htmlspecialchars($inv['color']) . "</td>
  <td align='center'>" . htmlspecialchars($inv['stock_disponible']) . "</td>
  <td align='center'>" . htmlspecialchars($inv['stock_minimo']) . "</td>
  <td align='center'>" . htmlspecialchars($inv['estado']) . "</td>
</tr>
<tr><td colspan='7'>&nbsp;</td></tr>";
        }

        $html .= "
<tr><td colspan='7' bgcolor='#e91e8c' style='color:#ffd6ec;text-align:center;font-size:9px;padding:10px;'>FashFind — Reporte generado automáticamente</td></tr>
</table>
</body>
</html>";

        echo $html;
        exit;
    }

    // ── PDF (HTML + window.print) ────────────────────────────────
    $autoprint = ($formato === 'pdf') ? "window.onload=function(){window.print();}" : "";

    $filas_inventarios = '';
    foreach ($inventarios as $inv) {
        $nombre_producto = htmlspecialchars($inv['nombre_producto']);
        $talla           = htmlspecialchars($inv['talla']);
        $color           = htmlspecialchars($inv['color']);
        $estado          = htmlspecialchars($inv['estado']);

        $filas_inventarios .= "
        <div class='inventario-bloque'>
            <div class='inventario-header'>
                <span>Inventario #{$inv['id_inventario']}</span>
                <span>{$estado}</span>
            </div>
            <div class='inventario-info'>
                <p><strong>Producto:</strong> {$nombre_producto} &nbsp;|&nbsp; <strong>ID Producto:</strong> {$inv['id_producto']}</p>
                <p><strong>Talla:</strong> {$talla} &nbsp;|&nbsp; <strong>Color:</strong> {$color}</p>
            </div>
            <div class='inventario-stock'>
                <div class='stock-item'>
                    <label>Stock Disponible</label>
                    <span class='stock-valor'>{$inv['stock_disponible']}</span> unidades
                </div>
                <div class='stock-item'>
                    <label>Stock Mínimo</label>
                    <span class='stock-valor'>{$inv['stock_minimo']}</span> unidades
                </div>
            </div>
        </div>";
    }

    header('Content-Type: text/html; charset=utf-8');
    echo "<!DOCTYPE html>
<html lang='es'>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1'>
<title>Reporte de Inventario</title>
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
  .inventario-bloque{margin:0 16px 16px 16px;border:1px solid #f9c0dd;border-radius:6px;overflow:hidden;page-break-inside:avoid}
  .inventario-header{background:#e91e8c;color:white;padding:7px 12px;display:flex;justify-content:space-between;font-weight:bold;font-size:11px}
  .inventario-info{background:#fff7fb;padding:8px 12px;border-bottom:1px solid #f9c0dd}
  .inventario-info p{font-size:10px;color:#555;margin-bottom:3px}
  .inventario-stock{background:#fff7fb;padding:8px 12px;display:flex;gap:30px;border-top:1px solid #f9c0dd}
  .stock-item{display:flex;flex-direction:column;gap:4px}
  .stock-item label{font-size:9px;color:#c0166e;font-weight:bold}
  .stock-valor{font-size:16px;color:#e91e8c;font-weight:bold}
  .footer{background:#e91e8c;color:#ffd6ec;text-align:center;padding:10px;font-size:9px;margin-top:20px}
  @media print{body{background:#fff}.pagina{max-width:100%}.inventario-bloque{page-break-inside:avoid}}
</style>
</head>
<body>
<div class='pagina'>
<div class='header'>
  <div>
    <div class='header-titulo'>FashFind</div>
    <div class='header-sub'>Reporte de Inventario Completo</div>
  </div>
  <div class='header-fecha'>Generado: {$fechaHoy}</div>
</div>
<div class='resumen'>
  <div class='resumen-item'><label>Total Inventarios</label><span>{$total_inventarios}</span></div>
  <div class='resumen-item'><label>Stock Total</label><span>{$stock_total} unidades</span></div>
</div>
{$filas_inventarios}
<div class='footer'>FashFind &mdash; Reporte generado automáticamente</div>
</div>
<script>{$autoprint}</script>
</body></html>";

} catch (PDOException $e) {
    echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
}
?>