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

const API_BASE = 'http://192.168.1.7/FashFind/api';

const mostrarAlerta = (titulo: string, mensaje: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    onOk?.();
  } else {
    Alert.alert(titulo, mensaje, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
};

// Reglas de validación
const SOLO_LETRAS  = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const SOLO_ALFANUM = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const SOLO_NUMEROS = /^\d+$/;

interface Errores {
  nombreProducto?:  string;
  descripcion?:     string;
  talla?:           string;
  color?:           string;
  precio?:          string;
}

function validarCampos(
  nombreProducto:  string,
  descripcion:     string,
  talla:           string,
  color:           string,
  precio:          string,
): Errores {
  const e: Errores = {};

  if (!nombreProducto.trim()) {
    e.nombreProducto = 'El nombre del producto es obligatorio.';
  } else if (!SOLO_LETRAS.test(nombreProducto.trim())) {
    e.nombreProducto = 'Solo se permiten letras y espacios.';
  } else if (nombreProducto.trim().length < 3) {
    e.nombreProducto = 'Mínimo 3 caracteres.';
  } else if (nombreProducto.trim().length > 100) {
    e.nombreProducto = 'Máximo 100 caracteres.';
  }

  if (descripcion.trim().length > 0) {
    if (descripcion.trim().length < 10) {
      e.descripcion = 'Si agregas descripción, mínimo 10 caracteres.';
    } else if (descripcion.trim().length > 200) {
      e.descripcion = 'Máximo 200 caracteres.';
    }
  }

  if (!talla.trim()) {
    e.talla = 'La talla es obligatoria.';
  } else if (!SOLO_ALFANUM.test(talla.trim())) {
    e.talla = 'Solo se permiten letras y números.';
  } else if (talla.trim().length < 1) {
    e.talla = 'Mínimo 1 carácter.';
  } else if (talla.trim().length > 15) {
    e.talla = 'Máximo 15 caracteres.';
  }

  if (!color.trim()) {
    e.color = 'El color es obligatorio.';
  } else if (!SOLO_LETRAS.test(color.trim())) {
    e.color = 'Solo se permiten letras y espacios.';
  } else if (color.trim().length < 3) {
    e.color = 'Mínimo 3 caracteres.';
  } else if (color.trim().length > 50) {
    e.color = 'Máximo 50 caracteres.';
  }

  if (!precio.trim()) {
    e.precio = 'El precio es obligatorio.';
  } else if (!SOLO_NUMEROS.test(precio.trim())) {
    e.precio = 'Solo se permiten números enteros.';
  } else if (parseInt(precio) < 1) {
    e.precio = 'El precio debe ser mayor a 0.';
  } else if (parseInt(precio) > 9999999) {
    e.precio = 'El precio no puede superar $9.999.999.';
  }

  return e;
}

export default function EditarProductos() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [nombreProducto,  setNombreProducto]  = useState('');
  const [descripcion,     setDescripcion]     = useState('');
  const [talla,           setTalla]           = useState('');
  const [color,           setColor]           = useState('');
  const [precio,          setPrecio]          = useState('');
  const [errores,         setErrores]         = useState<Errores>({});
  const [cargando,        setCargando]        = useState(false);
  const [cargandoDatos,   setCargandoDatos]   = useState(true);

  useEffect(() => {
    if (!id) return;
    cargarProducto();
  }, [id]);

  const cargarProducto = async () => {
    try {
      const res  = await fetch(`${API_BASE}/productos.php?id=${id}`);
      const json = await res.json();
      if (json.success) {
        const p = json.data;
        setNombreProducto(p.nombre_producto ?? '');
        setDescripcion(p.descripcion       ?? '');
        setTalla(p.talla                   ?? '');
        setColor(p.color                   ?? '');
        setPrecio(String(p.precio          ?? ''));
      } else {
        mostrarAlerta('Error', 'No se encontró el producto.', () => router.back());
      }
    } catch {
      mostrarAlerta('Error de conexión', 'No se pudo cargar el producto.', () => router.back());
    } finally {
      setCargandoDatos(false);
    }
  };

  // Filtra caracteres no permitidos en tiempo real
  const handleLetras = (setter: (v: string) => void, campo: keyof Errores) =>
    (val: string) => {
      const limpio = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
      setter(limpio);
      setErrores(prev => ({ ...prev, [campo]: undefined }));
    };

  const handleAlfanum = (setter: (v: string) => void, campo: keyof Errores) =>
    (val: string) => {
      const limpio = val.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
      setter(limpio);
      setErrores(prev => ({ ...prev, [campo]: undefined }));
    };

  const handleNumeros = (setter: (v: string) => void, campo: keyof Errores) =>
    (val: string) => {
      const limpio = val.replace(/[^0-9]/g, '');
      setter(limpio);
      setErrores(prev => ({ ...prev, [campo]: undefined }));
    };

  const handleTextoLibre = (setter: (v: string) => void, campo: keyof Errores) =>
    (val: string) => {
      setter(val);
      setErrores(prev => ({ ...prev, [campo]: undefined }));
    };

  const guardarCambios = async () => {
    const errs = validarCampos(
      nombreProducto, descripcion,
      talla, color, precio,
    );
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      mostrarAlerta('Error de validación', 'Por favor, revisa los campos marcados.');
      return;
    }

    setCargando(true);
    try {
      const params = new URLSearchParams();
      params.append('nombre_producto', nombreProducto.trim());
      params.append('descripcion', descripcion.trim());
      params.append('talla', talla.trim());
      params.append('color', color.trim());
      params.append('precio', precio.trim());

      const res = await fetch(`${API_BASE}/productos.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const json = await res.json();
      if (json.success) {
        mostrarAlerta('Éxito', 'Producto actualizado correctamente.', () => {
          router.back();
        });
      } else {
        mostrarAlerta('Error', json.mensaje || 'No se pudo actualizar el producto.');
      }
    } catch (err) {
      mostrarAlerta('Error de conexión', 'No se pudo conectar al servidor.');
    } finally {
      setCargando(false);
    }
  };

  if (cargandoDatos) {
    return (
      <View style={s.container}>
        <ImageBackground source={require('../../assets/images/fondoLogin.jpeg')} style={s.bg}>
          <View style={s.centrado}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={s.cargandoText}>Cargando producto...</Text>
          </View>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <ImageBackground source={require('../../assets/images/fondoLogin.jpeg')} style={s.bg}>
        <SafeAreaView style={s.safe}>
          <TouchableOpacity style={s.backIcon} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={s.card}>
              <Text style={s.mainTitle}>Editar Producto</Text>

              {/* Nombre del Producto */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Nombre del Producto *</Text>
                <TextInput
                  style={[s.inputLine, errores.nombreProducto && s.inputError]}
                  value={nombreProducto}
                  onChangeText={handleLetras(setNombreProducto, 'nombreProducto')}
                  placeholder=""
                  placeholderTextColor="#bbb"
                  maxLength={100}
                />
                {errores.nombreProducto && <Text style={s.errorText}>{errores.nombreProducto}</Text>}
              </View>

              {/* Descripción */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Descripción</Text>
                <TextInput
                  style={[s.inputLine, { minHeight: 60 }, errores.descripcion && s.inputError]}
                  value={descripcion}
                  onChangeText={handleTextoLibre(setDescripcion, 'descripcion')}
                  placeholder=""
                  placeholderTextColor="#bbb"
                  multiline
                  maxLength={200}
                />
                <Text style={s.counter}>{descripcion.length}/200</Text>
                {errores.descripcion && <Text style={s.errorText}>{errores.descripcion}</Text>}
              </View>

              {/* Talla */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Talla *</Text>
                <TextInput
                  style={[s.inputLine, errores.talla && s.inputError]}
                  value={talla}
                  onChangeText={handleAlfanum(setTalla, 'talla')}
                  placeholder=""
                  placeholderTextColor="#bbb"
                  maxLength={15}
                />
                {errores.talla && <Text style={s.errorText}>{errores.talla}</Text>}
              </View>

              {/* Color */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Color *</Text>
                <TextInput
                  style={[s.inputLine, errores.color && s.inputError]}
                  value={color}
                  onChangeText={handleLetras(setColor, 'color')}
                  placeholder=""
                  placeholderTextColor="#bbb"
                  maxLength={50}
                />
                {errores.color && <Text style={s.errorText}>{errores.color}</Text>}
              </View>

              {/* Precio */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Precio *</Text>
                <TextInput
                  style={[s.inputLine, errores.precio && s.inputError]}
                  value={precio}
                  onChangeText={handleNumeros(setPrecio, 'precio')}
                  keyboardType="numeric"
                  placeholder=""
                  placeholderTextColor="#bbb"
                  maxLength={7}
                />
                {errores.precio && <Text style={s.errorText}>{errores.precio}</Text>}
              </View>

              {/* ── Botones ── */}
              <TouchableOpacity
                style={[s.btnRosa, { marginTop: 20 }]}
                onPress={guardarCambios}
                disabled={cargando}
              >
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

  backIcon:  { position: 'absolute', top: 20, left: 20 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: ACCENT, textAlign: 'center', marginBottom: 25 },

  inputGroup: { marginBottom: 20 },
  label:      { fontSize: 16, color: DARK, marginBottom: 5 },
  inputLine:  { borderBottomWidth: 1, borderBottomColor: BORDER, paddingVertical: 5, fontSize: 16, color: DARK },
  inputError: { borderBottomColor: ERROR },
  errorText:  { color: ERROR, fontSize: 12, marginTop: 4 },
  counter:    { fontSize: 11, color: '#aaa', textAlign: 'right', marginTop: 2 },

  btnRosa:         { backgroundColor: ACCENT, paddingVertical: 12, borderRadius: 5, alignItems: 'center' },
  btnRosaText:     { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnRegresar:     { marginTop: 15, alignItems: 'center' },
  btnRegresarText: { color: DARK, fontSize: 14, textDecorationLine: 'underline' },
});