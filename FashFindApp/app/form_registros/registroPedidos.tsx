import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Platform, ImageBackground,
  Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const ACCENT = '#e91e8c';
const DARK   = '#3A3A3A';
const BORDER = '#000';
const ERROR_COLOR = '#DC2626';

const API_BASE = 'http://172.30.4.210/FashFind/api';

const mostrarAlerta = (titulo: string, mensaje: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    onOk?.();
  } else {
    Alert.alert(titulo, mensaje, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
};

const METODOS_PAGO   = ['Nequi', 'Daviplata', 'Transferencia', 'Tarjeta'] as const;
const TIPOS_ENTREGA  = ['Domicilio', 'Recoge en tienda'] as const;
const ESTADOS        = ['Por Entregar', 'Entregado'] as const;

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

interface Cliente {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  cc: string;
}

export default function RegistroPedidos() {
  const router = useRouter();

  const [fechaPedido, setFechaPedido]               = useState('');
  const [horaPedido, setHoraPedido]                 = useState('');
  const [metodoPago, setMetodoPago]                 = useState<typeof METODOS_PAGO[number]>('Nequi');
  const [tipoEntrega, setTipoEntrega]               = useState<typeof TIPOS_ENTREGA[number]>('Domicilio');
  const [direccionEntrega, setDireccionEntrega]     = useState('');
  const [ciudadEntrega, setCiudadEntrega]           = useState('');
  const [telefonoContacto, setTelefonoContacto]     = useState('');
  const [fechaEntrega, setFechaEntrega]             = useState('');
  const [costoEnvio, setCostoEnvio]                 = useState('');
  const [idUsuario, setIdUsuario]                   = useState('');
  const [nombreCliente, setNombreCliente]           = useState('Seleccionar Cliente');
  const [estado, setEstado]                         = useState<typeof ESTADOS[number]>('Por Entregar');
  const [detalles, setDetalles]                     = useState<DetalleItem[]>([]);
  const [nextId, setNextId]                         = useState(1);
  const [totalPedido, setTotalPedido]               = useState(0);
  const [cargando, setCargando]                     = useState(false);

  const [productos, setProductos]         = useState<Producto[]>([]);
  const [clientes, setClientes]           = useState<Cliente[]>([]);
  const [modalCliente, setModalCliente]   = useState(false);
  const [modalProducto, setModalProducto] = useState<{ visible: boolean, filaId: number }>({ visible: false, filaId: 0 });
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);

  const [errores, setErrores] = useState({
    idUsuario: '',
    direccionEntrega: '',
    ciudadEntrega: '',
    telefonoContacto: '',
    fechaEntrega: '',
    costoEnvio: '',
  });

  useEffect(() => {
    const ahora = new Date();
    const yyyy  = ahora.getFullYear();
    const mm    = String(ahora.getMonth() + 1).padStart(2, '0');
    const dd    = String(ahora.getDate()).padStart(2, '0');
    setFechaPedido(`${yyyy}-${mm}-${dd}`);
    const hh  = String(ahora.getHours()).padStart(2, '0');
    const min = String(ahora.getMinutes()).padStart(2, '0');
    setHoraPedido(`${hh}:${min}`);

    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resP, resC] = await Promise.all([
        fetch(`${API_BASE}/productos.php`),
        fetch(`${API_BASE}/usuarios.php?cargo=Cliente`)
      ]);
      const jsonP = await resP.json();
      const jsonC = await resC.json();
      
      if (jsonP.success) setProductos(jsonP.data.filter((p: Producto) => p.estado === 'Activo'));
      if (jsonC.success) setClientes(jsonC.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    const subtotales = detalles.reduce((acc, d) => acc + d.sub_total, 0);
    const envio      = parseFloat(costoEnvio) || 0;
    setTotalPedido(subtotales + envio);
  }, [detalles, costoEnvio]);

  const agregarFila = () => {
    setDetalles(prev => [...prev, { id: nextId, id_producto: '', nombre_producto: 'Seleccionar', cantidad: '', precio: '', sub_total: 0 }]);
    setNextId(n => n + 1);
  };

  const eliminarFila = (id: number) => {
    setDetalles(prev => prev.filter(d => d.id !== id));
  };

  const seleccionarCliente = (c: Cliente) => {
    setIdUsuario(c.id_usuario.toString());
    setNombreCliente(`${c.nombres} ${c.apellidos}`);
    setModalCliente(false);
    setErrores({ ...errores, idUsuario: '' });
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

  // --- VALIDACIONES DE ENTRADA ---

  const handleCiudadChange = (text: string) => {
    const filtered = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
    setCiudadEntrega(filtered);
  };

  const handleTelefonoChange = (text: string) => {
    const filtered = text.replace(/[^0-9]/g, '');
    if (filtered.length <= 10) {
      setTelefonoContacto(filtered);
    }
  };

  const handleCostoEnvioChange = (text: string) => {
    const filtered = text.replace(/[^0-9]/g, '');
    setCostoEnvio(filtered);
  };

  const actualizarCantidad = (id: number, cant: string) => {
    const filtered = cant.replace(/[^0-9]/g, '');
    
    setDetalles(prev => prev.map(d => {
      if (d.id !== id) return d;
      
      if (d.id_producto) {
        const prod = productos.find(p => p.id_producto.toString() === d.id_producto);
        if (prod && parseInt(filtered) > prod.stock_disponible) {
          return d;
        }
      }

      const c = parseFloat(filtered) || 0;
      const p = parseFloat(d.precio) || 0;
      return { ...d, cantidad: filtered, sub_total: c * p };
    }));
  };

  const registrarPedido = async () => {
    let hayErrores = false;
    const nuevosErrores = { ...errores };

    if (!idUsuario.trim()) {
      nuevosErrores.idUsuario = 'Selecciona un Cliente.';
      hayErrores = true;
    } else {
      nuevosErrores.idUsuario = '';
    }

    if (!direccionEntrega.trim()) {
      nuevosErrores.direccionEntrega = 'Ingresa la Dirección de Entrega.';
      hayErrores = true;
    } else {
      nuevosErrores.direccionEntrega = '';
    }

    if (!ciudadEntrega.trim()) {
      nuevosErrores.ciudadEntrega = 'Ingresa la Ciudad de Entrega.';
      hayErrores = true;
    } else {
      nuevosErrores.ciudadEntrega = '';
    }

    if (!telefonoContacto.trim() || telefonoContacto.length < 7) {
      nuevosErrores.telefonoContacto = 'Ingresa un Teléfono válido (mínimo 7 dígitos).';
      hayErrores = true;
    } else {
      nuevosErrores.telefonoContacto = '';
    }

    if (!fechaEntrega.trim()) {
      nuevosErrores.fechaEntrega = 'Ingresa la Fecha de Entrega.';
      hayErrores = true;
    } else {
      nuevosErrores.fechaEntrega = '';
    }

    setErrores(nuevosErrores);

    // Si hay errores, detener aquí
    if (hayErrores) return;
    
    if (detalles.length === 0) {
      mostrarAlerta('Sin productos', 'Agrega al menos un producto.');
      return;
    }
    
    const filaIncompleta = detalles.find(d => !d.id_producto || !d.cantidad || !d.precio);
    if (filaIncompleta) {
      mostrarAlerta('Datos incompletos', 'Completa todas las filas de productos.');
      return;
    }

    const body = {
      metodo_pago: metodoPago, costo_envio: parseFloat(costoEnvio) || 0,
      tipo_entrega: tipoEntrega, direccion_entrega: direccionEntrega,
      ciudad_entrega: ciudadEntrega, telefono_contacto: telefonoContacto,
      fecha_entrega: fechaEntrega, estado, id_usuario: parseInt(idUsuario),
      productos: detalles.map(d => ({
        id_producto: parseInt(d.id_producto),
        cantidad: parseInt(d.cantidad),
        precio: parseFloat(d.precio),
      })),
    };

    try {
      setCargando(true);
      const res  = await fetch(`${API_BASE}/pedidos.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

              <Text style={s.mainTitle}>Nuevo Pedido</Text>

              <Text style={s.subTitle}>Datos del Pedido</Text>

              <View style={s.inputGroup}>
                <Text style={s.label}>Fecha Pedido</Text>
                <TextInput style={s.inputLine} value={fechaPedido} editable={false} />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Hora Pedido</Text>
                <TextInput style={s.inputLine} value={horaPedido} editable={false} />
              </View>

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
                <Text style={s.label}>Dirección Entrega *</Text>
                <TextInput 
                  style={s.inputLine} 
                  placeholder="Ej: Calle 10 #5-20" 
                  placeholderTextColor="#bbb" 
                  value={direccionEntrega} 
                  onChangeText={setDireccionEntrega} 
                  maxLength={100}
                />
                {errores.direccionEntrega ? <Text style={s.errorText}>{errores.direccionEntrega}</Text> : null}
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Ciudad Entrega *</Text>
                <TextInput 
                  style={s.inputLine} 
                  placeholder="Ej: Bogotá" 
                  placeholderTextColor="#bbb" 
                  value={ciudadEntrega} 
                  onChangeText={handleCiudadChange} 
                  maxLength={50}
                />
                {errores.ciudadEntrega ? <Text style={s.errorText}>{errores.ciudadEntrega}</Text> : null}
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Teléfono Contacto *</Text>
                <TextInput 
                  style={s.inputLine} 
                  keyboardType="phone-pad" 
                  placeholder="Ej: 3001234567" 
                  placeholderTextColor="#bbb" 
                  value={telefonoContacto} 
                  onChangeText={handleTelefonoChange} 
                  maxLength={10}
                />
                {errores.telefonoContacto ? <Text style={s.errorText}>{errores.telefonoContacto}</Text> : null}
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Fecha de Entrega *</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={fechaEntrega}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFechaEntrega(e.target.value)}
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
                    <Text style={{ color: fechaEntrega ? DARK : '#bbb' }}>
                      {fechaEntrega || 'Seleccionar fecha'}
                    </Text>
                  </TouchableOpacity>
                )}
                {errores.fechaEntrega ? <Text style={s.errorText}>{errores.fechaEntrega}</Text> : null}
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Costo de Envío</Text>
                <TextInput 
                  style={s.inputLine} 
                  keyboardType="numeric" 
                  placeholder="0" 
                  placeholderTextColor="#bbb" 
                  value={costoEnvio} 
                  onChangeText={handleCostoEnvioChange} 
                  maxLength={10}
                />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Cliente *</Text>
                <TouchableOpacity style={s.inputLine} onPress={() => setModalCliente(true)}>
                  <Text style={{ color: idUsuario ? DARK : '#bbb' }}>{nombreCliente}</Text>
                </TouchableOpacity>
                {errores.idUsuario ? <Text style={s.errorText}>{errores.idUsuario}</Text> : null}
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

              <Text style={s.subTitle}>Productos del Pedido</Text>

              <View style={s.tabla}>
                <View style={s.thRow}>
                  <Text style={[s.th, { width: 100 }]}>Producto</Text>
                  <Text style={[s.th, { width: 60 }]}>Cant.</Text>
                  <Text style={[s.th, { width: 90 }]}>Precio</Text>
                  <Text style={[s.th, { width: 80 }]}>Subtotal</Text>
                  <Text style={[s.th, { width: 32, borderRightWidth: 0 }]}> </Text>
                </View>

                {detalles.length === 0 && (
                  <View style={s.trVacio}>
                    <Text style={s.trVacioText}>Sin productos agregados</Text>
                  </View>
                )}

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
                      keyboardType="numeric" 
                      placeholder="0" 
                      placeholderTextColor="#bbb"
                      value={d.cantidad} 
                      onChangeText={v => actualizarCantidad(d.id, v)}
                      maxLength={5}
                    />
                    <Text style={[s.tdText, { width: 90 }]}>${parseFloat(d.precio || '0').toLocaleString('es-CO')}</Text>
                    <Text style={[s.tdText, { width: 80 }]}>${d.sub_total.toLocaleString('es-CO')}</Text>
                    <TouchableOpacity style={s.btnEliminar} onPress={() => eliminarFila(d.id)}>
                      <Ionicons name="close-circle" size={20} color="#e91e8c" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={[s.btnRosa, { marginBottom: 30 }]} onPress={agregarFila}>
                <Text style={s.btnRosaText}>Agregar producto</Text>
              </TouchableOpacity>

              <View style={s.inputGroup}>
                <Text style={s.label}>Total Pedido</Text>
                <Text style={s.inputLine}>$ {totalPedido.toLocaleString('es-CO')}</Text>
              </View>

              <TouchableOpacity style={[s.btnRosa, { marginTop: 10 }]} onPress={registrarPedido} disabled={cargando}>
                {cargando
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.btnRosaText}>Registrar Pedido</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={s.btnRegresar} onPress={() => router.back()}>
                <Text style={s.btnRegresarText}>Regresar</Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {/* DatePicker para Móvil */}
      {mostrarDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={fechaEntrega ? new Date(fechaEntrega) : new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, date) => {
            setMostrarDatePicker(false);
            if (date) {
              setFechaEntrega(date.toISOString().split('T')[0]);
            }
          }}
        />
      )}

      {/* Modal Clientes */}
      <Modal visible={modalCliente} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Seleccionar Cliente</Text>
            <FlatList
              data={clientes}
              keyExtractor={item => item.id_usuario.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.modalItem} onPress={() => seleccionarCliente(item)}>
                  <Text>{item.nombres} {item.apellidos}</Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>CC: {item.cc}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={s.btnCerrar} onPress={() => setModalCliente(false)}>
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
  subTitle:  { fontSize: 22, fontWeight: 'bold', color: ACCENT, textAlign: 'center', marginTop: 30, marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label:      { fontSize: 16, color: DARK, marginBottom: 5 },
  inputLine:  { borderBottomWidth: 1, borderBottomColor: BORDER, paddingVertical: 5, fontSize: 16, color: DARK, minHeight: 35, justifyContent: 'center' },
  errorText:  { color: ERROR_COLOR, fontSize: 12, marginTop: 3 },
  chipsWrap:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip:           { borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 5 },
  chipActivo:     { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText:       { fontSize: 12, color: DARK },
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