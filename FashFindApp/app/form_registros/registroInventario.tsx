import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Platform, ImageBackground,
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
const ERROR  = '#e74c3c';

const API_BASE = Platform.OS === 'web'
  ? 'http://localhost/FashFind/api'
  : 'http://172.30.3.163/FashFind/api';

interface Producto {
  id_producto: number;
  nombre_producto: string;
  talla: string;
  color: string;
}

interface Errores {
  id_producto?:      string;
  stock_disponible?: string;
  stock_minimo?:     string;
}

function validarCampos(
  id_producto:      string,
  stock_disponible: string,
  stock_minimo:     string,
): Errores {
  const e: Errores = {};

  if (!id_producto) {
    e.id_producto = 'Debe seleccionar un producto.';
  }

  if (!stock_disponible.trim()) {
    e.stock_disponible = 'El stock disponible es obligatorio.';
  } else if (!/^\d+$/.test(stock_disponible.trim())) {
    e.stock_disponible = 'Solo se permiten números enteros.';
  } else if (parseInt(stock_disponible) < 10) {
    e.stock_disponible = 'El stock mínimo permitido es 10.';
  } else if (parseInt(stock_disponible) > 99999) {
    e.stock_disponible = 'El stock no puede superar 99.999 unidades.';
  }

  if (!stock_minimo.trim()) {
    e.stock_minimo = 'El stock mínimo es obligatorio.';
  } else if (!/^\d+$/.test(stock_minimo.trim())) {
    e.stock_minimo = 'Solo se permiten números enteros.';
  } else if (parseInt(stock_minimo) < 10) {
    e.stock_minimo = 'El stock mínimo permitido es 10.';
  } else if (parseInt(stock_minimo) > 9999) {
    e.stock_minimo = 'El stock mínimo no puede superar 9.999 unidades.';
  }

  return e;
}

