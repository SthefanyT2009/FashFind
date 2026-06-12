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

const API_BASE = Platform.OS === 'web'
  ? 'http://localhost/FashFind/api'
  : 'http://172.30.3.163/FashFind/api';

const mostrarAlerta = (titulo: string, mensaje: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    onOk?.();
  } else {
    Alert.alert(titulo, mensaje, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
};

const CARGOS  = ['Administrador', 'Vendedor', 'Domiciliario', 'Cliente'];
const GENEROS = ['Masculino', 'Femenino', 'Otro'];

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

  const registrar = async () => {
    // Validaciones básicas antes de llamar al servidor
    if (!form.cc.trim()) {
      mostrarAlerta('Error', 'La cédula es obligatoria.');
      return;
    }
    if (!form.nombres.trim()) {
      mostrarAlerta('Error', 'Los nombres son obligatorios.');
      return;
    }
    if (!form.apellidos.trim()) {
      mostrarAlerta('Error', 'Los apellidos son obligatorios.');
      return;
    }
    if (!form.nombre_usuario.trim()) {
      mostrarAlerta('Error', 'El nombre de usuario es obligatorio.');
      return;
    }
    if (!form.contrasena.trim()) {
      mostrarAlerta('Error', 'La contraseña es obligatoria.');
      return;
    }
    if (form.contrasena.length < 6) {
      mostrarAlerta('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!form.correo.trim()) {
      mostrarAlerta('Error', 'El correo es obligatorio.');
      return;
    }
    if (!form.telefono.trim()) {
      mostrarAlerta('Error', 'El teléfono es obligatorio.');
      return;
    }
    if (!form.direccion.trim()) {
      mostrarAlerta('Error', 'La dirección es obligatoria.');
      return;
    }
    if (!form.fecha_nacimiento) {
      mostrarAlerta('Error', 'La fecha de nacimiento es obligatoria.');
      return;
    }

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
        // Muestra el mensaje exacto que devuelve el backend (duplicados, límites, etc.)
        mostrarAlerta('Error', json.mensaje ?? 'No se pudo registrar el usuario.');
      }
    } catch (e) {
      mostrarAlerta('Error de conexión', 'No se pudo conectar con el servidor. Verifica tu red.');
    } finally {
      setCargando(false);
    }
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
                  placeholder="Ej: 1001234567"
                  placeholderTextColor="#bbb"
                  value={form.cc}
                  onChangeText={v => setForm({ ...form, cc: v })}
                  maxLength={15}
                />
              </View>

              {/* Nombres */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Nombres *</Text>
                <TextInput
                  style={s.inputLine}
                  placeholder="Ej: Juan Carlos"
                  placeholderTextColor="#bbb"
                  value={form.nombres}
                  onChangeText={v => setForm({ ...form, nombres: v })}
                  maxLength={100}
                />
              </View>

              {/* Apellidos */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Apellidos *</Text>
                <TextInput
                  style={s.inputLine}
                  placeholder="Ej: Pérez Gómez"
                  placeholderTextColor="#bbb"
                  value={form.apellidos}
                  onChangeText={v => setForm({ ...form, apellidos: v })}
                  maxLength={100}
                />
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
                  onChangeText={v => setForm({ ...form, nombre_usuario: v })}
                  maxLength={100}
                />
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
                  onChangeText={v => setForm({ ...form, contrasena: v })}
                />
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
                  onChangeText={v => setForm({ ...form, correo: v })}
                  maxLength={100}
                />
              </View>

              {/* Teléfono */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Teléfono *</Text>
                <TextInput
                  style={s.inputLine}
                  placeholder="Ej: 3001234567"
                  placeholderTextColor="#bbb"
                  keyboardType="numeric"
                  value={form.telefono}
                  onChangeText={v => setForm({ ...form, telefono: v })}
                  maxLength={15}
                />
              </View>

              {/* Dirección */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Dirección *</Text>
                <TextInput
                  style={s.inputLine}
                  placeholder="Ej: Calle 10 #20-30"
                  placeholderTextColor="#bbb"
                  value={form.direccion}
                  onChangeText={v => setForm({ ...form, direccion: v })}
                  maxLength={100}
                />
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
                    value={form.fecha_nacimiento}
                    onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })}
                  />
                ) : (
                  <TouchableOpacity style={s.inputLine} onPress={() => setMostrarDatePicker(true)}>
                    <Text style={{ color: form.fecha_nacimiento ? DARK : '#bbb', fontSize: 16 }}>
                      {form.fecha_nacimiento || 'Seleccionar fecha...'}
                    </Text>
                  </TouchableOpacity>
                )}
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
  inputLine: {
    borderBottomWidth: 1, borderBottomColor: BORDER,
    paddingVertical: 5, fontSize: 16, color: DARK,
    minHeight: 35, justifyContent: 'center',
  },
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