import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

// URL base según plataforma 
const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost/FashFind/api'
  : 'http://192.168.137.102/FashFind/api';

// Tipos 
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

interface DatosReporte {
  ventas: Venta[];
  inicio_quincena: string;
  fin_quincena: string;
  total_ventas: number;
  total_ingresos: number;
}

// Colores FashFind
const ROSA        = '#e91e8c';
const ROSA_CLARO  = '#fde8f3';
const ROSA_MEDIO  = '#f9c0dd';
const ROSA_TEXT   = '#c0166e';


// OBTENER DATOS JSON DEL BACKEND
async function obtenerDatos(endpoint: string): Promise<DatosReporte> {
  const url = `${BASE_URL}/${endpoint}?formato=json`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
  return res.json();
}

// HELPERS
function formatNum(n: number) {
  return '$' + Number(n).toLocaleString('es-CO', { minimumFractionDigits: 0 });
}

// GENERAR HTML PARA PDF
function generarHTML(datos: DatosReporte): string {
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
    <div class="header-sub">Reporte de Ventas Quincenales</div>
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

// DESCARGAR PDF
async function descargarPDF(datos: DatosReporte, nombreArchivo: string) {
  const html = generarHTML(datos);

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
  const destino = `${FileSystem.cacheDirectory}${nombreArchivo}.pdf`;
  await FileSystem.moveAsync({ from: uri, to: destino });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(destino, {
      mimeType: 'application/pdf',
      dialogTitle: 'Guardar o compartir PDF',
      UTI: 'com.adobe.pdf',
    });
  }
}

// DESCARGAR EXCEL
async function descargarExcel(datos: DatosReporte, nombreArchivo: string) {
  const { ventas, inicio_quincena, fin_quincena, total_ventas, total_ingresos } = datos;

  // WEB: HTML estilizado → Blob → descarga (Excel interpreta estilos inline)
  if (Platform.OS === 'web') {
    let out = `<table border='0' style='border-collapse:collapse;font-family:Arial;font-size:11px;width:700px'>`;

    // Encabezado principal
    out += `<tr><td style='background:#e91e8c;color:white;font-size:14px;font-weight:bold;padding:10px;letter-spacing:1px'>FashFind — Reporte de Ventas Quincenales</td></tr>`;
    out += `<tr><td style='background:#fff0f7;padding:6px;color:#555;font-size:10px'>Período: ${inicio_quincena} al ${fin_quincena} &nbsp;|&nbsp; Total ventas: ${total_ventas} &nbsp;|&nbsp; Total ingresos: ${formatNum(total_ingresos)}</td></tr>`;
    out += `<tr><td style='padding:6px;border:none'></td></tr>`;

    for (const v of ventas) {
      const cliente = `${v.nombres} ${v.apellidos}`;

      // Cada venta es una tabla anidada con borde propio
      let bloque = `<table border='1' style='border-collapse:collapse;font-family:Arial;font-size:11px;width:100%;border:2px solid #e91e8c'>`;

      bloque += `<tr style='background:#e91e8c;color:white;font-weight:bold'>
        <td colspan='2' style='padding:6px;font-size:12px'>Venta #${v.id_venta}</td>
        <td colspan='2' style='padding:6px;font-size:10px'>${v.fecha_venta} &nbsp; ${v.hora}</td>
        <td colspan='2' style='padding:6px;font-size:10px'>Cliente: ${cliente} (CC: ${v.cc})</td>
      </tr>`;
      bloque += `<tr style='background:#fde8f3;color:#a0125e;font-size:10px'>
        <td colspan='6' style='padding:5px'>Método: ${v.metodo_pago} &nbsp;|&nbsp; Recibido: ${formatNum(v.pago_recibido)} &nbsp;|&nbsp; Cambio: ${formatNum(v.cambio)}</td>
      </tr>`;
      bloque += `<tr style='background:#fde8f3;font-weight:bold;color:#c0166e;font-size:10px'>
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
      bloque += `<tr style='background:#f9c0dd;color:#a0125e;font-weight:bold;font-size:11px'>
        <td colspan='5' style='text-align:right;padding:5px 8px'>TOTAL VENTA:</td>
        <td style='text-align:right;padding:5px 8px'>${formatNum(v.costo_total)}</td>
      </tr>`;
      bloque += `</table>`;

      // Insertar el bloque como celda de la tabla exterior + fila separadora
      out += `<tr><td style='padding:0;border:none'>${bloque}</td></tr>`;
      out += `<tr><td style='padding:5px;border:none'></td></tr>`;
    }

    out += `</table>`;

    const blob = new Blob(['\uFEFF' + out], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${nombreArchivo}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  // MÓVIL: xlsx sin estilos (librería open source no soporta colores)
  const wb    = XLSX.utils.book_new();
  const filas: (string | number)[][] = [];

  filas.push(['FashFind — Reporte de Ventas Quincenales']);
  filas.push([`Período: ${inicio_quincena} al ${fin_quincena}`, '', `Total ventas: ${total_ventas}`, '', `Total ingresos: ${formatNum(total_ingresos)}`]);
  filas.push([]);

  for (const v of ventas) {
    filas.push([`Venta #${v.id_venta}`, `${v.fecha_venta} ${v.hora}`, `Cliente: ${v.nombres} ${v.apellidos}`, `CC: ${v.cc}`, `Método: ${v.metodo_pago}`, `Recibido: ${formatNum(v.pago_recibido)}`, `Cambio: ${formatNum(v.cambio)}`]);
    filas.push(['Producto', 'Talla', 'Color', 'Cant.', 'Precio Unit.', 'Subtotal']);
    for (const d of v.detalles) {
      filas.push([d.nombre_producto, d.talla, d.color, d.cantidad, d.precio, d.sub_total]);
    }
    filas.push(['', '', '', '', 'TOTAL VENTA:', v.costo_total]);
    filas.push([]);
  }

  const ws = XLSX.utils.aoa_to_sheet(filas);
  ws['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 25 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

  const base64  = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const destino = `${FileSystem.cacheDirectory}${nombreArchivo}.xlsx`;
  await FileSystem.writeAsStringAsync(destino, base64, { encoding: FileSystem.EncodingType.Base64 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(destino, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Abrir Excel en...',
      UTI: 'com.microsoft.excel.xlsx',
    });
  }
}


// FUNCIÓN PRINCIPAL
export async function descargarReporte(
  endpoint: string,
  formato: 'pdf' | 'excel',
  nombreBase: string = 'reporte'
): Promise<void> {
  const datos  = await obtenerDatos(endpoint);
  const fecha  = datos.inicio_quincena.replace(/-/g, '');
  const nombre = `${nombreBase}_${fecha}`;

  if (formato === 'pdf') {
    await descargarPDF(datos, nombre);
  } else {
    await descargarExcel(datos, nombre);
  }
}