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
const ERROR  = '#e74c3c';

const API_BASE = Platform.OS === 'web'
  ? 'http://localhost/FashFind/api'
  : 'http://192.168.1.7/FashFind/api';

const mostrarAlerta = (titulo: string, mensaje: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    onOk?.();
  } else {
    Alert.alert(titulo, mensaje, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
};

interface Producto {
  id_producto: number;
  nombre_producto: string;
  talla: string;
  color: string;
}

interface Errores {
  stock_disponible?: string;
  stock_minimo?:     string;
}

function validarCampos(
  stock_disponible: string,
  stock_minimo:     string,
): Errores {
  const e: Errores = {};

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

export default function EditarInventario() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [stockDisponible, setStockDisponible] = useState('');
  const [stockMinimo,     setStockMinimo]     = useState('');
  const [producto,        setProducto]        = useState<Producto | null>(null);
  const [errores,         setErrores]         = useState<Errores>({});
  const [cargando,        setCargando]        = useState(false);
  const [cargandoDatos,   setCargandoDatos]   = useState(true);

  useEffect(() => {
    if (!id) return;
    cargarInventario();
  }, [id]);

  const cargarInventario = async () => {
    try {
      const res  = await fetch(`${API_BASE}/inventario.php?id=${id}`);
      const json = await res.json();
      if (json.success) {
        const inv = json.data;
        setStockDisponible(String(inv.stock_disponible ?? ''));
        setStockMinimo(String(inv.stock_minimo ?? ''));
        setProducto({
          id_producto:     inv.id_producto,
          nombre_producto: inv.nombre_producto,
          talla:           inv.talla,
          color:           inv.color,
        });
      } else {
        mostrarAlerta('Error', 'No se encontró el inventario.', () => router.back());
      }
    } catch {
      mostrarAlerta('Error de conexión', 'No se pudo cargar el inventario.', () => router.back());
    } finally {
      setCargandoDatos(false);
    }
  };

  const handleNumero = (setter: (v: string) => void, campo: keyof Errores) =>
    (val: string) => {
      const limpio = val.replace(/[^0-9]/g, '');
      setter(limpio);
      setErrores(prev => ({ ...prev, [campo]: undefined }));
    };

  const guardarCambios = async () => {
    const errs = validarCampos(stockDisponible, stockMinimo);
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      mostrarAlerta('Error de validación', 'Por favor, revisa los campos marcados.');
      return;
    }

    setCargando(true);
    try {
      const body = {
        stock_disponible: parseInt(stockDisponible),
        stock_minimo:     parseInt(stockMinimo),
        id_producto:      producto?.id_producto,
      };

      const res  = await fetch(`${API_BASE}/inventario.php?id=${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const json = await res.json();

      if (json.success) {
        mostrarAlerta('Éxito', 'Inventario actualizado correctamente.', () => router.back());
      } else {
        mostrarAlerta('Error', json.mensaje ?? 'No se pudo actualizar el inventario.');
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
        <ImageBackground source={require('../../assets/images/fondoLogin.jpeg')} style={s.bg} resizeMode="cover">
          <SafeAreaView style={s.safe}>
            <View style={s.centrado}>
              <ActivityIndicator size="large" color={ACCENT} />
              <Text style={s.cargandoText}>Cargando inventario...</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <ImageBackground source={require('../../assets/images/fondoLogin.jpeg')} style={s.bg} resizeMode="cover">
        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={s.card}>

              <TouchableOpacity onPress={() => router.back()} style={s.backIcon}>
                <Ionicons name="arrow-back" size={20} color={DARK} />
              </TouchableOpacity>

              <Text style={s.mainTitle}>Editar Inventario #{id}</Text>

              {/* ── Producto (solo lectura) ── */}
              <Text style={s.subTitle}>Datos del Producto</Text>
              <Text style={s.nota}>El producto no se puede cambiar al editar.</Text>

              <View style={s.productoCard}>
                <Text style={s.productoNombre}>{producto?.nombre_producto ?? '—'}</Text>
                <Text style={s.productoDetalle}>Talla: {producto?.talla ?? '—'}  |  Color: {producto?.color ?? '—'}</Text>
              </View>

              {/* ── Stock disponible ── */}
              <Text style={s.subTitle}>Cantidades</Text>

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
                onPress={guardarCambios}
                disabled={cargando}
              >
                {cargando
                  ? <ActivityIndicator size="small" color="#fff" />
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
  container:     { flex: 1 },
  bg:            { flex: 1, width: '100%', height: '100%' },
  safe:          { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },

  centrado:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  cargandoText: { color: '#fff', fontSize: 15, fontWeight: '600' },

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
  subTitle:  { fontSize: 18, fontWeight: 'bold', color: ACCENT, textAlign: 'center', marginTop: 20, marginBottom: 12 },

  inputGroup: { marginBottom: 20 },
  label:      { fontSize: 16, color: DARK, marginBottom: 5 },
  inputLine:  { borderBottomWidth: 1, borderBottomColor: BORDER, paddingVertical: 5, fontSize: 16, color: DARK },
  inputError: { borderBottomColor: ERROR },
  errorText:  { color: ERROR, fontSize: 12, marginTop: 4 },

  nota: { fontSize: 12, color: '#888', fontStyle: 'italic', marginBottom: 12, textAlign: 'center' },

  productoCard: {
    backgroundColor: '#fdf5fb',
    borderWidth:     1,
    borderColor:     '#e0c0d8',
    borderRadius:    8,
    padding:         12,
    marginBottom:    10,
    alignItems:      'center',
  },
  productoNombre:  { fontSize: 16, fontWeight: 'bold', color: DARK, textAlign: 'center' },
  productoDetalle: { fontSize: 13, color: '#777', marginTop: 4 },

  btnRosa:         { backgroundColor: ACCENT, paddingVertical: 12, borderRadius: 5, alignItems: 'center' },
  btnRosaText:     { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnRegresar:     { marginTop: 15, alignItems: 'center' },
  btnRegresarText: { color: DARK, fontSize: 14, textDecorationLine: 'underline' },
});