import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

// URL base según plataforma
const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost/FashFind/api'
  : 'http://192.168.1.7/FashFind/api';

// Colores FashFind
const ROSA       = '#e91e8c';
const ROSA_CLARO = '#fde8f3';
const ROSA_MEDIO = '#f9c0dd';
const ROSA_TEXT  = '#c0166e';
const ROSA_FONDO = '#fff0f7';

export type TipoReporte = 'ventas' | 'inventario' | 'pedidos';

// ─── Tipos de datos ─────────────────────────────────────────────────────────
interface DetalleVenta {
  nombre_producto: string;
  talla: string;
  color: string;
  cantidad: number;
  precio: number;
  sub_total: number;
}
interface Venta {
  id_venta: number;
  fecha_venta: string;
  hora: string;
  metodo_pago: string;
  costo_total: number;
  pago_recibido: number;
  cambio: number;
  nombres: string;
  apellidos: string;
  cc: string;
  detalles: DetalleVenta[];
}
interface DatosVentas {
  ventas: Venta[];
  inicio_quincena: string;
  fin_quincena: string;
  total_ventas: number;
  total_ingresos: number;
}

interface ItemInventario {
  id_inventario: number;
  id_producto: number;
  nombre_producto: string;
  talla: string;
  color: string;
  stock_disponible: number;
  stock_minimo: number;
  estado: string;
}
interface DatosInventario {
  fecha_generacion: string;
  total_inventarios: number;
  stock_total: number;
  inventarios: ItemInventario[];
}

interface DetallePedido {
  id_detalle_pedido: number;
  nombre_producto: string;
  cantidad: number;
  precio: number;
  sub_total: number;
}
interface ItemPedido {
  id_pedido: number;
  fecha_pedido: string;
  hora_pedido: string;
  metodo_pago: string;
  total_pedido: number;
  costo_envio: number;
  tipo_entrega: string;
  direccion_entrega: string;
  ciudad_entrega: string;
  telefono_contacto: number;
  fecha_entrega: string;
  estado: string;
  id_usuario: number;
  detalles: DetallePedido[];
}
interface DatosPedidos {
  fecha_generacion: string;
  total_pedidos: number;
  monto_total: number;
  pedidos: ItemPedido[];
}

type DatosReporte = DatosVentas | DatosInventario | DatosPedidos;

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatNum(n: number) {
  return '$' + Number(n).toLocaleString('es-CO', { minimumFractionDigits: 0 });
}

