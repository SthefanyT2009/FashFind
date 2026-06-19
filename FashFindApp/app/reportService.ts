/**
 * reportService.ts — FashFind
 * Descarga reportes en PDF (nativo) y Excel (.xlsx real) desde móvil/web.
 *
 * Dependencias:
 *   npx expo install expo-print expo-sharing expo-file-system
 *   npm install xlsx
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

// ─── URL base según plataforma ────────────────────────────────────────────────
const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost/FashFind/api'
  : 'http://192.168.1.7/FashFind/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────
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

// ─── Colores FashFind ─────────────────────────────────────────────────────────
const MORADO = '#6b2d8b';
const ROSA   = '#e91e8c';

// ─────────────────────────────────────────────────────────────────────────────
// 1. OBTENER DATOS JSON DEL BACKEND
// ─────────────────────────────────────────────────────────────────────────────
async function obtenerDatos(endpoint: string): Promise<DatosReporte> {
  const url = `${BASE_URL}/${endpoint}?formato=json`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function formatNum(n: number) {
  return '$' + Number(n).toLocaleString('es-CO', { minimumFractionDigits: 0 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GENERAR HTML PARA PDF
// ─────────────────────────────────────────────────────────────────────────────
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
  body { font-family: Arial, sans-serif; font-size: 12px; color: #333 }
  .header { background: ${MORADO}; color: white; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center }
  .header-titulo { color: ${ROSA}; font-size: 22px; font-weight: bold }
  .header-sub { color: #ccc; font-size: 11px; margin-top: 4px }
  .header-fecha { color: #aaa; font-size: 10px }
  .resumen { background: #f5f5f5; margin: 16px; padding: 14px; border-radius: 4px; display: flex; gap: 40px }
  .resumen-item label { font-weight: bold; font-size: 10px; color: ${MORADO}; display: block }
  .resumen-item span { font-size: 11px; color: #555 }
  .venta-bloque { margin: 0 16px 18px 16px; border: 1px solid #eee; border-radius: 4px; overflow: hidden; page-break-inside: avoid }
  .venta-header { background: ${ROSA}; color: white; padding: 7px 12px; display: flex; justify-content: space-between; font-weight: bold; font-size: 11px }
  .venta-info { background: #fcfcfc; padding: 8px 12px; border-bottom: 1px solid #eee }
  .venta-info p { font-size: 10px; color: #555; margin-bottom: 3px }
  .tabla-productos { width: 100%; border-collapse: collapse; font-size: 10px }
  .tabla-productos thead tr { background: #dcdcdc }
  .tabla-productos th { padding: 5px 8px; text-align: left; font-size: 9px; color: #282828 }
  .tabla-productos td { padding: 5px 8px; border-bottom: 1px solid #f0f0f0 }
  .venta-total { background: ${MORADO}; color: white; padding: 6px 12px; text-align: right; font-size: 11px }
  .venta-total strong { color: ${ROSA} }
  .footer { background: ${MORADO}; color: #aaa; text-align: center; padding: 10px; font-size: 9px; margin-top: 20px }
</style>
</head>
<body>
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
</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DESCARGAR PDF
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// 5. DESCARGAR EXCEL
// ─────────────────────────────────────────────────────────────────────────────
async function descargarExcel(datos: DatosReporte, nombreArchivo: string) {
  const { ventas, inicio_quincena, fin_quincena, total_ventas, total_ingresos } = datos;

  const wb = XLSX.utils.book_new();
  const filas: (string | number)[][] = [];

  filas.push(['FashFind — Reporte de Ventas Quincenales']);
  filas.push([`Período: ${inicio_quincena} al ${fin_quincena}`, '', `Total ventas: ${total_ventas}`, '', `Total ingresos: ${formatNum(total_ingresos)}`]);
  filas.push([]);

  for (const v of ventas) {
    filas.push([
      `Venta #${v.id_venta}`,
      `${v.fecha_venta} ${v.hora}`,
      `Cliente: ${v.nombres} ${v.apellidos}`,
      `CC: ${v.cc}`,
      `Método: ${v.metodo_pago}`,
      `Recibido: ${formatNum(v.pago_recibido)}`,
      `Cambio: ${formatNum(v.cambio)}`,
    ]);
    filas.push(['Producto', 'Talla', 'Color', 'Cant.', 'Precio Unit.', 'Subtotal']);
    for (const d of v.detalles) {
      filas.push([d.nombre_producto, d.talla, d.color, d.cantidad, d.precio, d.sub_total]);
    }
    filas.push(['', '', '', '', 'TOTAL VENTA:', v.costo_total]);
    filas.push([]);
  }

  const ws = XLSX.utils.aoa_to_sheet(filas);
  ws['!cols'] = [
    { wch: 30 }, { wch: 18 }, { wch: 25 }, { wch: 10 },
    { wch: 14 }, { wch: 14 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

  if (Platform.OS === 'web') {
    XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
    return;
  }

  const base64  = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const destino = `${FileSystem.cacheDirectory}${nombreArchivo}.xlsx`;
  await FileSystem.writeAsStringAsync(destino, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(destino, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Abrir Excel en...',
      UTI: 'com.microsoft.excel.xlsx',
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
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