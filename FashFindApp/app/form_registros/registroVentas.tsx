import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Platform, ImageBackground,
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
const BORDER = '#000';

const API_BASE = Platform.OS === 'web' ? 'http://localhost/FashFind/api' : 'http://192.168.1.7/FashFind/api';

interface DetalleItem {
  id: number;
  id_producto: string;
  cantidad: string;
  precio: string;
  sub_total: number;
}

export default function RegistroVentas() {
  const router = useRouter();

  const [fechaVenta, setFechaVenta]       = useState('');
  const [hora, setHora]                   = useState('');
  const [metodoPago, setMetodoPago]       = useState<'Efectivo' | 'Transferencia'>('Efectivo');
  const [idVendedor, setIdVendedor]       = useState('');
  const [pagoRecibido, setPagoRecibido]   = useState('');
  const [costoTotal, setCostoTotal]       = useState(0);
  const [cambio, setCambio]               = useState(0);
  const [detalles, setDetalles]           = useState<DetalleItem[]>([]);
  const [nextId, setNextId]               = useState(1);
  const [cargando, setCargando]           = useState(false);

  useEffect(() => {
    const ahora = new Date();
    setFechaVenta(ahora.toLocaleDateString('es-ES'));
    setHora(ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }));
  }, []);

  useEffect(() => {
    const total = detalles.reduce((acc, d) => acc + d.sub_total, 0);
    setCostoTotal(total);
    const pago = parseFloat(pagoRecibido) || 0;
    setCambio(pago >= total ? pago - total : 0);
  }, [detalles, pagoRecibido]);

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

  const registrarVenta = async () => {
    if (!idVendedor || detalles.length === 0 || !pagoRecibido) {
      mostrarAlerta('Error', 'Por favor complete todos los campos.');
      return;
    }

    setCargando(true);
    try {
      // Convertir fecha de formato "d/m/yyyy" a "yyyy-mm-dd"
      const [dia, mes, anio] = fechaVenta.split('/');
      const fechaFormato = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

      const ventaData = {
        fecha_venta: fechaFormato,
        hora: hora,
        metodo_pago: metodoPago,
        costo_total: costoTotal,
        pago_recibido: parseFloat(pagoRecibido),
        cambio: cambio,
        id_usuario: idVendedor,
        detalles: detalles.map(d => ({
          id_producto: d.id_producto,
          cantidad: parseInt(d.cantidad) || 0,
          precio: parseFloat(d.precio) || 0,
        }))
      };

      const res = await fetch(`${API_BASE}/ventas.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaData)
      });

      const json = await res.json();
      
      if (json.success) {
        mostrarAlerta('Éxito', json.mensaje || 'Venta registrada correctamente.', () => {
          router.back();
        });
      } else {
        mostrarAlerta('Error', json.mensaje || 'No se pudo registrar la venta.');
      }
    } catch (error) {
      console.error('Error registrando venta:', error);
      mostrarAlerta('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

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

              <Text style={s.mainTitle}>Nueva Venta</Text>

              {/* Campos Cabecera */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Fecha Venta</Text>
                <TextInput style={s.inputLine} value={fechaVenta} editable={false} />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Hora</Text>
                <TextInput style={s.inputLine} value={hora} editable={false} />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Metodo Pago</Text>
                <View style={s.pickerWrapper}>
                  <TextInput 
                    style={s.inputLine} 
                    value={metodoPago} 
                    editable={false} 
                  />
                  <View style={s.pickerOverlay}>
                    <TouchableOpacity onPress={() => setMetodoPago('Efectivo')}><Text style={s.opt}>Efectivo</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setMetodoPago('Transferencia')}><Text style={s.opt}>Transferencia</Text></TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Id Vendedor</Text>
                <TextInput 
                  style={s.inputLine} 
                  keyboardType="numeric" 
                  value={idVendedor} 
                  onChangeText={setIdVendedor} 
                />
              </View>

              <Text style={s.subTitle}>Productos</Text>

              {/* Tabla */}
              <View style={s.tabla}>
                {/* Header */}
                <View style={s.thRow}>
                  <Text style={[s.th, { width: 80 }]}>Id{'\n'}Producto</Text>
                  <Text style={[s.th, { width: 70 }]}>Cantidad</Text>
                  <Text style={[s.th, { width: 100 }]}>Precio{'\n'}Unitario</Text>
                  <Text style={[s.th, { width: 80 }]}>Subtotal</Text>
                  <Text style={[s.th, { width: 32, borderRightWidth: 0 }]}> </Text>
                </View>
                {detalles.map((d, i) => (
                  <View key={d.id} style={[s.tr, i % 2 === 0 ? s.trPar : s.trImpar]}>
                    <TextInput
                      style={[s.td, { width: 80 }]}
                      value={d.id_producto}
                      keyboardType="numeric"
                      onChangeText={v => actualizarFila(d.id, 'id_producto', v)}
                      placeholder="---"
                      placeholderTextColor="#bbb"
                    />
                    <TextInput
                      style={[s.td, { width: 70 }]}
                      value={d.cantidad}
                      keyboardType="numeric"
                      onChangeText={v => actualizarFila(d.id, 'cantidad', v)}
                      placeholder="0"
                      placeholderTextColor="#bbb"
                    />
                    <TextInput
                      style={[s.td, { width: 100 }]}
                      value={d.precio}
                      keyboardType="numeric"
                      onChangeText={v => actualizarFila(d.id, 'precio', v)}
                      placeholder="0"
                      placeholderTextColor="#bbb"
                    />
                    <Text style={[s.tdText, { width: 80 }]}>${d.sub_total.toLocaleString('es-CO')}</Text>
                    <TouchableOpacity style={s.btnEliminar} onPress={() => eliminarFila(d.id)}>
                      <Ionicons name="close-circle" size={20} color="#e91e8c" />
                    </TouchableOpacity>
                  </View>
                ))}
                {detalles.length === 0 && (
                  <View style={s.trVacio}>
                    <Text style={s.trVacioText}>Sin productos agregados</Text>
                  </View>
                )}
              </View>

              {/* Espacio entre tabla y totales */}
              <TouchableOpacity style={[s.btnRosa, { marginBottom: 30 }]} onPress={agregarFila}>
                <Text style={s.btnRosaText}>Agregar producto</Text>
              </TouchableOpacity>

              {/* Totales */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Costo Total</Text>
                <TextInput style={s.inputLine} value={`$ ${costoTotal}`} editable={false} />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Pago Recibido</Text>
                <TextInput 
                  style={s.inputLine} 
                  keyboardType="numeric" 
                  value={pagoRecibido} 
                  onChangeText={setPagoRecibido} 
                />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Cambio</Text>
                <TextInput style={s.inputLine} value={`$ ${cambio}`} editable={false} />
              </View>

              <TouchableOpacity 
                style={[s.btnRosa, { marginTop: 20, opacity: cargando ? 0.6 : 1 }]} 
                onPress={registrarVenta}
                disabled={cargando}
              >
                {cargando ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.btnRosaText}>Registrar Venta</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={s.btnRegresar} onPress={() => router.back()}>
                <Text style={s.btnRegresarText}>Regresar</Text>
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
  
  backIcon: { position: 'absolute', top: 20, left: 20 },
  
  mainTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: ACCENT, 
    textAlign: 'center', 
    marginBottom: 25 
  },
  
  subTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: ACCENT, 
    textAlign: 'center', 
    marginTop: 30,
    marginBottom: 20 
  },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, color: DARK, marginBottom: 5 },
  inputLine: { 
    borderBottomWidth: 1, 
    borderBottomColor: BORDER, 
    paddingVertical: 5, 
    fontSize: 16, 
    color: DARK 
  },

  pickerWrapper: { position: 'relative' },
  pickerOverlay: { flexDirection: 'row', gap: 15, marginTop: 5 },
  opt: { fontSize: 13, color: ACCENT, fontWeight: '600' },

  // Tabla rediseñada con anchos fijos
  tabla: { borderWidth: 1, borderColor: '#e0c0d8', marginBottom: 15, borderRadius: 8, overflow: 'hidden' },
  thRow: { flexDirection: 'row', backgroundColor: '#f3d6ec', borderBottomWidth: 2, borderBottomColor: '#e91e8c' },
  th: { fontSize: 11, fontWeight: 'bold', paddingVertical: 10, paddingHorizontal: 3, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#d9a8cc', color: DARK },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f0e0eb', alignItems: 'center', minHeight: 44 },
  trPar: { backgroundColor: '#fff' },
  trImpar: { backgroundColor: '#fdf5fb' },
  td: { fontSize: 13, paddingVertical: 6, paddingHorizontal: 3, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#f0e0eb', color: DARK },
  tdText: { fontSize: 13, paddingVertical: 6, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#f0e0eb', color: DARK, fontWeight: '600' },
  btnEliminar: { width: 28, alignItems: 'center', justifyContent: 'center' },
  trVacio: { paddingVertical: 16, alignItems: 'center' },
  trVacioText: { fontSize: 12, color: '#bbb', fontStyle: 'italic' },

  btnRosa: { 
    backgroundColor: ACCENT, 
    paddingVertical: 12, 
    borderRadius: 5, 
    alignItems: 'center' 
  },
  btnRosaText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  btnRegresar: { marginTop: 15, alignItems: 'center' },
  btnRegresarText: { color: DARK, fontSize: 14, textDecorationLine: 'underline' },
});