async function obtenerDatos(endpoint: string): Promise<DatosReporte> {
  const url = `${BASE_URL}/${endpoint}?formato=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
  return res.json();
}

function nombreArchivoBase(tipo: TipoReporte, datos: any): string {
  if (tipo === 'ventas') {
    return `Reporte_Ventas_${String(datos.inicio_quincena).replace(/-/g, '')}`;
  }
  if (tipo === 'inventario') {
    return `Reporte_Inventario_${String(datos.fecha_generacion).replace(/\//g, '-')}`;
  }
  return `Reporte_Pedidos_Quincenal_${String(datos.fecha_generacion).replace(/\//g, '-')}`;
}

// ─── HTML PARA PDF (idéntico al estilo ya usado en cada reporte) ────────────
function generarHTMLVentas(datos: DatosVentas): string {
  const { ventas, inicio_quincena, fin_quincena, total_ventas, total_ingresos } = datos;
  const hoy = new Date().toLocaleDateString('es-CO');

  const bloques = ventas.map(v => {
    const filas = v.detalles.map((d, i) => `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8f8f8'}">
        <td>${d.nombre_producto}</td>
        <td style="text-align:center">${d.talla}</td>
        <td style="text-align:center">${d.color}</td>
        <td style="text-align:center">${d.cantidad}</td>
        <td style="text-align:right">${formatNum(d.precio)}</td>
        <td style="text-align:right">${formatNum(d.sub_total)}</td>
      </tr>`).join('');

    return `
    <div class="venta-bloque">
      <div class="venta-header">
        <span>Venta #${v.id_venta}</span>
        <span>${v.fecha_venta} &nbsp; ${v.hora}</span>
      </div>
      <div class="venta-info">
        <p><strong>Cliente:</strong> ${v.nombres} ${v.apellidos} &nbsp;|&nbsp; <strong>CC:</strong> ${v.cc}</p>
        <p><strong>Método:</strong> ${v.metodo_pago} &nbsp;|&nbsp; <strong>Recibido:</strong> ${formatNum(v.pago_recibido)} &nbsp;|&nbsp; <strong>Cambio:</strong> ${formatNum(v.cambio)}</p>
      </div>
      <table class="tabla-productos">
        <thead>
          <tr><th>Producto</th><th>Talla</th><th>Color</th><th>Cant.</th><th>Precio Unit.</th><th>Subtotal</th></tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
      <div class="venta-total">TOTAL VENTA: <strong>${formatNum(v.costo_total)}</strong></div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reporte de Ventas</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #333; background: #f0f0f0 }
  .pagina { max-width: 700px; margin: 0 auto; background: #fff; padding: 0 0 20px 0 }
  .header { background: ${ROSA}; color: white; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center }
  .header-titulo { color: #fff; font-size: 22px; font-weight: bold; letter-spacing: 1px }
  .header-sub { color: #ffd6ec; font-size: 11px; margin-top: 4px }
  .header-fecha { color: #ffd6ec; font-size: 10px }
  .resumen { background: #fff0f7; margin: 16px; padding: 12px 16px; border-radius: 6px; display: flex; gap: 32px; border-left: 4px solid ${ROSA} }
  .resumen-item label { font-weight: bold; font-size: 10px; color: ${ROSA}; display: block; margin-bottom: 2px }
  .resumen-item span { font-size: 11px; color: #555 }
  .venta-bloque { margin: 0 16px 16px 16px; border: 1px solid ${ROSA_MEDIO}; border-radius: 6px; overflow: hidden; page-break-inside: avoid }
  .venta-header { background: ${ROSA}; color: white; padding: 7px 12px; display: flex; justify-content: space-between; font-weight: bold; font-size: 11px }
  .venta-info { background: #fff7fb; padding: 8px 12px; border-bottom: 1px solid ${ROSA_MEDIO} }
  .venta-info p { font-size: 10px; color: #555; margin-bottom: 3px }
  .tabla-productos { width: 100%; border-collapse: collapse; font-size: 10px }
  .tabla-productos thead tr { background: ${ROSA_CLARO} }
  .tabla-productos th { padding: 5px 8px; text-align: left; font-size: 9px; color: ${ROSA_TEXT}; border-bottom: 2px solid ${ROSA} }
  .tabla-productos td { padding: 5px 8px; border-bottom: 1px solid ${ROSA_CLARO} }
  .venta-total { background: ${ROSA_CLARO}; color: ${ROSA_TEXT}; padding: 6px 12px; text-align: right; font-size: 11px; font-weight: bold; border-top: 2px solid ${ROSA} }
  .venta-total strong { color: ${ROSA} }
  .footer { background: ${ROSA}; color: #ffd6ec; text-align: center; padding: 10px; font-size: 9px; margin-top: 20px }
  @media print { body { background: #fff } .pagina { max-width: 100% } .venta-bloque { page-break-inside: avoid } }
</style>
</head>
<body>
<div class="pagina">
<div class="header">
  <div>
    <div class="header-titulo">FashFind</div>
    <div class="header-sub">Reporte de Ventas (Últimos 15 días)</div>
  </div>
  <div class="header-fecha">Generado: ${hoy}</div>
</div>
<div class="resumen">
  <div class="resumen-item"><label>Período</label><span>${inicio_quincena} al ${fin_quincena}</span></div>
  <div class="resumen-item"><label>Total Ventas</label><span>${total_ventas}</span></div>
  <div class="resumen-item"><label>Total Ingresos</label><span>${formatNum(total_ingresos)}</span></div>
</div>
${bloques}
<div class="footer">FashFind — Reporte generado automáticamente</div>
</div>
</body></html>`;
}

function generarHTMLInventario(datos: DatosInventario): string {
  const { inventarios, total_inventarios, stock_total, fecha_generacion } = datos;

  const bloques = inventarios.map(inv => `
    <div class="inventario-bloque">
      <div class="inventario-header">
        <span>Inventario #${inv.id_inventario}</span>
        <span>${inv.estado}</span>
      </div>
      <div class="inventario-info">
        <p><strong>Producto:</strong> ${inv.nombre_producto} &nbsp;|&nbsp; <strong>ID:</strong> ${inv.id_producto}</p>
        <p><strong>Talla:</strong> ${inv.talla} &nbsp;|&nbsp; <strong>Color:</strong> ${inv.color}</p>
      </div>
      <div class="inventario-stock">
        <div class="stock-item">
          <label>Stock Disponible</label>
          <span class="stock-valor">${inv.stock_disponible}</span> unidades
        </div>
        <div class="stock-item">
          <label>Stock Mínimo</label>
          <span class="stock-valor">${inv.stock_minimo}</span> unidades
        </div>
      </div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reporte de Inventario</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;font-size:12px;color:#333;background:#f0f0f0}
  .pagina{max-width:700px;margin:0 auto;background:#fff;padding:0 0 20px 0}
  .header{background:${ROSA};color:white;padding:18px 24px;display:flex;justify-content:space-between;align-items:center}
  .header-titulo{color:#fff;font-size:22px;font-weight:bold;letter-spacing:1px}
  .header-sub{color:#ffd6ec;font-size:11px;margin-top:4px}
  .header-fecha{color:#ffd6ec;font-size:10px}
  .resumen{background:#fff0f7;margin:16px;padding:12px 16px;border-radius:6px;display:flex;gap:32px;border-left:4px solid ${ROSA}}
  .resumen-item label{font-weight:bold;font-size:10px;color:${ROSA};display:block;margin-bottom:2px}
  .resumen-item span{font-size:11px;color:#555}
  .inventario-bloque{margin:0 16px 16px 16px;border:1px solid ${ROSA_MEDIO};border-radius:6px;overflow:hidden;page-break-inside:avoid}
  .inventario-header{background:${ROSA};color:white;padding:7px 12px;display:flex;justify-content:space-between;font-weight:bold;font-size:11px}
  .inventario-info{background:#fff7fb;padding:8px 12px;border-bottom:1px solid ${ROSA_MEDIO}}
  .inventario-info p{font-size:10px;color:#555;margin-bottom:3px}
  .inventario-stock{background:#fff7fb;padding:8px 12px;display:flex;gap:30px;border-top:1px solid ${ROSA_MEDIO}}
  .stock-item{display:flex;flex-direction:column;gap:4px}
  .stock-item label{font-size:9px;color:${ROSA_TEXT};font-weight:bold}
  .stock-valor{font-size:16px;color:${ROSA};font-weight:bold}
  .footer{background:${ROSA};color:#ffd6ec;text-align:center;padding:10px;font-size:9px;margin-top:20px}
  @media print{body{background:#fff}.pagina{max-width:100%}.inventario-bloque{page-break-inside:avoid}}
</style>
</head>
<body>
<div class="pagina">
<div class="header">
  <div>
    <div class="header-titulo">FashFind</div>
    <div class="header-sub">Reporte de Inventario Completo</div>
  </div>
  <div class="header-fecha">Generado: ${fecha_generacion}</div>
</div>
<div class="resumen">
  <div class="resumen-item"><label>Total Inventarios</label><span>${total_inventarios}</span></div>
  <div class="resumen-item"><label>Stock Total</label><span>${stock_total} unidades</span></div>
</div>
${bloques}
<div class="footer">FashFind — Reporte generado automáticamente</div>
</div>
</body></html>`;
}

function generarHTMLPedidos(datos: DatosPedidos): string {
  const { pedidos, total_pedidos, monto_total, fecha_generacion } = datos;

  const bloques = pedidos.map(ped => {
    const detallesHTML = ped.detalles.map((det, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f8f8f8';
      return `
      <tr style="background:${bg}">
        <td style="padding:6px">${det.nombre_producto}</td>
        <td style="text-align:center">${det.cantidad}</td>
        <td style="text-align:right">${formatNum(det.precio)}</td>
        <td style="text-align:right">${formatNum(det.sub_total)}</td>
      </tr>`;
    }).join('');

    const subtotal = ped.total_pedido - ped.costo_envio;

    return `
    <div class="pedido-bloque">
      <div class="pedido-header">
        <span>Pedido #${ped.id_pedido}</span>
        <span>${ped.fecha_pedido} &nbsp; ${ped.hora_pedido}</span>
      </div>
      <div class="pedido-info">
        <p><strong>Usuario ID:</strong> ${ped.id_usuario} &nbsp;|&nbsp; <strong>Método:</strong> ${ped.metodo_pago}</p>
        <p><strong>Tipo Entrega:</strong> ${ped.tipo_entrega} &nbsp;|&nbsp; <strong>Destino:</strong> ${ped.direccion_entrega}, ${ped.ciudad_entrega}</p>
        <p><strong>Teléfono:</strong> ${ped.telefono_contacto} &nbsp;|&nbsp; <strong>Fecha Entrega:</strong> ${ped.fecha_entrega} &nbsp;|&nbsp; <strong>Estado:</strong> ${ped.estado}</p>
      </div>
      <table class="tabla-productos">
        <thead>
          <tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr>
        </thead>
        <tbody>${detallesHTML}</tbody>
      </table>
      <div class="pedido-totales">
        <p><strong>Subtotal:</strong> ${formatNum(subtotal)}</p>
        <p><strong>Envío:</strong> ${formatNum(ped.costo_envio)}</p>
        <p style="font-size:13px;color:${ROSA}"><strong>Total Pedido:</strong> ${formatNum(ped.total_pedido)}</p>
      </div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reporte Quincenal de Pedidos</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;font-size:12px;color:#333;background:#f0f0f0}
  .pagina{max-width:700px;margin:0 auto;background:#fff;padding:0 0 20px 0}
  .header{background:${ROSA};color:white;padding:18px 24px;display:flex;justify-content:space-between;align-items:center}
  .header-titulo{color:#fff;font-size:22px;font-weight:bold;letter-spacing:1px}
  .header-sub{color:#ffd6ec;font-size:11px;margin-top:4px}
  .header-fecha{color:#ffd6ec;font-size:10px}
  .resumen{background:#fff0f7;margin:16px;padding:12px 16px;border-radius:6px;display:flex;gap:32px;border-left:4px solid ${ROSA}}
  .resumen-item label{font-weight:bold;font-size:10px;color:${ROSA};display:block;margin-bottom:2px}
  .resumen-item span{font-size:11px;color:#555}
  .pedido-bloque{margin:0 16px 16px 16px;border:1px solid ${ROSA_MEDIO};border-radius:6px;overflow:hidden;page-break-inside:avoid}
  .pedido-header{background:${ROSA};color:white;padding:7px 12px;display:flex;justify-content:space-between;font-weight:bold;font-size:11px}
  .pedido-info{background:#fff7fb;padding:8px 12px;border-bottom:1px solid ${ROSA_MEDIO}}
  .pedido-info p{font-size:10px;color:#555;margin-bottom:3px}
  .tabla-productos{width:100%;border-collapse:collapse;font-size:10px}
  .tabla-productos thead tr{background:${ROSA_CLARO}}
  .tabla-productos th{padding:5px 8px;text-align:left;font-size:9px;color:${ROSA_TEXT};border-bottom:2px solid ${ROSA}}
  .tabla-productos td{padding:5px 8px;border-bottom:1px solid ${ROSA_CLARO}}
  .pedido-totales{background:#fff7fb;padding:8px 12px;text-align:right;border-top:1px solid ${ROSA_MEDIO}}
  .pedido-totales p{font-size:10px;color:#555;margin-bottom:2px}
  .footer{background:${ROSA};color:#ffd6ec;text-align:center;padding:10px;font-size:9px;margin-top:20px}
  @media print{body{background:#fff}.pagina{max-width:100%}.pedido-bloque{page-break-inside:avoid}}
</style>
</head>
<body>
<div class="pagina">
<div class="header">
  <div>
    <div class="header-titulo">FashFind</div>
    <div class="header-sub">Reporte Quincenal de Pedidos</div>
  </div>
  <div class="header-fecha">Generado: ${fecha_generacion}</div>
</div>
<div class="resumen">
  <div class="resumen-item"><label>Total Pedidos</label><span>${total_pedidos}</span></div>
  <div class="resumen-item"><label>Monto Total</label><span>${formatNum(monto_total)}</span></div>
</div>
${bloques}
<div class="footer">FashFind — Reporte generado automáticamente</div>
</div>
</body></html>`;
}

function generarHTML(tipo: TipoReporte, datos: any): string {
  if (tipo === 'ventas') return generarHTMLVentas(datos);
  if (tipo === 'inventario') return generarHTMLInventario(datos);
  return generarHTMLPedidos(datos);
}

// ─── DESCARGAR PDF (igual para los 3, cambia solo el HTML interno) ─────────
async function descargarPDF(tipo: TipoReporte, datos: any) {
  const html   = generarHTML(tipo, datos);
  const nombre = nombreArchivoBase(tipo, datos);

  if (Platform.OS === 'web') {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.onload = () => win.print();
    }
    return;
  }

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const destino = `${FileSystem.cacheDirectory}${nombre}.pdf`;
  await FileSystem.moveAsync({ from: uri, to: destino });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(destino, {
      mimeType: 'application/pdf',
      dialogTitle: 'Guardar o compartir PDF',
      UTI: 'com.adobe.pdf',
    });
  }
}

// ─── EXCEL WEB CON ESTILOS (tabla HTML → Blob, Excel interpreta los estilos) ─
function excelHTMLVentas(datos: DatosVentas): string {
  const { ventas, inicio_quincena, fin_quincena, total_ventas, total_ingresos } = datos;
  let out = `<table border='0' style='border-collapse:collapse;font-family:Arial;font-size:11px;width:700px'>`;
  out += `<tr><td style='background:${ROSA};color:white;font-size:14px;font-weight:bold;padding:10px;letter-spacing:1px'>FashFind — Reporte de Ventas (Últimos 15 días)</td></tr>`;
  out += `<tr><td style='background:${ROSA_FONDO};padding:6px;color:#555;font-size:10px'>Período: ${inicio_quincena} al ${fin_quincena} &nbsp;|&nbsp; Total ventas: ${total_ventas} &nbsp;|&nbsp; Total ingresos: ${formatNum(total_ingresos)}</td></tr>`;
  out += `<tr><td style='padding:6px;border:none'></td></tr>`;

  for (const v of ventas) {
    const cliente = `${v.nombres} ${v.apellidos}`;
    let bloque = `<table border='1' style='border-collapse:collapse;font-family:Arial;font-size:11px;width:100%;border:2px solid ${ROSA}'>`;
    bloque += `<tr style='background:${ROSA};color:white;font-weight:bold'>
      <td colspan='2' style='padding:6px;font-size:12px'>Venta #${v.id_venta}</td>
      <td colspan='2' style='padding:6px;font-size:10px'>${v.fecha_venta} &nbsp; ${v.hora}</td>
      <td colspan='2' style='padding:6px;font-size:10px'>Cliente: ${cliente} (CC: ${v.cc})</td>
    </tr>`;
    bloque += `<tr style='background:${ROSA_CLARO};color:#a0125e;font-size:10px'>
      <td colspan='6' style='padding:5px'>Método: ${v.metodo_pago} &nbsp;|&nbsp; Recibido: ${formatNum(v.pago_recibido)} &nbsp;|&nbsp; Cambio: ${formatNum(v.cambio)}</td>
    </tr>`;
    bloque += `<tr style='background:${ROSA_CLARO};font-weight:bold;color:${ROSA_TEXT};font-size:10px'>
      <td style='padding:5px 8px'>Producto</td><td style='padding:5px 8px'>Talla</td>
      <td style='padding:5px 8px'>Color</td><td style='text-align:center;padding:5px 8px'>Cant.</td>
      <td style='text-align:right;padding:5px 8px'>Precio Unit.</td><td style='text-align:right;padding:5px 8px'>Subtotal</td>
    </tr>`;
    v.detalles.forEach((d, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#fff7fb';
      bloque += `<tr style='background:${bg};font-size:10px'>
        <td style='padding:4px 8px'>${d.nombre_producto}</td>
        <td style='padding:4px 8px'>${d.talla}</td>
        <td style='padding:4px 8px'>${d.color}</td>
        <td style='text-align:center;padding:4px 8px'>${d.cantidad}</td>
        <td style='text-align:right;padding:4px 8px'>${formatNum(d.precio)}</td>
        <td style='text-align:right;padding:4px 8px'>${formatNum(d.sub_total)}</td>
      </tr>`;
    });
    bloque += `<tr style='background:${ROSA_MEDIO};color:#a0125e;font-weight:bold;font-size:11px'>
      <td colspan='5' style='text-align:right;padding:5px 8px'>TOTAL VENTA:</td>
      <td style='text-align:right;padding:5px 8px'>${formatNum(v.costo_total)}</td>
    </tr>`;
    bloque += `</table>`;

    out += `<tr><td style='padding:0;border:none'>${bloque}</td></tr>`;
    out += `<tr><td style='padding:5px;border:none'></td></tr>`;
  }

  out += `</table>`;
  return out;
}

function excelHTMLInventario(datos: DatosInventario): string {
  const { inventarios, total_inventarios, stock_total, fecha_generacion } = datos;
  let out = `<table border='0' style='border-collapse:collapse;font-family:Arial;font-size:11px;width:700px'>`;
  out += `<tr><td style='background:${ROSA};color:white;font-size:14px;font-weight:bold;padding:10px;letter-spacing:1px'>FashFind — Reporte de Inventario Completo</td></tr>`;
  out += `<tr><td style='background:${ROSA_FONDO};padding:6px;color:#555;font-size:10px'>Generado: ${fecha_generacion} &nbsp;|&nbsp; Total inventarios: ${total_inventarios} &nbsp;|&nbsp; Stock total: ${stock_total} unidades</td></tr>`;
  out += `<tr><td style='padding:6px;border:none'></td></tr>`;

  for (const inv of inventarios) {
    let bloque = `<table border='1' style='border-collapse:collapse;font-family:Arial;font-size:11px;width:100%;border:2px solid ${ROSA}'>`;
    bloque += `<tr style='background:${ROSA};color:white;font-weight:bold'>
      <td colspan='4' style='padding:6px;font-size:12px'>Inventario #${inv.id_inventario}</td>
      <td colspan='2' style='padding:6px;font-size:10px;text-align:right'>${inv.estado}</td>
    </tr>`;
    bloque += `<tr style='background:${ROSA_CLARO};font-weight:bold;color:${ROSA_TEXT};font-size:10px'>
      <td style='padding:5px 8px'>Producto</td><td style='padding:5px 8px'>ID Prod.</td>
      <td style='padding:5px 8px'>Talla</td><td style='padding:5px 8px'>Color</td>
      <td style='text-align:center;padding:5px 8px'>Stock Disp.</td><td style='text-align:center;padding:5px 8px'>Stock Mín.</td>
    </tr>`;
    bloque += `<tr style='background:#ffffff;font-size:10px'>
      <td style='padding:4px 8px'>${inv.nombre_producto}</td>
      <td style='padding:4px 8px'>${inv.id_producto}</td>
      <td style='padding:4px 8px'>${inv.talla}</td>
      <td style='padding:4px 8px'>${inv.color}</td>
      <td style='text-align:center;padding:4px 8px'>${inv.stock_disponible}</td>
      <td style='text-align:center;padding:4px 8px'>${inv.stock_minimo}</td>
    </tr>`;
    bloque += `</table>`;

    out += `<tr><td style='padding:0;border:none'>${bloque}</td></tr>`;
    out += `<tr><td style='padding:5px;border:none'></td></tr>`;
  }

  out += `</table>`;
  return out;
}

function excelHTMLPedidos(datos: DatosPedidos): string {
  const { pedidos, total_pedidos, monto_total, fecha_generacion } = datos;
  let out = `<table border='0' style='border-collapse:collapse;font-family:Arial;font-size:11px;width:700px'>`;
  out += `<tr><td style='background:${ROSA};color:white;font-size:14px;font-weight:bold;padding:10px;letter-spacing:1px'>FashFind — Reporte Quincenal de Pedidos</td></tr>`;
  out += `<tr><td style='background:${ROSA_FONDO};padding:6px;color:#555;font-size:10px'>Generado: ${fecha_generacion} &nbsp;|&nbsp; Total pedidos: ${total_pedidos} &nbsp;|&nbsp; Monto total: ${formatNum(monto_total)}</td></tr>`;
  out += `<tr><td style='padding:6px;border:none'></td></tr>`;

  for (const ped of pedidos) {
    const subtotal = ped.total_pedido - ped.costo_envio;
    let bloque = `<table border='1' style='border-collapse:collapse;font-family:Arial;font-size:11px;width:100%;border:2px solid ${ROSA}'>`;
    bloque += `<tr style='background:${ROSA};color:white;font-weight:bold'>
      <td colspan='2' style='padding:6px;font-size:12px'>Pedido #${ped.id_pedido}</td>
      <td colspan='2' style='padding:6px;font-size:10px'>${ped.fecha_pedido} &nbsp; ${ped.hora_pedido}</td>
    </tr>`;
    bloque += `<tr style='background:${ROSA_CLARO};color:#a0125e;font-size:10px'>
      <td colspan='4' style='padding:5px'>Usuario ID: ${ped.id_usuario} &nbsp;|&nbsp; Método: ${ped.metodo_pago} &nbsp;|&nbsp; Entrega: ${ped.tipo_entrega} &nbsp;|&nbsp; Estado: ${ped.estado}</td>
    </tr>`;
    bloque += `<tr style='background:${ROSA_CLARO};color:#a0125e;font-size:10px'>
      <td colspan='4' style='padding:5px'>Destino: ${ped.direccion_entrega}, ${ped.ciudad_entrega} &nbsp;|&nbsp; Tel: ${ped.telefono_contacto} &nbsp;|&nbsp; Fecha entrega: ${ped.fecha_entrega}</td>
    </tr>`;
    bloque += `<tr style='background:${ROSA_CLARO};font-weight:bold;color:${ROSA_TEXT};font-size:10px'>
      <td style='padding:5px 8px'>Producto</td><td style='text-align:center;padding:5px 8px'>Cantidad</td>
      <td style='text-align:right;padding:5px 8px'>Precio</td><td style='text-align:right;padding:5px 8px'>Subtotal</td>
    </tr>`;
    ped.detalles.forEach((det, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#fff7fb';
      bloque += `<tr style='background:${bg};font-size:10px'>
        <td style='padding:4px 8px'>${det.nombre_producto}</td>
        <td style='text-align:center;padding:4px 8px'>${det.cantidad}</td>
        <td style='text-align:right;padding:4px 8px'>${formatNum(det.precio)}</td>
        <td style='text-align:right;padding:4px 8px'>${formatNum(det.sub_total)}</td>
      </tr>`;
    });
    bloque += `<tr style='background:${ROSA_MEDIO};color:#a0125e;font-weight:bold;font-size:11px'>
      <td colspan='3' style='text-align:right;padding:5px 8px'>Subtotal:</td>
      <td style='text-align:right;padding:5px 8px'>${formatNum(subtotal)}</td>
    </tr>`;
    bloque += `<tr style='background:${ROSA_MEDIO};color:#a0125e;font-weight:bold;font-size:11px'>
      <td colspan='3' style='text-align:right;padding:5px 8px'>Envío:</td>
      <td style='text-align:right;padding:5px 8px'>${formatNum(ped.costo_envio)}</td>
    </tr>`;
    bloque += `<tr style='background:${ROSA};color:white;font-weight:bold;font-size:11px'>
      <td colspan='3' style='text-align:right;padding:5px 8px'>TOTAL PEDIDO:</td>
      <td style='text-align:right;padding:5px 8px'>${formatNum(ped.total_pedido)}</td>
    </tr>`;
    bloque += `</table>`;

    out += `<tr><td style='padding:0;border:none'>${bloque}</td></tr>`;
    out += `<tr><td style='padding:5px;border:none'></td></tr>`;
  }

  out += `</table>`;
  return out;
}

// ─── EXCEL MÓVIL: filas planas (la librería xlsx gratuita no soporta colores) ─
function excelFilasVentas(datos: DatosVentas): (string | number)[][] {
  const { ventas, inicio_quincena, fin_quincena, total_ventas, total_ingresos } = datos;
  const filas: (string | number)[][] = [];
  filas.push(['FashFind — Reporte de Ventas (Últimos 15 días)']);
  filas.push([`Período: ${inicio_quincena} al ${fin_quincena}`, '', `Total ventas: ${total_ventas}`, '', `Total ingresos: ${formatNum(total_ingresos)}`]);
  filas.push([]);
  for (const v of ventas) {
    filas.push([`Venta #${v.id_venta}`, `${v.fecha_venta} ${v.hora}`, `Cliente: ${v.nombres} ${v.apellidos}`, `CC: ${v.cc}`, `Método: ${v.metodo_pago}`, `Recibido: ${formatNum(v.pago_recibido)}`, `Cambio: ${formatNum(v.cambio)}`]);
    filas.push(['Producto', 'Talla', 'Color', 'Cant.', 'Precio Unit.', 'Subtotal']);
    for (const d of v.detalles) filas.push([d.nombre_producto, d.talla, d.color, d.cantidad, d.precio, d.sub_total]);
    filas.push(['', '', '', '', 'TOTAL VENTA:', v.costo_total]);
    filas.push([]);
  }
  return filas;
}

function excelFilasInventario(datos: DatosInventario): (string | number)[][] {
  const { inventarios, total_inventarios, stock_total, fecha_generacion } = datos;
  const filas: (string | number)[][] = [];
  filas.push(['FashFind — Reporte de Inventario Completo']);
  filas.push([`Generado: ${fecha_generacion}`, '', `Total inventarios: ${total_inventarios}`, '', `Stock total: ${stock_total} unidades`]);
  filas.push([]);
  filas.push(['ID Inv.', 'Producto', 'ID Prod.', 'Talla', 'Color', 'Stock Disp.', 'Stock Mín.', 'Estado']);
  for (const inv of inventarios) {
    filas.push([inv.id_inventario, inv.nombre_producto, inv.id_producto, inv.talla, inv.color, inv.stock_disponible, inv.stock_minimo, inv.estado]);
  }
  return filas;
}

function excelFilasPedidos(datos: DatosPedidos): (string | number)[][] {
  const { pedidos, total_pedidos, monto_total, fecha_generacion } = datos;
  const filas: (string | number)[][] = [];
  filas.push(['FashFind — Reporte Quincenal de Pedidos']);
  filas.push([`Generado: ${fecha_generacion}`, '', `Total pedidos: ${total_pedidos}`, '', `Monto total: ${formatNum(monto_total)}`]);
  filas.push([]);
  for (const ped of pedidos) {
    filas.push([`PEDIDO #${ped.id_pedido}`, ped.estado, `Fecha: ${ped.fecha_pedido}`, `Usuario ID: ${ped.id_usuario}`]);
    filas.push(['Producto', 'Cantidad', 'Precio', 'Subtotal']);
    for (const det of ped.detalles) filas.push([det.nombre_producto, det.cantidad, det.precio, det.sub_total]);
    filas.push(['', '', 'Subtotal:', ped.total_pedido - ped.costo_envio]);
    filas.push(['', '', 'Envío:', ped.costo_envio]);
    filas.push(['', '', 'TOTAL:', ped.total_pedido]);
    filas.push([]);
  }
  return filas;
}

const COLS_POR_TIPO: Record<TipoReporte, { wch: number }[]> = {
  ventas:     [{ wch: 30 }, { wch: 18 }, { wch: 25 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 14 }],
  inventario: [{ wch: 8 }, { wch: 30 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }],
  pedidos:    [{ wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 12 }],
};

const HOJA_POR_TIPO: Record<TipoReporte, string> = {
  ventas: 'Ventas',
  inventario: 'Inventario',
  pedidos: 'Pedidos',
};

// ─── DESCARGAR EXCEL ─────────────────────────────────────────────────────────
async function descargarExcel(tipo: TipoReporte, datos: any) {
  const nombre = nombreArchivoBase(tipo, datos);

  // WEB: HTML estilizado → Blob → descarga (Excel interpreta los estilos inline)
  if (Platform.OS === 'web') {
    let out = '';
    if (tipo === 'ventas') out = excelHTMLVentas(datos);
    else if (tipo === 'inventario') out = excelHTMLInventario(datos);
    else out = excelHTMLPedidos(datos);

    const blob = new Blob(['\uFEFF' + out], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${nombre}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  // MÓVIL: xlsx sin estilos (librería open source no soporta colores), se comparte con expo-sharing
  const filas =
    tipo === 'ventas' ? excelFilasVentas(datos) :
    tipo === 'inventario' ? excelFilasInventario(datos) :
    excelFilasPedidos(datos);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(filas);
  ws['!cols'] = COLS_POR_TIPO[tipo];
  XLSX.utils.book_append_sheet(wb, ws, HOJA_POR_TIPO[tipo]);

  const base64  = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const destino = `${FileSystem.cacheDirectory}${nombre}.xlsx`;
  await FileSystem.writeAsStringAsync(destino, base64, { encoding: FileSystem.EncodingType.Base64 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(destino, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Abrir Excel en...',
      UTI: 'com.microsoft.excel.xlsx',
    });
  }
}

// ─── FUNCIÓN PRINCIPAL (usada por las 3 pantallas de reporte) ──────────────
export async function descargarReporte(
  endpoint: string,
  formato: 'pdf' | 'excel',
  tipo: TipoReporte
): Promise<void> {
  const datos = await obtenerDatos(endpoint);

  if (formato === 'pdf') {
    await descargarPDF(tipo, datos);
  } else {
    await descargarExcel(tipo, datos);
  }
}