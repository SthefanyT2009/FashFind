import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Platform, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const ACCENT = '#e91e8c';
const DARK   = '#3A3A3A';
const BORDER = '#000';

const API_BASE = 'http://172.30.3.163/FashFind/api';

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
  const [cargando, setCargando]                 = useState(false);
  const [cargandoDatos, setCargandoDatos]       = useState(true);

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

  const guardarCambios = async () => {
    if (!idUsuario.trim())        { mostrarAlerta('Campo requerido', 'Ingresa el Id del Cliente.'); return; }
    if (!direccionEntrega.trim()) { mostrarAlerta('Campo requerido', 'Ingresa la Dirección de Entrega.'); return; }
    if (!ciudadEntrega.trim())    { mostrarAlerta('Campo requerido', 'Ingresa la Ciudad de Entrega.'); return; }
    if (!telefonoContacto.trim()) { mostrarAlerta('Campo requerido', 'Ingresa el Teléfono de Contacto.'); return; }
    if (!fechaEntrega.trim())     { mostrarAlerta('Campo requerido', 'Ingresa la Fecha de Entrega.'); return; }

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
      <View style={s.container}>
        <ImageBackground
          source={require('../../assets/images/fondoLogin.jpeg')}
          style={s.bg}
          resizeMode="cover"
        >
          <SafeAreaView style={s.safe}>
            <View style={s.centrado}>
              <ActivityIndicator size="large" color={ACCENT} />
              <Text style={s.cargandoText}>Cargando pedido...</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <ImageBackground
        source={require('../../assets/images/fondoLogin.jpeg')}
        style={s.bg}
        resizeMode="cover"
      >
        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={s.scrollContent}>

            <View style={s.card}>
              <TouchableOpacity onPress={() => router.back()} style={s.backIcon}>
                <Ionicons name="arrow-back" size={20} color={DARK} />
              </TouchableOpacity>

              <Text style={s.mainTitle}>Editar Pedido #{id}</Text>

              {/* ── Datos del pedido ── */}
              <Text style={s.subTitle}>Datos del Pedido</Text>

              <View style={s.inputGroup}>
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
              </View>

              <View style={s.inputGroup}>
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
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Dirección Entrega</Text>
                <TextInput style={s.inputLine} placeholder="Ej: Calle 10 #5-20" placeholderTextColor="#bbb" value={direccionEntrega} onChangeText={setDireccionEntrega} />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Ciudad Entrega</Text>
                <TextInput style={s.inputLine} placeholder="Ej: Bogotá" placeholderTextColor="#bbb" value={ciudadEntrega} onChangeText={setCiudadEntrega} />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Teléfono Contacto</Text>
                <TextInput style={s.inputLine} keyboardType="phone-pad" placeholder="Ej: 3001234567" placeholderTextColor="#bbb" value={telefonoContacto} onChangeText={setTelefonoContacto} />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Fecha de Entrega</Text>
                <TextInput style={s.inputLine} placeholder="YYYY-MM-DD" placeholderTextColor="#bbb" value={fechaEntrega} onChangeText={setFechaEntrega} />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Costo de Envío</Text>
                <TextInput style={s.inputLine} keyboardType="numeric" placeholder="0" placeholderTextColor="#bbb" value={costoEnvio} onChangeText={setCostoEnvio} />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Id Cliente</Text>
                <TextInput style={s.inputLine} value={idUsuario} editable={false} />
              </View>

              <View style={s.inputGroup}>
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
                <>
                  <Text style={s.subTitle}>Productos del Pedido</Text>
                  <Text style={s.nota}>Los productos no se pueden modificar al editar.</Text>

                  <View style={s.tabla}>
                    <View style={s.thRow}>
                      <Text style={[s.th, { width: 80 }]}>Producto</Text>
                      <Text style={[s.th, { width: 55 }]}>Cant.</Text>
                      <Text style={[s.th, { width: 90 }]}>Precio</Text>
                      <Text style={[s.th, { width: 90, borderRightWidth: 0 }]}>Subtotal</Text>
                    </View>
                    {detalles.map((d, i) => (
                      <View key={i} style={[s.tr, i % 2 === 0 ? s.trPar : s.trImpar]}>
                        <Text style={[s.tdText, { width: 80 }]}>{d.nombre_producto ?? `#${d.id_producto}`}</Text>
                        <Text style={[s.tdText, { width: 55 }]}>{d.cantidad}</Text>
                        <Text style={[s.tdText, { width: 90 }]}>${Number(d.precio).toLocaleString('es-CO')}</Text>
                        <Text style={[s.tdText, { width: 90, borderRightWidth: 0, color: ACCENT }]}>
                          ${(Number(d.cantidad) * Number(d.precio)).toLocaleString('es-CO')}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* ── Botones ── */}
              <TouchableOpacity style={[s.btnRosa, { marginTop: 20 }]} onPress={guardarCambios} disabled={cargando}>
                {cargando
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.btnRosaText}>Guardar Cambios</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={s.btnRegresar} onPress={() => router.back()}>
                <Text style={s.btnRegresarText}>Cancelar</Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1, width: '100%', height: '100%' },
  safe: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },

  centrado:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  cargandoText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: Platform.OS === 'web' ? 450 : '90%',
    borderRadius: 15,
    padding: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },

  backIcon:  { position: 'absolute', top: 20, left: 20 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: ACCENT, textAlign: 'center', marginBottom: 25 },
  subTitle:  { fontSize: 22, fontWeight: 'bold', color: ACCENT, textAlign: 'center', marginTop: 30, marginBottom: 20 },

  inputGroup: { marginBottom: 20 },
  label:      { fontSize: 16, color: DARK, marginBottom: 5 },
  inputLine:  { borderBottomWidth: 1, borderBottomColor: BORDER, paddingVertical: 5, fontSize: 16, color: DARK },

  chipsWrap:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip:           { borderWidth: 1, borderColor: '#9A9A9A', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipActivo:     { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText:       { color: '#555', fontSize: 13 },
  chipTextActivo: { color: '#fff', fontWeight: '600' },

  nota: { fontSize: 12, color: '#888', fontStyle: 'italic', marginBottom: 10, textAlign: 'center' },

  tabla:   { borderWidth: 1, borderColor: '#e0c0d8', marginBottom: 15, borderRadius: 8, overflow: 'hidden' },
  thRow:   { flexDirection: 'row', backgroundColor: '#f3d6ec', borderBottomWidth: 2, borderBottomColor: '#e91e8c' },
  th:      { fontSize: 11, fontWeight: 'bold', paddingVertical: 10, paddingHorizontal: 3, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#d9a8cc', color: DARK },
  tr:      { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f0e0eb', alignItems: 'center', minHeight: 44 },
  trPar:   { backgroundColor: '#fff' },
  trImpar: { backgroundColor: '#fdf5fb' },
  tdText:  { fontSize: 13, paddingVertical: 6, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#f0e0eb', color: DARK, fontWeight: '500' },

  btnRosa:         { backgroundColor: ACCENT, paddingVertical: 12, borderRadius: 5, alignItems: 'center' },
  btnRosaText:     { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnRegresar:     { marginTop: 15, alignItems: 'center' },
  btnRegresarText: { color: DARK, fontSize: 14, textDecorationLine: 'underline' },
});