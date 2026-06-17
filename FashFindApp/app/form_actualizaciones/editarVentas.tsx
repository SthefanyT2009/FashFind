import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Platform, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const ACCENT = '#e91e8c';
const DARK   = '#3A3A3A';
const BORDER = '#000';

const API_BASE = 'http://192.168.56.1/FashFind/api';

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

  const [fechaVenta, setFechaVenta]     = useState('');
  const [hora, setHora]                 = useState('');
  const [metodoPago, setMetodoPago]     = useState<'Efectivo' | 'Transferencia'>('Efectivo');
  const [idVendedor, setIdVendedor]     = useState('');
  const [costoTotal, setCostoTotal]     = useState('');
  const [pagoRecibido, setPagoRecibido] = useState('');
  const [cambio, setCambio]             = useState('');
  const [detalles, setDetalles]         = useState<any[]>([]);
  const [cargando, setCargando]         = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);

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
    } finally {
      setCargandoDatos(false);
    }
  };

  const onChangePago = (val: string) => {
    setPagoRecibido(val);
    const pago  = parseFloat(val)        || 0;
    const total = parseFloat(costoTotal) || 0;
    setCambio(String(pago >= total ? pago - total : 0));
  };

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
              <Text style={s.cargandoText}>Cargando venta...</Text>
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

              <Text style={s.mainTitle}>Editar Venta #{id}</Text>

              <Text style={s.subTitle}>Datos de la Venta</Text>

              <View style={s.inputGroup}>
                <Text style={s.label}>Fecha Venta</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={fechaVenta}
                    onChange={(e) => setFechaVenta(e.target.value)}
                    style={{
                      width: '100%',
                      border: 'none',
                      borderBottom: '1px solid #000',
                      padding: '5px 0',
                      fontSize: 16,
                      color: DARK,
                      backgroundColor: 'transparent',
                      outline: 'none'
                    }}
                  />
                ) : (
                  <TouchableOpacity 
                    style={s.inputLine} 
                    onPress={() => setMostrarDatePicker(true)}
                  >
                    <Text style={{ color: fechaVenta ? DARK : '#bbb' }}>
                      {fechaVenta || 'Seleccionar fecha'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Hora</Text>
                <TextInput style={s.inputLine} value={hora} onChangeText={setHora} placeholder="HH:MM" placeholderTextColor="#bbb" />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Método de Pago</Text>
                <View style={s.chipsWrap}>
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
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Id Vendedor</Text>
                <TextInput style={s.inputLine} keyboardType="numeric" value={idVendedor} onChangeText={setIdVendedor} placeholder="Ej: 1" placeholderTextColor="#bbb" />
              </View>

              {detalles.length > 0 && (
                <>
                  <Text style={s.subTitle}>Productos de la Venta</Text>
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
                        <Text style={[s.tdText, { width: 90, borderRightWidth: 0, color: ACCENT }]}>${Number(d.sub_total).toLocaleString('es-CO')}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              <Text style={s.subTitle}>Totales</Text>

              <View style={s.inputGroup}>
                <Text style={s.label}>Costo Total</Text>
                <Text style={s.inputLine}>$ {Number(costoTotal).toLocaleString('es-CO')}</Text>
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Pago Recibido</Text>
                <TextInput style={s.inputLine} keyboardType="numeric" value={pagoRecibido} onChangeText={onChangePago} placeholder="0" placeholderTextColor="#bbb" />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Cambio</Text>
                <Text style={[s.inputLine, { color: Number(cambio) >= 0 ? '#27ae60' : '#e74c3c' }]}>
                  $ {Number(cambio).toLocaleString('es-CO')}
                </Text>
              </View>

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

      {mostrarDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={fechaVenta ? new Date(fechaVenta + 'T12:00:00') : new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setMostrarDatePicker(false);
            if (date) {
              setFechaVenta(date.toISOString().split('T')[0]);
            }
          }}
        />
      )}
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
  inputLine:  { borderBottomWidth: 1, borderBottomColor: BORDER, paddingVertical: 5, fontSize: 16, color: DARK, minHeight: 35, justifyContent: 'center' },
  chipsWrap:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip:           { borderWidth: 1, borderColor: '#9A9A9A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  chipActivo:     { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText:       { color: '#555', fontSize: 14 },
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
