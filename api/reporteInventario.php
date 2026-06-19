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
               p.id_producto, p.nombre_producto, p.categoria, p.talla, p.color
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
        header('Content-Type: application/vnd.ms-excel; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $nombreArchivo . '.xls"');
        header('Cache-Control: max-age=0');

        echo "\xEF\xBB\xBF"; // BOM UTF-8

        $out  = "<table border='1' style='border-collapse:collapse;font-family:Arial;font-size:11px'>";

        // Encabezado
        $out .= "<tr><td colspan='9' style='background:#6b2d8b;color:#e91e8c;font-size:14px;font-weight:bold;padding:8px'>FashFind — Reporte de Inventario</td></tr>";
        $out .= "<tr><td colspan='9' style='padding:4px'>Generado: {$fechaHoy} &nbsp;|&nbsp; Total inventarios: {$total_inventarios} &nbsp;|&nbsp; Stock total: {$stock_total} unidades</td></tr>";
        $out .= "<tr><td colspan='9'></td></tr>";

        // Cabecera columnas
        $out .= "<tr style='background:#dcdcdc;font-weight:bold'>"
              . "<td style='padding:4px'>ID Inv.</td><td>Producto</td><td>ID Prod.</td>"
              . "<td>Categoría</td><td>Talla</td><td>Color</td>"
              . "<td style='text-align:center'>Stock Disp.</td><td style='text-align:center'>Stock Mín.</td>"
              . "<td style='text-align:center'>Estado</td></tr>";

        // Detalles
        foreach ($inventarios as $inv) {
            $estadoColor = $inv['estado'] === 'Activo' ? '#27ae60' : '#e74c3c';
            $out .= "<tr>"
                  . "<td style='padding:4px'>" . htmlspecialchars($inv['id_inventario']) . "</td>"
                  . "<td>" . htmlspecialchars($inv['nombre_producto']) . "</td>"
                  . "<td style='text-align:center'>" . htmlspecialchars($inv['id_producto']) . "</td>"
                  . "<td>" . htmlspecialchars($inv['categoria']) . "</td>"
                  . "<td style='text-align:center'>" . htmlspecialchars($inv['talla']) . "</td>"
                  . "<td style='text-align:center'>" . htmlspecialchars($inv['color']) . "</td>"
                  . "<td style='text-align:center;font-weight:bold'>" . htmlspecialchars($inv['stock_disponible']) . "</td>"
                  . "<td style='text-align:center'>" . htmlspecialchars($inv['stock_minimo']) . "</td>"
                  . "<td style='text-align:center;background:{$estadoColor};color:white;font-weight:bold'>" . htmlspecialchars($inv['estado']) . "</td>"
                  . "</tr>";
        }

        $out .= "</table>";
        echo $out;
        exit;
    }

    // ── PDF (HTML + window.print) ────────────────────────────────
    $autoprint = ($formato === 'pdf') ? "window.onload=function(){window.print();}" : "";

    $filas_inventarios = '';
    foreach ($inventarios as $inv) {
        $nombre_producto = htmlspecialchars($inv['nombre_producto']);
        $categoria       = htmlspecialchars($inv['categoria']);
        $talla           = htmlspecialchars($inv['talla']);
        $color           = htmlspecialchars($inv['color']);
        $estado          = htmlspecialchars($inv['estado']);
        $estado_color    = $inv['estado'] === 'Activo' ? '#27ae60' : '#e74c3c';

        $filas_inventarios .= "
        <div class='inventario-bloque'>
            <div class='inventario-header'>
                <span>Inventario #{$inv['id_inventario']}</span>
                <span style='background:{$estado_color};color:white;padding:2px 8px;border-radius:3px;font-size:10px'>{$estado}</span>
            </div>
            <div class='inventario-info'>
                <p><strong>Producto:</strong> {$nombre_producto} &nbsp;|&nbsp; <strong>ID Producto:</strong> {$inv['id_producto']}</p>
                <p><strong>Categoría:</strong> {$categoria} &nbsp;|&nbsp; <strong>Talla:</strong> {$talla} &nbsp;|&nbsp; <strong>Color:</strong> {$color}</p>
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
<title>Reporte de Inventario</title>
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
  .inventario-bloque{margin:0 16px 18px 16px;border:1px solid #eee;border-radius:4px;overflow:hidden}
  .inventario-header{background:#e91e8c;color:white;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;font-weight:bold;font-size:11px}
  .inventario-info{background:#fcfcfc;padding:8px 12px;border-bottom:1px solid #eee}
  .inventario-info p{font-size:10px;color:#555;margin-bottom:3px}
  .inventario-stock{background:#f9f9f9;padding:12px;display:flex;gap:30px;border-top:1px solid #eee}
  .stock-item{display:flex;flex-direction:column;gap:4px}
  .stock-item label{font-size:9px;color:#777;font-weight:bold}
  .stock-valor{font-size:16px;color:#e91e8c;font-weight:bold}
  .footer{background:#6b2d8b;color:#aaa;text-align:center;padding:10px;font-size:9px;margin-top:20px}
  @media print{.inventario-bloque{page-break-inside:avoid}}
</style>
</head>
<body>
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
<script>{$autoprint}</script>
</body></html>";

} catch (PDOException $e) {
    echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
}
?>