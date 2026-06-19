import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView,
  ImageBackground, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as XLSX from 'xlsx';

const ACCENT = '#e91e8c';
const DARK   = '#6b2d8b';
const GREEN  = '#27ae60';

const API_BASE = Platform.OS === 'web'
  ? 'http://localhost/FashFind/api'
  : 'http://192.168.1.7/FashFind/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ItemInventario {
  id_inventario: number;
  id_producto: number;
  nombre_producto: string;
  categoria: string;
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function obtenerDatos(): Promise<DatosInventario> {
  const res = await fetch(`${API_BASE}/reporteInventario.php?formato=json`);
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
  return res.json();
}

function generarHTML(datos: DatosInventario): string {
  const { inventarios, total_inventarios, stock_total, fecha_generacion } = datos;

  const bloques = inventarios.map(inv => {
    const estadoColor = inv.estado === 'Activo' ? '#27ae60' : '#e74c3c';
    return `
    <div class="inventario-bloque">
      <div class="inventario-header">
        <span>Inventario #${inv.id_inventario}</span>
        <span style="background:${estadoColor};color:white;padding:2px 8px;border-radius:3px;font-size:10px">${inv.estado}</span>
      </div>
      <div class="inventario-info">
        <p><strong>Producto:</strong> ${inv.nombre_producto} &nbsp;|&nbsp; <strong>ID Producto:</strong> ${inv.id_producto}</p>
        <p><strong>Categoría:</strong> ${inv.categoria} &nbsp;|&nbsp; <strong>Talla:</strong> ${inv.talla} &nbsp;|&nbsp; <strong>Color:</strong> ${inv.color}</p>
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
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
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
  .inventario-bloque{margin:0 16px 18px 16px;border:1px solid #eee;border-radius:4px;overflow:hidden;page-break-inside:avoid}
  .inventario-header{background:#e91e8c;color:white;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;font-weight:bold;font-size:11px}
  .inventario-info{background:#fcfcfc;padding:8px 12px;border-bottom:1px solid #eee}
  .inventario-info p{font-size:10px;color:#555;margin-bottom:3px}
  .inventario-stock{background:#f9f9f9;padding:12px;display:flex;gap:30px;border-top:1px solid #eee}
  .stock-item{display:flex;flex-direction:column;gap:4px}
  .stock-item label{font-size:9px;color:#777;font-weight:bold}
  .stock-valor{font-size:16px;color:#e91e8c;font-weight:bold}
  .footer{background:#6b2d8b;color:#aaa;text-align:center;padding:10px;font-size:9px;margin-top:20px}
</style>
</head>
<body>
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
</body></html>`;
}

async function descargarPDF(datos: DatosInventario) {
  const html    = generarHTML(datos);
  const nombre  = `Reporte_Inventario_${datos.fecha_generacion.replace(/\//g, '-')}`;

  if (Platform.OS === 'web') {
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.onload = () => win.print(); }
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

async function descargarExcel(datos: DatosInventario) {
  const { inventarios, total_inventarios, stock_total, fecha_generacion } = datos;
  const nombre = `Reporte_Inventario_${fecha_generacion.replace(/\//g, '-')}`;

  const filas: (string | number)[][] = [];
  filas.push(['FashFind — Reporte de Inventario Completo']);
  filas.push([`Generado: ${fecha_generacion}`, '', `Total inventarios: ${total_inventarios}`, '', `Stock total: ${stock_total} unidades`]);
  filas.push([]);
  filas.push(['ID Inv.', 'Producto', 'ID Prod.', 'Categoría', 'Talla', 'Color', 'Stock Disp.', 'Stock Mín.', 'Estado']);

  for (const inv of inventarios) {
    filas.push([
      inv.id_inventario, inv.nombre_producto, inv.id_producto,
      inv.categoria, inv.talla, inv.color,
      inv.stock_disponible, inv.stock_minimo, inv.estado,
    ]);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(filas);
  ws['!cols'] = [
    { wch: 8 }, { wch: 30 }, { wch: 10 }, { wch: 16 },
    { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

  if (Platform.OS === 'web') {
    XLSX.writeFile(wb, `${nombre}.xlsx`);
    return;
  }

  const base64  = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const destino = `${FileSystem.cacheDirectory}${nombre}.xlsx`;
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

// ─── Pantalla ────────────────────────────────────────────────────────────────
export default function ReporteInventario() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  const manejarDescarga = async (formato: 'pdf' | 'excel') => {
    setCargando(true);
    try {
      const datos = await obtenerDatos();
      if (formato === 'pdf') await descargarPDF(datos);
      else                   await descargarExcel(datos);
    } catch (e) {
      console.error('Error al generar reporte:', e);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.raiz}>
      <ImageBackground
        source={require('../../assets/images/fondoLogin.jpeg')}
        style={styles.fondo}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.barraSuperior}>
            <TouchableOpacity onPress={() => router.back()} style={styles.btnVolver} disabled={cargando}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.barraTitulo}>Reporte de Inventario</Text>
          </View>

          <ScrollView contentContainerStyle={styles.contenido}>
            <View style={styles.tarjeta}>
              <Ionicons name="layers-outline" size={48} color={ACCENT} style={{ marginBottom: 16 }} />
              <Text style={styles.titulo}>Reporte Completo de Inventario</Text>
              <Text style={styles.descripcion}>
                Genera un reporte con todos los registros de inventario activos, incluyendo
                detalle de productos, stock disponible, stock mínimo y estado del inventario.
              </Text>

              <View style={styles.botonesGroup}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: ACCENT, opacity: cargando ? 0.6 : 1 }]}
                  onPress={() => manejarDescarga('pdf')}
                  disabled={cargando}
                >
                  {cargando
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Ionicons name="print-outline" size={20} color="#fff" />}
                  <Text style={styles.btnTexto}>{cargando ? 'Descargando...' : 'Guardar como PDF'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: GREEN, opacity: cargando ? 0.6 : 1 }]}
                  onPress={() => manejarDescarga('excel')}
                  disabled={cargando}
                >
                  {cargando
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Ionicons name="grid-outline" size={20} color="#fff" />}
                  <Text style={styles.btnTexto}>{cargando ? 'Descargando...' : 'Descargar Excel'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.nota}>
                {Platform.OS === 'web'
                  ? 'PDF: se abrirá una ventana para imprimir o guardar.\nExcel: se descargará el archivo directamente.'
                  : 'El archivo se descargará y podrás compartirlo o guardarlo en tu dispositivo.'}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz:           { flex: 1 },
  fondo:          { flex: 1, width: '100%', height: '100%' },
  container:      { flex: 1, backgroundColor: 'transparent' },
  barraSuperior:  { flexDirection: 'row', alignItems: 'center', backgroundColor: DARK, paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  btnVolver:      { padding: 2 },
  barraTitulo:    { color: '#fff', fontSize: 16, fontWeight: '600' },
  contenido:      { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  tarjeta: {
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 28, alignItems: 'center',
    width: '100%', maxWidth: 420,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  titulo:       { fontSize: 18, fontWeight: 'bold', color: DARK, textAlign: 'center', marginBottom: 10 },
  descripcion:  { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  botonesGroup: { width: '100%', gap: 12, marginBottom: 20 },
  btn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 8, width: '100%' },
  btnTexto:     { color: '#fff', fontSize: 15, fontWeight: '700' },
  nota:         { fontSize: 11, color: '#999', textAlign: 'center', lineHeight: 18 },
});