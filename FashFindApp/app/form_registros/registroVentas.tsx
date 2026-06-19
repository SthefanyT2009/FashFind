import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Platform, ImageBackground,
  Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
const ERROR_COLOR = '#DC2626';

const API_BASE = 'http://192.168.1.7/FashFind/api';

interface DetalleItem {
  id: number;
  id_producto: string;
  nombre_producto: string;
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
  estado: string;
}

interface Vendedor {
  id_usuario: number;
  nombres: string;
  apellidos: string;
}

export default function RegistroVentas() {
  const router = useRouter();

  const [fechaVenta, setFechaVenta]       = useState('');
  const [hora, setHora]                   = useState('');
  const [metodoPago, setMetodoPago]       = useState<'Efectivo' | 'Transferencia'>('Efectivo');
  const [idVendedor, setIdVendedor]       = useState('');
  const [nombreVendedor, setNombreVendedor] = useState('Seleccionar Vendedor');
  const [pagoRecibido, setPagoRecibido]   = useState('');
  const [costoTotal, setCostoTotal]       = useState(0);
  const [cambio, setCambio]               = useState(0);
  const [detalles, setDetalles]           = useState<DetalleItem[]>([]);
  const [nextId, setNextId]               = useState(1);
  const [cargando, setCargando]           = useState(false);

  const [productos, setProductos]         = useState<Producto[]>([]);
  const [vendedores, setVendedores]       = useState<Vendedor[]>([]);
  const [modalVendedor, setModalVendedor] = useState(false);
  const [modalProducto, setModalProducto] = useState<{ visible: boolean, filaId: number }>({ visible: false, filaId: 0 });

  const [errores, setErrores] = useState({
    vendedor: '',
    pagoRecibido: '',
  });

  useEffect(() => {
    const ahora = new Date();
    const yyyy = ahora.getFullYear();
    const mm = String(ahora.getMonth() + 1).padStart(2, '0');
    const dd = String(ahora.getDate()).padStart(2, '0');
    setFechaVenta(`${yyyy}-${mm}-${dd}`);
    setHora(ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }));
    
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resP, resV] = await Promise.all([
        fetch(`${API_BASE}/productos.php`),
        fetch(`${API_BASE}/usuarios.php?cargo=Vendedor`)
      ]);
      const jsonP = await resP.json();
      const jsonV = await resV.json();
      
      if (jsonP.success) setProductos(jsonP.data.filter((p: Producto) => p.estado === 'Activo'));
      if (jsonV.success) setVendedores(jsonV.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    const total = detalles.reduce((acc, d) => acc + d.sub_total, 0);
    setCostoTotal(total);
    const pago = parseFloat(pagoRecibido) || 0;
    setCambio(pago >= total ? pago - total : 0);
  }, [detalles, pagoRecibido]);

  const agregarFila = () => {
    setDetalles(prev => [...prev, { id: nextId, id_producto: '', nombre_producto: 'Seleccionar', cantidad: '', precio: '', sub_total: 0 }]);
    setNextId(n => n + 1);
  };

  const eliminarFila = (id: number) => {
    setDetalles(prev => prev.filter(d => d.id !== id));
  };

  const seleccionarVendedor = (v: Vendedor) => {
    setIdVendedor(v.id_usuario.toString());
    setNombreVendedor(`${v.nombres} ${v.apellidos}`);
    setModalVendedor(false);
    setErrores({ ...errores, vendedor: '' });
  };

  const seleccionarProducto = (p: Producto) => {
    const id = modalProducto.filaId;
    setDetalles(prev => prev.map(d => {
      if (d.id !== id) return d;
      return { 
        ...d, 
        id_producto: p.id_producto.toString(), 
        nombre_producto: p.nombre_producto,
        precio: p.precio.toString(),
        sub_total: (parseFloat(d.cantidad) || 0) * p.precio
      };
    }));
    setModalProducto({ visible: false, filaId: 0 });
  };

  const actualizarCantidad = (id: number, cant: string) => {
    setDetalles(prev => prev.map(d => {
      if (d.id !== id) return d;
      const c = parseFloat(cant) || 0;
      const p = parseFloat(d.precio) || 0;
      return { ...d, cantidad: cant, sub_total: c * p };
    }));
  };

  const handlePagoRecibidoChange = (text: string) => {
    const soloNumeros = text.replace(/[^0-9]/g, '');
    setPagoRecibido(soloNumeros);
    if (soloNumeros.trim()) {
      setErrores({ ...errores, pagoRecibido: '' });
    }
  };

  const registrarVenta = async () => {
    let hayErrores = false;
    const nuevosErrores = { ...errores };

    if (!idVendedor.trim()) {
      nuevosErrores.vendedor = 'Selecciona un Vendedor.';
      hayErrores = true;
    } else {
      nuevosErrores.vendedor = '';
    }

    if (!pagoRecibido.trim()) {
      nuevosErrores.pagoRecibido = 'El pago recibido es obligatorio.';
      hayErrores = true;
    } else {
      nuevosErrores.pagoRecibido = '';
    }

    setErrores(nuevosErrores);

    // Si hay errores en los campos principales, detener
    if (hayErrores) return;

    // Validar productos
    if (detalles.length === 0) {
      mostrarAlerta('Error', 'Por favor agrega al menos un producto.');
      return;
    }

    setCargando(true);
    try {
      const ventaData = {
        fecha_venta: fechaVenta,
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
                <View style={s.pickerOverlay}>
                  <TouchableOpacity style={[s.chip, metodoPago === 'Efectivo' && s.chipActivo]} onPress={() => setMetodoPago('Efectivo')}>
                    <Text style={[s.chipText, metodoPago === 'Efectivo' && s.chipTextActivo]}>Efectivo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.chip, metodoPago === 'Transferencia' && s.chipActivo]} onPress={() => setMetodoPago('Transferencia')}>
                    <Text style={[s.chipText, metodoPago === 'Transferencia' && s.chipTextActivo]}>Transferencia</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Vendedor *</Text>
                <TouchableOpacity style={s.inputLine} onPress={() => setModalVendedor(true)}>
                  <Text style={{ color: idVendedor ? DARK : '#bbb' }}>{nombreVendedor}</Text>
                </TouchableOpacity>
                {errores.vendedor ? <Text style={s.errorText}>{errores.vendedor}</Text> : null}
              </View>

              <Text style={s.subTitle}>Productos</Text>

              <View style={s.tabla}>
                <View style={s.thRow}>
                  <Text style={[s.th, { width: 100 }]}>Producto</Text>
                  <Text style={[s.th, { width: 60 }]}>Cant.</Text>
                  <Text style={[s.th, { width: 90 }]}>Precio</Text>
                  <Text style={[s.th, { width: 80 }]}>Subtotal</Text>
                  <Text style={[s.th, { width: 32, borderRightWidth: 0 }]}> </Text>
                </View>
                {detalles.map((d, i) => (
                  <View key={d.id} style={[s.tr, i % 2 === 0 ? s.trPar : s.trImpar]}>
                    <TouchableOpacity 
                      style={[s.td, { width: 100 }]} 
                      onPress={() => setModalProducto({ visible: true, filaId: d.id })}
                    >
                      <Text numberOfLines={1} style={{ fontSize: 11 }}>{d.nombre_producto}</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[s.td, { width: 60 }]}
                      value={d.cantidad}
                      keyboardType="numeric"
                      onChangeText={v => actualizarCantidad(d.id, v)}
                      placeholder="0"
                    />
                    <Text style={[s.tdText, { width: 90 }]}>${parseFloat(d.precio || '0').toLocaleString('es-CO')}</Text>
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

              <TouchableOpacity style={[s.btnRosa, { marginBottom: 30 }]} onPress={agregarFila}>
                <Text style={s.btnRosaText}>Agregar producto</Text>
              </TouchableOpacity>

              <View style={s.inputGroup}>
                <Text style={s.label}>Costo Total</Text>
                <Text style={s.inputLine}>$ {costoTotal.toLocaleString('es-CO')}</Text>
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Pago Recibido *</Text>
                <TextInput 
                  style={s.inputLine} 
                  keyboardType="numeric" 
                  value={pagoRecibido} 
                  onChangeText={handlePagoRecibidoChange} 
                  placeholder="0"
                  maxLength={10}
                />
                {errores.pagoRecibido ? <Text style={s.errorText}>{errores.pagoRecibido}</Text> : null}
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Cambio</Text>
                <Text style={s.inputLine}>$ {cambio.toLocaleString('es-CO')}</Text>
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

      {/* Modal Vendedores */}
      <Modal visible={modalVendedor} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Seleccionar Vendedor</Text>
            <FlatList
              data={vendedores}
              keyExtractor={item => item.id_usuario.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.modalItem} onPress={() => seleccionarVendedor(item)}>
                  <Text>{item.nombres} {item.apellidos}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={s.btnCerrar} onPress={() => setModalVendedor(false)}>
              <Text style={{ color: '#fff' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Productos */}
      <Modal visible={modalProducto.visible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Seleccionar Producto</Text>
            <FlatList
              data={productos}
              keyExtractor={item => item.id_producto.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.modalItem} onPress={() => seleccionarProducto(item)}>
                  <Text>{item.nombre_producto} ({item.talla} - {item.color})</Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>Stock: {item.stock_disponible} | ${item.precio}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={s.btnCerrar} onPress={() => setModalProducto({ visible: false, filaId: 0 })}>
              <Text style={{ color: '#fff' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: ACCENT, textAlign: 'center', marginBottom: 25 },
  subTitle: { fontSize: 22, fontWeight: 'bold', color: ACCENT, textAlign: 'center', marginTop: 30, marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, color: DARK, marginBottom: 5 },
  inputLine: { borderBottomWidth: 1, borderBottomColor: BORDER, paddingVertical: 5, fontSize: 16, color: DARK, minHeight: 35, justifyContent: 'center' },
  errorText: { color: ERROR_COLOR, fontSize: 12, marginTop: 3 },
  pickerOverlay: { flexDirection: 'row', gap: 10, marginTop: 5 },
  chip: { borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 5 },
  chipActivo: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText: { fontSize: 12, color: DARK },
  chipTextActivo: { color: '#fff' },
  tabla: { borderWidth: 1, borderColor: '#e0c0d8', marginBottom: 15, borderRadius: 8, overflow: 'hidden' },
  thRow: { flexDirection: 'row', backgroundColor: '#f3d6ec', borderBottomWidth: 2, borderBottomColor: '#e91e8c' },
  th: { fontSize: 11, fontWeight: 'bold', paddingVertical: 10, paddingHorizontal: 3, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#d9a8cc', color: DARK },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f0e0eb', alignItems: 'center', minHeight: 44 },
  trPar: { backgroundColor: '#fff' },
  trImpar: { backgroundColor: '#fdf5fb' },
  td: { fontSize: 11, paddingVertical: 6, paddingHorizontal: 3, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#f0e0eb', color: DARK },
  tdText: { fontSize: 11, paddingVertical: 6, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#f0e0eb', color: DARK, fontWeight: '600' },
  btnEliminar: { width: 28, alignItems: 'center', justifyContent: 'center' },
  trVacio: { paddingVertical: 16, alignItems: 'center' },
  trVacioText: { fontSize: 12, color: '#bbb', fontStyle: 'italic' },
  btnRosa: { backgroundColor: ACCENT, paddingVertical: 12, borderRadius: 5, alignItems: 'center' },
  btnRosaText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnRegresar: { marginTop: 15, alignItems: 'center' },
  btnRegresarText: { color: DARK, fontSize: 14, textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '85%', maxHeight: '70%', borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: ACCENT },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  btnCerrar: { backgroundColor: DARK, padding: 10, borderRadius: 5, marginTop: 15, alignItems: 'center' }
});