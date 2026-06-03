import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const ACCENT = '#e91e8c';
const DARK   = '#3A3A3A';
const BORDER = '#9A9A9A';

const API_BASE = 'http://localhost/FashFind/api';

// Helper compatible con web y móvil
const mostrarAlerta = (titulo: string, mensaje: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    onOk?.();
  } else {
    Alert.alert(titulo, mensaje, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
};

export default function EditarVentas() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // ── Campos cabecera ────────────────────────────────────────────────────────
  const [fechaVenta, setFechaVenta]     = useState('');
  const [hora, setHora]                 = useState('');
  const [metodoPago, setMetodoPago]     = useState<'Efectivo' | 'Transferencia'>('Efectivo');
  const [idVendedor, setIdVendedor]     = useState('');
  const [costoTotal, setCostoTotal]     = useState('');
  const [pagoRecibido, setPagoRecibido] = useState('');
  const [cambio, setCambio]             = useState('');

  // ── Detalles (solo lectura al editar) ────────────────────────────────────
  const [detalles, setDetalles]         = useState<any[]>([]);

  const [cargando, setCargando]         = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // ── Cargar venta al montar ────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    cargarVenta();
  }, [id]);

  const cargarVenta = async () => {
    try {
      const res  = await fetch(`${API_BASE}/ventas.php?id=${id}`);
      const json = await res.json();
      if (json.success) {
        const v = json.data;
        setFechaVenta(v.fecha_venta ?? '');
        setHora(v.hora ?? '');
        setMetodoPago(v.metodo_pago ?? 'Efectivo');
        setIdVendedor(String(v.id_usuario ?? ''));
        setCostoTotal(String(v.costo_total ?? ''));
        setPagoRecibido(String(v.pago_recibido ?? ''));
        setCambio(String(v.cambio ?? ''));
        setDetalles(v.detalles ?? []);
      } else {
        mostrarAlerta('Error', 'No se encontró la venta.', () => router.back());
      }
    } catch {
      mostrarAlerta('Error de conexión', 'No se pudo cargar la venta.', () => router.back());
      router.back();
    } finally {
      setCargandoDatos(false);
    }
  };

  // ── Recalcular cambio cuando cambia pago recibido ─────────────────────────
  const onChangePago = (val: string) => {
    setPagoRecibido(val);
    const pago  = parseFloat(val)        || 0;
    const total = parseFloat(costoTotal) || 0;
    setCambio(String(pago >= total ? pago - total : 0));
  };

  // ── Guardar cambios ───────────────────────────────────────────────────────
  const guardarCambios = async () => {
    if (!idVendedor || !pagoRecibido) {
      mostrarAlerta('Campos incompletos', 'Completa todos los campos obligatorios.');
      return;
    }

    const body = {
      fecha_venta:   fechaVenta,
      hora,
      metodo_pago:   metodoPago,
      costo_total:   parseFloat(costoTotal),
      pago_recibido: parseFloat(pagoRecibido),
      cambio:        parseFloat(cambio),
      id_usuario:    parseInt(idVendedor),
    };

    try {
      setCargando(true);
      const res  = await fetch(`${API_BASE}/ventas.php?id=${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        mostrarAlerta('Éxito', 'Venta actualizada correctamente.', () => router.back());
      } else {
        mostrarAlerta('Error', json.mensaje ?? 'No se pudo actualizar la venta.');
      }
    } catch {
      mostrarAlerta('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (cargandoDatos) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Editar Venta #{id}</Text>
        </View>
        <View style={s.centrado}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={s.cargandoText}>Cargando venta...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Editar Venta #{id}</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Datos cabecera ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Datos de la Venta</Text>

          <Text style={s.label}>Fecha Venta</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.input} value={fechaVenta}
              onChangeText={setFechaVenta} placeholder="YYYY-MM-DD"
              placeholderTextColor="#bbb"
            />
          </View>

          <Text style={s.label}>Hora</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.input} value={hora}
              onChangeText={setHora} placeholder="HH:MM"
              placeholderTextColor="#bbb"
            />
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
              value={idVendedor} onChangeText={setIdVendedor}
              placeholder="Ej: 1" placeholderTextColor="#bbb"
            />
          </View>
        </View>

        {/* ── Detalles (solo lectura) ── */}
        {detalles.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Productos de la Venta</Text>
            <Text style={s.nota}>Los productos no se pueden modificar al editar.</Text>

            <View style={s.tablaHeader}>
              <Text style={[s.th, { flex: 2 }]}>Producto</Text>
              <Text style={[s.th, { flex: 1 }]}>Cant.</Text>
              <Text style={[s.th, { flex: 2 }]}>Precio</Text>
              <Text style={[s.th, { flex: 2 }]}>Subtotal</Text>
            </View>

            {detalles.map((d, i) => (
              <View key={i} style={s.tablaFila}>
                <Text style={[s.td, { flex: 2 }]}>{d.nombre_producto ?? `#${d.id_producto}`}</Text>
                <Text style={[s.td, { flex: 1 }]}>{d.cantidad}</Text>
                <Text style={[s.td, { flex: 2 }]}>${Number(d.precio).toLocaleString('es-CO')}</Text>
                <Text style={[s.td, { flex: 2, fontWeight: '600', color: ACCENT }]}>
                  ${Number(d.sub_total).toLocaleString('es-CO')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Totales ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Totales</Text>

          <Text style={s.label}>Costo Total</Text>
          <View style={[s.inputBox, s.inputReadonly]}>
            <Text style={s.inputReadonlyText}>
              ${Number(costoTotal).toLocaleString('es-CO')}
            </Text>
          </View>

          <Text style={s.label}>Pago Recibido</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.input} keyboardType="numeric"
              value={pagoRecibido} onChangeText={onChangePago}
              placeholder="0" placeholderTextColor="#bbb"
            />
          </View>

          <Text style={s.label}>Cambio</Text>
          <View style={[s.inputBox, s.inputReadonly]}>
            <Text style={[s.inputReadonlyText, { color: Number(cambio) >= 0 ? '#27ae60' : '#e74c3c' }]}>
              ${Number(cambio).toLocaleString('es-CO')}
            </Text>
          </View>
        </View>

        {/* ── Botones ── */}
        <View style={s.botonesRow}>
          <TouchableOpacity style={s.btnSecundario} onPress={() => router.back()}>
            <Text style={s.btnSecundarioText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnPrincipal} onPress={guardarCambios} disabled={cargando}>
            {cargando
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnPrincipalText}>Guardar Cambios</Text>
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

  centrado:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  cargandoText: { color: '#888', fontSize: 15 },

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

  nota: { fontSize: 12, color: '#888', fontStyle: 'italic', marginBottom: 10 },

  tablaHeader: { flexDirection: 'row', backgroundColor: DARK, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 4, marginBottom: 4 },
  th: { color: '#fff', fontSize: 11, fontWeight: '600', textAlign: 'center' },

  tablaFila: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 8, paddingHorizontal: 4 },
  td: { fontSize: 13, color: DARK, textAlign: 'center' },

  botonesRow:        { flexDirection: 'row', gap: 12, marginTop: 4 },
  btnPrincipal:      { flex: 2, backgroundColor: ACCENT, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  btnPrincipalText:  { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  btnSecundario:     { flex: 1, backgroundColor: DARK, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  btnSecundarioText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});