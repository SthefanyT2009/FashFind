import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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

const METODOS_PAGO = ['Nequi', 'Daviplata', 'Transferencia', 'Tarjeta'] as const;
const TIPOS_ENTREGA = ['Domicilio', 'Recoge en tienda'] as const;
const ESTADOS = ['Por Entregar', 'Entregado'] as const;

interface DetalleItem {
  id: number;
  id_producto: string;
  cantidad: string;
  precio: string;
  sub_total: number;
}

export default function RegistroPedidos() {
  const router = useRouter();

  // ── Campos cabecera ───────────────────────────────────────────────────────
  const [fechaPedido, setFechaPedido]       = useState('');
  const [horaPedido, setHoraPedido]         = useState('');
  const [metodoPago, setMetodoPago]         = useState<typeof METODOS_PAGO[number]>('Nequi');
  const [tipoEntrega, setTipoEntrega]       = useState<typeof TIPOS_ENTREGA[number]>('Domicilio');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [ciudadEntrega, setCiudadEntrega]   = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [fechaEntrega, setFechaEntrega]     = useState('');
  const [costoEnvio, setCostoEnvio]         = useState('');
  const [idUsuario, setIdUsuario]           = useState('');
  const [estado, setEstado]                 = useState<typeof ESTADOS[number]>('Por Entregar');

  // ── Detalle productos ─────────────────────────────────────────────────────
  const [detalles, setDetalles] = useState<DetalleItem[]>([]);
  const [nextId, setNextId]     = useState(1);
  const [totalPedido, setTotalPedido] = useState(0);

  const [cargando, setCargando] = useState(false);

  // ── Fecha y hora automáticas ──────────────────────────────────────────────
  useEffect(() => {
    const ahora = new Date();
    const yyyy  = ahora.getFullYear();
    const mm    = String(ahora.getMonth() + 1).padStart(2, '0');
    const dd    = String(ahora.getDate()).padStart(2, '0');
    setFechaPedido(`${yyyy}-${mm}-${dd}`);

    const hh  = String(ahora.getHours()).padStart(2, '0');
    const min = String(ahora.getMinutes()).padStart(2, '0');
    setHoraPedido(`${hh}:${min}`);
  }, []);

  // ── Recalcular total ──────────────────────────────────────────────────────
  useEffect(() => {
    const subtotales = detalles.reduce((acc, d) => acc + d.sub_total, 0);
    const envio      = parseFloat(costoEnvio) || 0;
    setTotalPedido(subtotales + envio);
  }, [detalles, costoEnvio]);

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

  // ── Registrar pedido ──────────────────────────────────────────────────────
  const registrarPedido = async () => {
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
    if (detalles.length === 0) {
      mostrarAlerta('Sin productos', 'Agrega al menos un producto al pedido.');
      return;
    }
    const filaIncompleta = detalles.find(d => !d.id_producto || !d.cantidad || !d.precio);
    if (filaIncompleta) {
      mostrarAlerta('Datos incompletos', 'Completa el Id Producto, Cantidad y Precio de cada fila.');
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
      productos: detalles.map(d => ({
        id_producto: parseInt(d.id_producto),
        cantidad:    parseInt(d.cantidad),
        precio:      parseFloat(d.precio),
      })),
    };

    try {
      setCargando(true);
      const res  = await fetch(`${API_BASE}/pedidos.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        mostrarAlerta('Éxito', 'Pedido registrado correctamente.', () => router.back());
      } else {
        mostrarAlerta('Error', json.mensaje ?? 'No se pudo registrar el pedido.');
      }
    } catch (e: any) {
      mostrarAlerta('Error de conexión', `No se pudo conectar con el servidor.\n${e?.message ?? ''}`);
    } finally {
      setCargando(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Nuevo Pedido</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Datos del pedido ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Datos del Pedido</Text>

          <Text style={s.label}>Fecha Pedido</Text>
          <View style={[s.inputBox, s.inputReadonly]}>
            <Text style={s.inputReadonlyText}>{fechaPedido}</Text>
          </View>

          <Text style={s.label}>Hora Pedido</Text>
          <View style={[s.inputBox, s.inputReadonly]}>
            <Text style={s.inputReadonlyText}>{horaPedido}</Text>
          </View>

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
          <View style={s.inputBox}>
            <TextInput
              style={s.input} keyboardType="numeric"
              placeholder="Ej: 1" placeholderTextColor="#bbb"
              value={idUsuario} onChangeText={setIdUsuario}
            />
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

        {/* ── Tabla de productos ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Productos del Pedido</Text>

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
                placeholderTextColor="#bbb" value={d.id_producto}
                onChangeText={v => actualizarFila(d.id, 'id_producto', v)}
              />
              <TextInput
                style={[s.tdInput, { flex: 1.5 }]}
                keyboardType="numeric" placeholder="Cant"
                placeholderTextColor="#bbb" value={d.cantidad}
                onChangeText={v => actualizarFila(d.id, 'cantidad', v)}
              />
              <TextInput
                style={[s.tdInput, { flex: 2 }]}
                keyboardType="numeric" placeholder="Precio"
                placeholderTextColor="#bbb" value={d.precio}
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

        {/* ── Total ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Total</Text>
          <View style={[s.inputBox, s.inputReadonly]}>
            <Text style={s.inputReadonlyText}>
              ${totalPedido.toLocaleString('es-CO')}
            </Text>
          </View>
        </View>

        {/* ── Botones ── */}
        <View style={s.botonesRow}>
          <TouchableOpacity style={s.btnSecundario} onPress={() => router.back()}>
            <Text style={s.btnSecundarioText}>Regresar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnPrincipal} onPress={registrarPedido} disabled={cargando}>
            {cargando
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnPrincipalText}>Registrar Pedido</Text>
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

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 4 },
  chip:      { borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipActivo:     { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText:       { color: '#555', fontSize: 13 },
  chipTextActivo: { color: '#fff', fontWeight: '600' },

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