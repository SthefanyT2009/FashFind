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

const API_BASE = 'http://192.168.1.7/FashFind/api';

const mostrarAlerta = (titulo: string, mensaje: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    onOk?.();
  } else {
    Alert.alert(titulo, mensaje, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
};

const METODOS_PAGO  = ['Nequi', 'Daviplata', 'Transferencia', 'Tarjeta'] as const;
const TIPOS_ENTREGA = ['Domicilio', 'Recoge en tienda'] as const;
const ESTADOS       = ['Por Entregar', 'Entregado', 'Cancelado'] as const;

export default function EditarPedidos() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // ── Campos ────────────────────────────────────────────────────────────────
  const [metodoPago, setMetodoPago]             = useState<string>('Nequi');
  const [tipoEntrega, setTipoEntrega]           = useState<string>('Domicilio');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [ciudadEntrega, setCiudadEntrega]       = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [fechaEntrega, setFechaEntrega]         = useState('');
  const [costoEnvio, setCostoEnvio]             = useState('');
  const [idUsuario, setIdUsuario]               = useState('');
  const [estado, setEstado]                     = useState<string>('Por Entregar');
  const [detalles, setDetalles]                 = useState<any[]>([]);

  const [cargando, setCargando]           = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // ── Cargar pedido ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    cargarPedido();
  }, [id]);

  const cargarPedido = async () => {
    try {
      const res  = await fetch(`${API_BASE}/pedidos.php?id=${id}`);
      const json = await res.json();
      if (json.success) {
        const p = json.data;
        setMetodoPago(p.metodo_pago ?? 'Nequi');
        setTipoEntrega(p.tipo_entrega ?? 'Domicilio');
        setDireccionEntrega(p.direccion_entrega ?? '');
        setCiudadEntrega(p.ciudad_entrega ?? '');
        setTelefonoContacto(String(p.telefono_contacto ?? ''));
        setFechaEntrega(p.fecha_entrega ?? '');
        setCostoEnvio(String(p.costo_envio ?? ''));
        setIdUsuario(String(p.id_usuario ?? ''));
        setEstado(p.estado ?? 'Por Entregar');
        setDetalles(p.detalles ?? []);
      } else {
        mostrarAlerta('Error', 'No se encontró el pedido.', () => router.back());
      }
    } catch {
      mostrarAlerta('Error de conexión', 'No se pudo cargar el pedido.', () => router.back());
    } finally {
      setCargandoDatos(false);
    }
  };

  // ── Guardar cambios ───────────────────────────────────────────────────────
  const guardarCambios = async () => {
    if (!idUsuario.trim()) {
      mostrarAlerta('Campo requerido', 'Ingresa el Id del Cliente.');
      return;
    }
    if (!direccionEntrega.trim()) {
      mostrarAlerta('Campo requerido', 'Ingresa la Dirección de Entrega.');
      return;
    }
    if (!ciudadEntrega.trim()) {
      mostrarAlerta('Campo requerido', 'Ingresa la Ciudad de Entrega.');
      return;
    }
    if (!telefonoContacto.trim()) {
      mostrarAlerta('Campo requerido', 'Ingresa el Teléfono de Contacto.');
      return;
    }
    if (!fechaEntrega.trim()) {
      mostrarAlerta('Campo requerido', 'Ingresa la Fecha de Entrega.');
      return;
    }

    const body = {
      metodo_pago:       metodoPago,
      costo_envio:       parseFloat(costoEnvio) || 0,
      tipo_entrega:      tipoEntrega,
      direccion_entrega: direccionEntrega,
      ciudad_entrega:    ciudadEntrega,
      telefono_contacto: telefonoContacto,
      fecha_entrega:     fechaEntrega,
      estado,
      id_usuario:        parseInt(idUsuario),
    };

    try {
      setCargando(true);
      const res  = await fetch(`${API_BASE}/pedidos.php?id=${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        mostrarAlerta('Éxito', 'Pedido actualizado correctamente.', () => router.back());
      } else {
        mostrarAlerta('Error', json.mensaje ?? 'No se pudo actualizar el pedido.');
      }
    } catch {
      mostrarAlerta('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  // ── Pantalla de carga ─────────────────────────────────────────────────────
  if (cargandoDatos) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Editar Pedido #{id}</Text>
        </View>
        <View style={s.centrado}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={s.cargandoText}>Cargando pedido...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Editar Pedido #{id}</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Datos del pedido ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Datos del Pedido</Text>

          <Text style={s.label}>Método de Pago</Text>
          <View style={s.chipsWrap}>
            {METODOS_PAGO.map(op => (
              <TouchableOpacity
                key={op}
                style={[s.chip, metodoPago === op && s.chipActivo]}
                onPress={() => setMetodoPago(op)}
              >
                <Text style={[s.chipText, metodoPago === op && s.chipTextActivo]}>{op}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Tipo de Entrega</Text>
          <View style={s.chipsWrap}>
            {TIPOS_ENTREGA.map(op => (
              <TouchableOpacity
                key={op}
                style={[s.chip, tipoEntrega === op && s.chipActivo]}
                onPress={() => setTipoEntrega(op)}
              >
                <Text style={[s.chipText, tipoEntrega === op && s.chipTextActivo]}>{op}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Dirección Entrega</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.input} placeholder="Ej: Calle 10 #5-20"
              placeholderTextColor="#bbb" value={direccionEntrega}
              onChangeText={setDireccionEntrega}
            />
          </View>

          <Text style={s.label}>Ciudad Entrega</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.input} placeholder="Ej: Bogotá"
              placeholderTextColor="#bbb" value={ciudadEntrega}
              onChangeText={setCiudadEntrega}
            />
          </View>

          <Text style={s.label}>Teléfono Contacto</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.input} keyboardType="phone-pad"
              placeholder="Ej: 3001234567" placeholderTextColor="#bbb"
              value={telefonoContacto} onChangeText={setTelefonoContacto}
            />
          </View>

          <Text style={s.label}>Fecha de Entrega</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.input} placeholder="YYYY-MM-DD"
              placeholderTextColor="#bbb" value={fechaEntrega}
              onChangeText={setFechaEntrega}
            />
          </View>

          <Text style={s.label}>Costo de Envío</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.input} keyboardType="numeric"
              placeholder="0" placeholderTextColor="#bbb"
              value={costoEnvio} onChangeText={setCostoEnvio}
            />
          </View>

          <Text style={s.label}>Id Cliente</Text>
          <View style={[s.inputBox, s.inputReadonly]}>
            <Text style={s.inputReadonlyText}>{idUsuario}</Text>
          </View>

          <Text style={s.label}>Estado</Text>
          <View style={s.chipsWrap}>
            {ESTADOS.map(op => (
              <TouchableOpacity
                key={op}
                style={[s.chip, estado === op && s.chipActivo]}
                onPress={() => setEstado(op)}
              >
                <Text style={[s.chipText, estado === op && s.chipTextActivo]}>{op}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Productos (solo lectura) ── */}
        {detalles.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Productos del Pedido</Text>
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
                  ${(Number(d.cantidad) * Number(d.precio)).toLocaleString('es-CO')}
                </Text>
              </View>
            ))}
          </View>
        )}

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

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 4 },
  chip:      { borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipActivo:     { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText:       { color: '#555', fontSize: 13 },
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