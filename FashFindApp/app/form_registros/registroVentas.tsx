import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Platform, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Helper compatible con web y móvil
const mostrarAlerta = (titulo: string, mensaje: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    onOk?.();
  } else {
    Alert.alert(titulo, mensaje, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
};

const ACCENT = '#e91e8c';
const DARK   = '#3A3A3A';
const BORDER = '#9A9A9A';

const API_BASE = 'http://localhost/FashFind/api';

interface DetalleItem {
  id: number;
  id_producto: string;
  cantidad: string;
  precio: string;
  sub_total: number;
}

interface Producto {
  id_producto: number;
  nombre_producto: string;
  talla: string;
  color: string;
  precio: number;
  stock_disponible: number;
}

export default function RegistroVentas() {
  const router = useRouter();

  // ── Campos cabecera ────────────────────────────────────────────────────────
  const [fechaVenta, setFechaVenta]       = useState('');
  const [hora, setHora]                   = useState('');
  const [metodoPago, setMetodoPago]       = useState<'Efectivo' | 'Transferencia'>('Efectivo');
  const [idVendedor, setIdVendedor]       = useState('');
  const [pagoRecibido, setPagoRecibido]   = useState('');
  const [costoTotal, setCostoTotal]       = useState(0);
  const [cambio, setCambio]               = useState(0);

  // ── Detalle / productos ────────────────────────────────────────────────────
  const [detalles, setDetalles]           = useState<DetalleItem[]>([]);
  const [nextId, setNextId]               = useState(1);

  // ── Catálogo para autocompletar precio ────────────────────────────────────
  const [catalogo, setCatalogo]           = useState<Producto[]>([]);
  const [cargando, setCargando]           = useState(false);

  // ── Fecha y hora automáticas ──────────────────────────────────────────────
  useEffect(() => {
    const ahora = new Date();
    const yyyy  = ahora.getFullYear();
    const mm    = String(ahora.getMonth() + 1).padStart(2, '0');
    const dd    = String(ahora.getDate()).padStart(2, '0');
    setFechaVenta(`${yyyy}-${mm}-${dd}`);

    const hh  = String(ahora.getHours()).padStart(2, '0');
    const min = String(ahora.getMinutes()).padStart(2, '0');
    setHora(`${hh}:${min}`);

    cargarCatalogo();
  }, []);

  const cargarCatalogo = async () => {
    try {
      const res  = await fetch(`${API_BASE}/ventas.php`);  // reutiliza helper de productos activos
      // Si tienes endpoint aparte: fetch(`${API_BASE}/productos.php?activos=1`)
    } catch (_) {}
  };

  // ── Recalcular total y cambio ─────────────────────────────────────────────
  useEffect(() => {
    const total = detalles.reduce((acc, d) => acc + d.sub_total, 0);
    setCostoTotal(total);
    const pago = parseFloat(pagoRecibido) || 0;
    setCambio(pago >= total ? pago - total : 0);
  }, [detalles, pagoRecibido]);

  // ── Manejo de filas ───────────────────────────────────────────────────────
  const agregarFila = () => {
    setDetalles(prev => [...prev, { id: nextId, id_producto: '', cantidad: '', precio: '', sub_total: 0 }]);
    setNextId(n => n + 1);
  };

  const eliminarFila = (id: number) => {
    setDetalles(prev => prev.filter(d => d.id !== id));
  };

  const actualizarFila = (id: number, campo: keyof DetalleItem, valor: string) => {
    setDetalles(prev => prev.map(d => {
      if (d.id !== id) return d;
      const updated = { ...d, [campo]: valor };
      const cant    = parseFloat(campo === 'cantidad' ? valor : d.cantidad) || 0;
      const prec    = parseFloat(campo === 'precio'   ? valor : d.precio)   || 0;
      updated.sub_total = cant * prec;
      return updated;
    }));
  };

  // ── Enviar ────────────────────────────────────────────────────────────────
  const registrarVenta = async () => {
    // Validaciones con mensajes claros
    if (!idVendedor) {
      mostrarAlerta('Campo requerido', 'Por favor ingresa el Id del Vendedor.');
      return;
    }
    if (detalles.length === 0) {
      mostrarAlerta('Sin productos', 'Agrega al menos un producto a la venta.');
      return;
    }
    // Validar que todos los detalles tengan datos completos
    const filaIncompleta = detalles.find(
      d => !d.id_producto || !d.cantidad || !d.precio
    );
    if (filaIncompleta) {
      mostrarAlerta('Datos incompletos', 'Completa el Id Producto, Cantidad y Precio de cada fila.');
      return;
    }
    if (!pagoRecibido) {
      mostrarAlerta('Campo requerido', 'Por favor ingresa el Pago Recibido.');
      return;
    }
    if (parseFloat(pagoRecibido) < costoTotal) {
      mostrarAlerta('Pago insuficiente', `El pago recibido ($${parseFloat(pagoRecibido).toLocaleString('es-CO')}) es menor al costo total ($${costoTotal.toLocaleString('es-CO')}).`);
      return;
    }

    const body = {
      fecha_venta:   fechaVenta,
      hora,
      metodo_pago:   metodoPago,
      costo_total:   costoTotal,
      pago_recibido: parseFloat(pagoRecibido),
      cambio,
      id_usuario:    parseInt(idVendedor),
      detalles: detalles.map(d => ({
        id_producto: parseInt(d.id_producto),
        cantidad:    parseInt(d.cantidad),
        precio:      parseFloat(d.precio),
      })),
    };

    try {
      setCargando(true);
      const res = await fetch(`${API_BASE}/ventas.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      if (!res.ok) {
        mostrarAlerta('Error del servidor', `El servidor respondió con estado ${res.status}.`);
        return;
      }

      const json = await res.json();
      if (json.success) {
        mostrarAlerta('Éxito', 'Venta registrada correctamente.', () => router.back());
      } else {
        mostrarAlerta('Error', json.mensaje ?? 'No se pudo registrar la venta.');
      }
    } catch (e: any) {
      console.error('Error registrarVenta:', e);
      mostrarAlerta('Error de conexión', `No se pudo conectar con el servidor.\n${e?.message ?? ''}`);
    } finally {
      setCargando(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Nueva Venta</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Sección cabecera ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Datos de la Venta</Text>

          <Text style={s.label}>Fecha Venta</Text>
          <View style={s.inputBox}>
            <TextInput style={s.input} value={fechaVenta} editable={false} />
          </View>

          <Text style={s.label}>Hora</Text>
          <View style={s.inputBox}>
            <TextInput style={s.input} value={hora} editable={false} />
          </View>

          <Text style={s.label}>Método de Pago</Text>
          <View style={s.pickerRow}>
            {(['Efectivo', 'Transferencia'] as const).map(op => (
              <TouchableOpacity
                key={op}
                style={[s.chip, metodoPago === op && s.chipActivo]}
                onPress={() => setMetodoPago(op)}
              >
                <Text style={[s.chipText, metodoPago === op && s.chipTextActivo]}>{op}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Id Vendedor</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.input} keyboardType="numeric"
              placeholder="Ej: 1" placeholderTextColor="#bbb"
              value={idVendedor} onChangeText={setIdVendedor}
            />
          </View>
        </View>

        {/* ── Tabla de productos ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Productos Vendidos</Text>

          {/* Encabezado tabla */}
          <View style={s.tablaHeader}>
            <Text style={[s.th, { flex: 2 }]}>Id Producto</Text>
            <Text style={[s.th, { flex: 1.5 }]}>Cantidad</Text>
            <Text style={[s.th, { flex: 2 }]}>Precio Unit.</Text>
            <Text style={[s.th, { flex: 2 }]}>Subtotal</Text>
            <Text style={[s.th, { flex: 1 }]}></Text>
          </View>

          {detalles.length === 0 && (
            <Text style={s.sinProductos}>Sin productos. Presiona "Agregar".</Text>
          )}

          {detalles.map(d => (
            <View key={d.id} style={s.tablaFila}>
              <TextInput
                style={[s.tdInput, { flex: 2 }]}
                keyboardType="numeric" placeholder="ID"
                placeholderTextColor="#bbb"
                value={d.id_producto}
                onChangeText={v => actualizarFila(d.id, 'id_producto', v)}
              />
              <TextInput
                style={[s.tdInput, { flex: 1.5 }]}
                keyboardType="numeric" placeholder="Cant"
                placeholderTextColor="#bbb"
                value={d.cantidad}
                onChangeText={v => actualizarFila(d.id, 'cantidad', v)}
              />
              <TextInput
                style={[s.tdInput, { flex: 2 }]}
                keyboardType="numeric" placeholder="Precio"
                placeholderTextColor="#bbb"
                value={d.precio}
                onChangeText={v => actualizarFila(d.id, 'precio', v)}
              />
              <Text style={[s.tdValor, { flex: 2 }]}>
                ${d.sub_total.toLocaleString('es-CO')}
              </Text>
              <TouchableOpacity
                style={[s.btnElimFila, { flex: 1 }]}
                onPress={() => eliminarFila(d.id)}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={s.btnAgregar} onPress={agregarFila}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={s.btnAgregarText}>Agregar producto</Text>
          </TouchableOpacity>
        </View>

        {/* ── Totales ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Totales</Text>

          <Text style={s.label}>Costo Total</Text>
          <View style={[s.inputBox, s.inputReadonly]}>
            <Text style={s.inputReadonlyText}>${costoTotal.toLocaleString('es-CO')}</Text>
          </View>

          <Text style={s.label}>Pago Recibido</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.input} keyboardType="numeric"
              placeholder="0" placeholderTextColor="#bbb"
              value={pagoRecibido} onChangeText={setPagoRecibido}
            />
          </View>

          <Text style={s.label}>Cambio</Text>
          <View style={[s.inputBox, s.inputReadonly]}>
            <Text style={[s.inputReadonlyText, { color: cambio >= 0 ? '#27ae60' : '#e74c3c' }]}>
              ${cambio.toLocaleString('es-CO')}
            </Text>
          </View>
        </View>

        {/* ── Botones ── */}
        <View style={s.botonesRow}>
          <TouchableOpacity style={s.btnSecundario} onPress={() => router.back()}>
            <Text style={s.btnSecundarioText}>Regresar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnPrincipal} onPress={registrarVenta} disabled={cargando}>
            {cargando
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnPrincipalText}>Registrar Venta</Text>
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: DARK, paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 },

  scroll: { flex: 1, padding: 16 },

  card:      { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: DARK, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: ACCENT, paddingLeft: 8 },

  label:    { fontSize: 14, color: '#555', marginBottom: 4, marginTop: 10 },
  inputBox: { borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 6, marginBottom: 4 },
  input:    { fontSize: 16, color: DARK, paddingVertical: 4 },
  inputReadonly:     { backgroundColor: '#f9f9f9', borderRadius: 4, borderBottomWidth: 0, paddingHorizontal: 8, paddingVertical: 8 },
  inputReadonlyText: { fontSize: 16, color: DARK, fontWeight: '600' },

  pickerRow: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 4 },
  chip:      { borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  chipActivo:     { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText:       { color: '#555', fontSize: 14 },
  chipTextActivo: { color: '#fff', fontWeight: '600' },

  // Tabla
  tablaHeader: { flexDirection: 'row', backgroundColor: DARK, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 4, marginBottom: 4 },
  th: { color: '#fff', fontSize: 11, fontWeight: '600', textAlign: 'center' },

  tablaFila:  { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 6, paddingHorizontal: 2 },
  tdInput:    { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 6, fontSize: 13, color: DARK, marginHorizontal: 2, textAlign: 'center' },
  tdValor:    { fontSize: 13, color: DARK, textAlign: 'center', fontWeight: '600' },
  btnElimFila:{ backgroundColor: '#e74c3c', borderRadius: 4, padding: 6, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },

  sinProductos: { textAlign: 'center', color: '#aaa', fontSize: 14, paddingVertical: 16 },

  btnAgregar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: DARK, borderRadius: 6, paddingVertical: 10, marginTop: 12 },
  btnAgregarText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  botonesRow:        { flexDirection: 'row', gap: 12, marginTop: 4 },
  btnPrincipal:      { flex: 2, backgroundColor: ACCENT, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  btnPrincipalText:  { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  btnSecundario:     { flex: 1, backgroundColor: DARK, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  btnSecundarioText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});