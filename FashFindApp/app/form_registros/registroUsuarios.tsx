import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Platform, ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const ACCENT = '#e91e8c';
const DARK   = '#3A3A3A';
const BORDER = '#000';
const ERROR_COLOR = '#DC2626';

const API_BASE = Platform.OS === 'web'
  ? 'http://localhost/FashFind/api'
  : 'http://192.168.137.102/FashFind/api';

const mostrarAlerta = (titulo: string, mensaje: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    onOk?.();
  } else {
    Alert.alert(titulo, mensaje, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
};

const CARGOS  = ['Administrador', 'Vendedor', 'Domiciliario', 'Cliente'];
const GENEROS = ['Masculino', 'Femenino'];

export default function RegistroUsuarios() {
  const router = useRouter();
  const [cargando, setCargando]               = useState(false);
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);

  const [form, setForm] = useState({
    cc:             '',
    nombres:        '',
    apellidos:      '',
    nombre_usuario: '',
    contrasena:     '',
    correo:         '',
    telefono:       '',
    genero:         'Femenino',
    direccion:      '',
    fecha_nacimiento: '',
    cargo:          'Cliente',
  });

  const [errores, setErrores] = useState({
    cc:             '',
    nombres:        '',
    apellidos:      '',
    nombre_usuario: '',
    contrasena:     '',
    correo:         '',
    telefono:       '',
    direccion:      '',
    fecha_nacimiento: '',
  });

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };



  const registrar = async () => {
    // Validar todos los campos y verificar antes de enviar
    let hayErrores = false;
    const nuevoErrores: typeof errores = { ...errores };

    if (!form.cc.trim()) {
      nuevoErrores.cc = 'La cédula es obligatoria.';
      hayErrores = true;
    } else {
      nuevoErrores.cc = '';
    }

    if (!form.nombres.trim()) {
      nuevoErrores.nombres = 'Los nombres son obligatorios.';
      hayErrores = true;
    } else {
      nuevoErrores.nombres = '';
    }

    if (!form.apellidos.trim()) {
      nuevoErrores.apellidos = 'Los apellidos son obligatorios.';
      hayErrores = true;
    } else {
      nuevoErrores.apellidos = '';
    }

    if (!form.nombre_usuario.trim()) {
      nuevoErrores.nombre_usuario = 'El nombre de usuario es obligatorio.';
      hayErrores = true;
    } else {
      nuevoErrores.nombre_usuario = '';
    }

    if (!form.contrasena.trim()) {
      nuevoErrores.contrasena = 'La contraseña es obligatoria.';
      hayErrores = true;
    } else if (form.contrasena.length < 6) {
      nuevoErrores.contrasena = 'La contraseña debe tener al menos 6 caracteres.';
      hayErrores = true;
    } else {
      nuevoErrores.contrasena = '';
    }

    if (!form.correo.trim()) {
      nuevoErrores.correo = 'El correo es obligatorio.';
      hayErrores = true;
    } else if (!validarEmail(form.correo)) {
      nuevoErrores.correo = 'El formato del correo electrónico no es válido.';
      hayErrores = true;
    } else {
      nuevoErrores.correo = '';
    }

    if (!form.telefono.trim()) {
      nuevoErrores.telefono = 'El teléfono es obligatorio.';
      hayErrores = true;
    } else if (form.telefono.length < 7) {
      nuevoErrores.telefono = 'El teléfono debe tener al menos 7 dígitos.';
      hayErrores = true;
    } else {
      nuevoErrores.telefono = '';
    }

    if (!form.direccion.trim()) {
      nuevoErrores.direccion = 'La dirección es obligatoria.';
      hayErrores = true;
    } else {
      nuevoErrores.direccion = '';
    }

    if (!form.fecha_nacimiento) {
      nuevoErrores.fecha_nacimiento = 'La fecha de nacimiento es obligatoria.';
      hayErrores = true;
    } else {
      nuevoErrores.fecha_nacimiento = '';
    }

    setErrores(nuevoErrores);

    // Si hay errores, detener aquí
    if (hayErrores) return;

    try {
      setCargando(true);
      const res = await fetch(`${API_BASE}/usuarios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          fecha_registro: new Date().toISOString().split('T')[0],
        }),
      });
      const json = await res.json();
      if (json.success) {
        mostrarAlerta('¡Éxito!', 'Usuario creado correctamente.', () => router.back());
      } else {
        mostrarAlerta('Error', json.mensaje ?? 'No se pudo registrar el usuario.');
      }
    } catch (e) {
      mostrarAlerta('Error de conexión', 'No se pudo conectar con el servidor. Verifica tu red.');
    } finally {
      setCargando(false);
    }
  };

  // Función para manejar cambios en campos numéricos
  const manejarCambioNumerico = (campo: string, valor: string) => {
    const soloNumeros = valor.replace(/[^0-9]/g, '');
    setForm({...form, [campo]: soloNumeros});
  };

  // Función para manejar cambios en nombres/apellidos (solo letras)
  const manejarCambioTexto = (campo: string, valor: string) => {
    const soloLetras = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setForm({...form, [campo]: soloLetras});
  };

  const manejarCambioGeneral = (campo: string, valor: string) => {
    setForm({...form, [campo]: valor});
  };

  return (
    <View style={s.container}>
      <ImageBackground source={require('../../assets/images/fondoLogin.jpeg')} style={s.bg}>
        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={s.scrollContent}>
            <View style={s.card}>

              {/* Botón volver */}
              <TouchableOpacity onPress={() => router.back()} style={s.backIcon}>
                <Ionicons name="arrow-back" size={24} color={DARK} />
              </TouchableOpacity>

              <Text style={s.mainTitle}>Nuevo Usuario</Text>

              {/* Cédula */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Cédula *</Text>
                <TextInput
                  style={s.inputLine}
                  keyboardType="numeric"
                  placeholder="Solo números"
                  placeholderTextColor="#bbb"
                  value={form.cc}
                  onChangeText={v => manejarCambioNumerico('cc', v)}
                  maxLength={15}
                />
                {errores.cc ? <Text style={s.errorText}>{errores.cc}</Text> : null}
              </View>

              {/* Nombres */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Nombres *</Text>
                <TextInput
                  style={s.inputLine}
                  placeholder="Solo letras"
                  placeholderTextColor="#bbb"
                  value={form.nombres}
                  onChangeText={v => manejarCambioTexto('nombres', v)}
                  maxLength={100}
                />
                {errores.nombres ? <Text style={s.errorText}>{errores.nombres}</Text> : null}
              </View>

              {/* Apellidos */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Apellidos *</Text>
                <TextInput
                  style={s.inputLine}
                  placeholder="Solo letras"
                  placeholderTextColor="#bbb"
                  value={form.apellidos}
                  onChangeText={v => manejarCambioTexto('apellidos', v)}
                  maxLength={100}
                />
                {errores.apellidos ? <Text style={s.errorText}>{errores.apellidos}</Text> : null}
              </View>

              {/* Usuario */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Nombre de usuario *</Text>
                <TextInput
                  style={s.inputLine}
                  placeholder="Ej: juanperez01"
                  placeholderTextColor="#bbb"
                  autoCapitalize="none"
                  value={form.nombre_usuario}
                  onChangeText={v => manejarCambioGeneral('nombre_usuario', v)}
                  maxLength={100}
                />
                {errores.nombre_usuario ? <Text style={s.errorText}>{errores.nombre_usuario}</Text> : null}
              </View>

              {/* Contraseña */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Contraseña * (mín. 6 caracteres)</Text>
                <TextInput
                  style={s.inputLine}
                  secureTextEntry
                  placeholder="••••••"
                  placeholderTextColor="#bbb"
                  value={form.contrasena}
                  onChangeText={v => manejarCambioGeneral('contrasena', v)}
                />
                {errores.contrasena ? <Text style={s.errorText}>{errores.contrasena}</Text> : null}
              </View>

              {/* Correo */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Correo *</Text>
                <TextInput
                  style={s.inputLine}
                  placeholder="Ej: usuario@email.com"
                  placeholderTextColor="#bbb"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.correo}
                  onChangeText={v => manejarCambioGeneral('correo', v)}
                  maxLength={100}
                />
                {errores.correo ? <Text style={s.errorText}>{errores.correo}</Text> : null}
              </View>

              {/* Teléfono */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Teléfono *</Text>
                <TextInput
                  style={s.inputLine}
                  placeholder="Solo números"
                  placeholderTextColor="#bbb"
                  keyboardType="numeric"
                  value={form.telefono}
                  onChangeText={v => manejarCambioNumerico('telefono', v)}
                  maxLength={15}
                />
                {errores.telefono ? <Text style={s.errorText}>{errores.telefono}</Text> : null}
              </View>

              {/* Dirección */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Dirección *</Text>
                <View style={s.labelContainer}>
                  <Text style={s.charCount}>{form.direccion.length}/100</Text>
                </View>
                <TextInput
                  style={s.inputLine}
                  placeholder="Ej: Calle 10 #20-30"
                  placeholderTextColor="#bbb"
                  value={form.direccion}
                  onChangeText={v => manejarCambioGeneral('direccion', v)}
                  maxLength={100}
                />
                {errores.direccion ? <Text style={s.errorText}>{errores.direccion}</Text> : null}
              </View>

              {/* Género */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Género</Text>
                <View style={s.pickerOverlay}>
                  {GENEROS.map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[s.chip, form.genero === g && s.chipActivo]}
                      onPress={() => setForm({ ...form, genero: g })}
                    >
                      <Text style={[s.chipText, form.genero === g && s.chipTextActivo]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Cargo */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Cargo *</Text>
                <View style={s.pickerOverlay}>
                  {CARGOS.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[s.chip, form.cargo === c && s.chipActivo]}
                      onPress={() => setForm({ ...form, cargo: c })}
                    >
                      <Text style={[s.chipText, form.cargo === c && s.chipTextActivo]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Fecha de nacimiento */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Fecha de nacimiento *</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    style={{
                      width: '100%', padding: '8px 0', marginTop: 5,
                      border: 'none', borderBottom: `1px solid ${BORDER}`,
                      fontSize: 16, outline: 'none', backgroundColor: 'transparent',
                      color: form.fecha_nacimiento ? DARK : '#bbb',
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    value={form.fecha_nacimiento}
                    onChange={e => manejarCambioGeneral('fecha_nacimiento', e.target.value)}
                  />
                ) : (
                  <TouchableOpacity style={s.inputLine} onPress={() => setMostrarDatePicker(true)}>
                    <Text style={{ color: form.fecha_nacimiento ? DARK : '#bbb', fontSize: 16 }}>
                      {form.fecha_nacimiento || 'Seleccionar fecha...'}
                    </Text>
                  </TouchableOpacity>
                )}
                {errores.fecha_nacimiento ? <Text style={s.errorText}>{errores.fecha_nacimiento}</Text> : null}
              </View>

              {/* Botón registrar */}
              <TouchableOpacity
                style={[s.btnRosa, { marginTop: 10, opacity: cargando ? 0.6 : 1 }]}
                onPress={registrar}
                disabled={cargando}
              >
                {cargando
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={s.btnRosaText}>Registrar Usuario</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={s.btnRegresar} onPress={() => router.back()}>
                <Text style={s.btnRegresarText}>Regresar</Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {/* DatePicker nativo (solo móvil) */}
      {mostrarDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={form.fecha_nacimiento ? new Date(form.fecha_nacimiento + 'T12:00:00') : new Date()}
          maximumDate={new Date()}
          mode="date"
          display="default"
          onChange={(e, d) => {
            setMostrarDatePicker(false);
            if (d) setForm({ ...form, fecha_nacimiento: d.toISOString().split('T')[0] });
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1 },
  bg:           { flex: 1, width: '100%', height: '100%' },
  safe:         { flex: 1 },
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
  backIcon:   { marginBottom: 10 },
  mainTitle:  { fontSize: 24, fontWeight: 'bold', color: ACCENT, textAlign: 'center', marginBottom: 25 },
  inputGroup: { marginBottom: 20 },
  label:      { fontSize: 16, color: DARK, marginBottom: 5 },
  labelContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  charCount:  { fontSize: 12, color: '#999' },
  inputLine: {
    borderBottomWidth: 1, borderBottomColor: BORDER,
    paddingVertical: 5, fontSize: 16, color: DARK,
    minHeight: 35, justifyContent: 'center',
  },
  errorText:  { color: ERROR_COLOR, fontSize: 12, marginTop: 3 },
  pickerOverlay: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
  chip:          { borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 5 },
  chipActivo:    { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText:      { fontSize: 12, color: DARK },
  chipTextActivo:{ color: '#fff' },
  btnRosa:       { backgroundColor: ACCENT, paddingVertical: 12, borderRadius: 5, alignItems: 'center' },
  btnRosaText:   { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnRegresar:   { marginTop: 15, alignItems: 'center' },
  btnRegresarText: { color: DARK, fontSize: 14, textDecorationLine: 'underline' },
});