export default function RegistroInventario() {
  const router = useRouter();

  const [productos,       setProductos]       = useState<Producto[]>([]);
  const [idProducto,      setIdProducto]      = useState('');
  const [stockDisponible, setStockDisponible] = useState('');
  const [stockMinimo,     setStockMinimo]     = useState('');
  const [errores,         setErrores]         = useState<Errores>({});
  const [cargando,        setCargando]        = useState(false);
  const [cargandoProds,   setCargandoProds]   = useState(true);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [productoSelec,   setProductoSelec]   = useState<Producto | null>(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const res  = await fetch(`${API_BASE}/productos.php`);
      const json = await res.json();
      if (json.success) {
        // Solo productos activos
        const activos = (json.data as Producto[]).filter((p: any) => p.estado === 'Activo');
        setProductos(activos);
      }
    } catch {
      mostrarAlerta('Error', 'No se pudieron cargar los productos.');
    } finally {
      setCargandoProds(false);
    }
  };

  const seleccionarProducto = (p: Producto) => {
    setIdProducto(String(p.id_producto));
    setProductoSelec(p);
    setDropdownAbierto(false);
    setErrores(prev => ({ ...prev, id_producto: undefined }));
  };

  const handleNumero = (setter: (v: string) => void, campo: keyof Errores) =>
    (val: string) => {
      const limpio = val.replace(/[^0-9]/g, '');
      setter(limpio);
      setErrores(prev => ({ ...prev, [campo]: undefined }));
    };

  const registrarInventario = async () => {
    const errs = validarCampos(idProducto, stockDisponible, stockMinimo);
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      mostrarAlerta('Error de validación', 'Por favor, revisa los campos marcados.');
      return;
    }

    setCargando(true);
    try {
      const body = {
        id_producto:      parseInt(idProducto),
        stock_disponible: parseInt(stockDisponible),
        stock_minimo:     parseInt(stockMinimo),
      };

      const res  = await fetch(`${API_BASE}/inventario.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const json = await res.json();

      if (json.success) {
        mostrarAlerta('Éxito', 'Inventario registrado correctamente.', () => router.back());
      } else {
        mostrarAlerta('Error', json.mensaje ?? 'No se pudo registrar el inventario.');
      }
    } catch {
      mostrarAlerta('Error de conexión', 'No se pudo conectar al servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={s.container}>
      <ImageBackground source={require('../../assets/images/fondoLogin.jpeg')} style={s.bg} resizeMode="cover">
        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={s.card}>

              <TouchableOpacity onPress={() => router.back()} style={s.backIcon}>
                <Ionicons name="arrow-back" size={20} color={DARK} />
              </TouchableOpacity>

              <Text style={s.mainTitle}>Registrar Inventario</Text>

              {/* ── Producto ── */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Nombre del Producto *</Text>

                {cargandoProds ? (
                  <ActivityIndicator size="small" color={ACCENT} style={{ marginTop: 8 }} />
                ) : (
                  <>
                    <TouchableOpacity
                      style={[s.selector, errores.id_producto && s.selectorError]}
                      onPress={() => setDropdownAbierto(v => !v)}
                    >
                      <Text style={[s.selectorText, !productoSelec && { color: '#bbb' }]}>
                        {productoSelec
                          ? `${productoSelec.nombre_producto} — Talla: ${productoSelec.talla} | Color: ${productoSelec.color}`
                          : 'Selecciona un producto'}
                      </Text>
                      <Ionicons name={dropdownAbierto ? 'chevron-up' : 'chevron-down'} size={16} color={DARK} />
                    </TouchableOpacity>

                    {dropdownAbierto && (
                      <View style={s.dropdown}>
                        <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                          {productos.length === 0 ? (
                            <Text style={s.dropdownVacio}>No hay productos activos</Text>
                          ) : (
                            productos.map(p => (
                              <TouchableOpacity
                                key={p.id_producto}
                                style={s.dropdownItem}
                                onPress={() => seleccionarProducto(p)}
                              >
                                <Text style={s.dropdownItemText}>
                                  {p.nombre_producto} — T: {p.talla} | C: {p.color}
                                </Text>
                              </TouchableOpacity>
                            ))
                          )}
                        </ScrollView>
                      </View>
                    )}
                  </>
                )}
                {errores.id_producto && <Text style={s.errorText}>{errores.id_producto}</Text>}
              </View>

              {/* ── Stock disponible ── */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Stock Disponible * (mín. 10 — máx. 99.999)</Text>
                <TextInput
                  style={[s.inputLine, errores.stock_disponible && s.inputError]}
                  value={stockDisponible}
                  onChangeText={handleNumero(setStockDisponible, 'stock_disponible')}
                  keyboardType="numeric"
                  placeholder="Ej: 50"
                  placeholderTextColor="#bbb"
                  maxLength={5}
                />
                {errores.stock_disponible && <Text style={s.errorText}>{errores.stock_disponible}</Text>}
              </View>

              {/* ── Stock mínimo ── */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Stock Mínimo * (mín. 10 — máx. 9.999)</Text>
                <TextInput
                  style={[s.inputLine, errores.stock_minimo && s.inputError]}
                  value={stockMinimo}
                  onChangeText={handleNumero(setStockMinimo, 'stock_minimo')}
                  keyboardType="numeric"
                  placeholder="Ej: 10"
                  placeholderTextColor="#bbb"
                  maxLength={4}
                />
                {errores.stock_minimo && <Text style={s.errorText}>{errores.stock_minimo}</Text>}
              </View>

              {/* ── Botones ── */}
              <TouchableOpacity
                style={[s.btnRosa, { marginTop: 20, opacity: cargando ? 0.6 : 1 }]}
                onPress={registrarInventario}
                disabled={cargando}
              >
                {cargando
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={s.btnRosaText}>Registrar Inventario</Text>
                }
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
  container:     { flex: 1 },
  bg:            { flex: 1, width: '100%', height: '100%' },
  safe:          { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },

  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width:           Platform.OS === 'web' ? 450 : '90%',
    borderRadius:    15,
    padding:         30,
    shadowColor:     '#000',
    shadowOpacity:   0.2,
    shadowRadius:    10,
    elevation:       10,
  },

  backIcon:  { alignSelf: 'flex-start', marginBottom: 10 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: ACCENT, textAlign: 'center', marginBottom: 25 },

  inputGroup: { marginBottom: 20 },
  label:      { fontSize: 16, color: DARK, marginBottom: 5 },
  inputLine:  { borderBottomWidth: 1, borderBottomColor: BORDER, paddingVertical: 5, fontSize: 16, color: DARK },
  inputError: { borderBottomColor: ERROR },
  errorText:  { color: ERROR, fontSize: 12, marginTop: 4 },

  selector: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 8,
  },
  selectorError: { borderBottomColor: ERROR },
  selectorText:  { fontSize: 15, color: DARK, flex: 1 },

  dropdown: {
    borderWidth:   1,
    borderColor:   '#e0c0d8',
    borderRadius:  8,
    marginTop:     4,
    backgroundColor: '#fff',
    shadowColor:   '#000',
    shadowOpacity: 0.1,
    shadowRadius:  4,
    elevation:     4,
    zIndex:        100,
  },
  dropdownItem:     { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3e0ef' },
  dropdownItemText: { fontSize: 14, color: DARK },
  dropdownVacio:    { padding: 12, color: '#aaa', fontStyle: 'italic', textAlign: 'center' },

  btnRosa:         { backgroundColor: ACCENT, paddingVertical: 12, borderRadius: 5, alignItems: 'center' },
  btnRosaText:     { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnRegresar:     { marginTop: 15, alignItems: 'center' },
  btnRegresarText: { color: DARK, fontSize: 14, textDecorationLine: 'underline' },
});