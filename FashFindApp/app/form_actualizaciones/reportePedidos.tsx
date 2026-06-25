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
  : 'http://192.168.137.102/FashFind/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function obtenerDatos(): Promise<DatosPedidos> {
  const res = await fetch(`${API_BASE}/reportePedidos.php?formato=json`);
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
  return res.json();
}

function generarHTML(datos: DatosPedidos): string {
  const { pedidos, total_pedidos, monto_total, fecha_generacion } = datos;

  const bloques = pedidos.map(ped => {
    const detallesHTML = ped.detalles.map((det, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f8f8f8';
      return `
      <tr style="background:${bg}">
        <td style="padding:6px">${det.nombre_producto}</td>
        <td style="text-align:center">${det.cantidad}</td>
        <td style="text-align:right">$${det.precio.toLocaleString()}</td>
        <td style="text-align:right">$${det.sub_total.toLocaleString()}</td>
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
        <p><strong>Subtotal:</strong> $${subtotal.toLocaleString()}</p>
        <p><strong>Envío:</strong> $${ped.costo_envio.toLocaleString()}</p>
        <p style="font-size:13px;color:#e91e8c"><strong>Total Pedido:</strong> $${ped.total_pedido.toLocaleString()}</p>
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
  <div class="resumen-item"><label>Monto Total</label><span>$${monto_total.toLocaleString()}</span></div>
</div>
${bloques}
<div class="footer">FashFind — Reporte generado automáticamente</div>
</div>
</body></html>`;
}

async function descargarPDF(datos: DatosPedidos) {
  const html    = generarHTML(datos);
  const nombre  = `Reporte_Pedidos_Quincenal_${datos.fecha_generacion.replace(/\//g, '-')}`;

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

async function descargarExcel(datos: DatosPedidos) {
  const { pedidos, total_pedidos, monto_total, fecha_generacion } = datos;
  const nombre = `Reporte_Pedidos_Quincenal_${fecha_generacion.replace(/\//g, '-')}`;

  const filas: (string | number)[][] = [];
  filas.push(['FashFind — Reporte Quincenal de Pedidos']);
  filas.push([`Generado: ${fecha_generacion}`, '', `Total pedidos: ${total_pedidos}`, '', `Monto total: $${monto_total}`]);
  filas.push([]);

  for (const ped of pedidos) {
    filas.push([`PEDIDO #${ped.id_pedido}`, ped.estado, `Fecha: ${ped.fecha_pedido}`, `Usuario ID: ${ped.id_usuario}`]);
    filas.push(['Producto', 'Cantidad', 'Precio', 'Subtotal']);
    
    for (const det of ped.detalles) {
      filas.push([det.nombre_producto, det.cantidad, det.precio, det.sub_total]);
    }
    
    filas.push(['', '', 'Subtotal:', ped.total_pedido - ped.costo_envio]);
    filas.push(['', '', 'Envío:', ped.costo_envio]);
    filas.push(['', '', 'TOTAL:', ped.total_pedido]);
    filas.push([]);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(filas);
  ws['!cols'] = [
    { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');

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

// ─── Pantalla ────────────────────────────────────────────────────────
export default function ReportePedidos() {
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
            <Text style={styles.barraTitulo}>Reporte de Pedidos</Text>
          </View>

          <ScrollView contentContainerStyle={styles.contenido}>
            <View style={styles.tarjeta}>
              <Ionicons name="bag-check-outline" size={48} color={ACCENT} style={{ marginBottom: 16 }} />
              <Text style={styles.titulo}>Reporte Quincenal de Pedidos</Text>
              <Text style={styles.descripcion}>
                Genera un reporte de los pedidos de los últimos 15 días, incluyendo detalles de productos,
                montos, métodos de pago, información de entrega y estado actual de cada pedido.
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