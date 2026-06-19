import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Platform, ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const ACCENT = '#e91e8c';
const DARK   = '#3A3A3A';
const API_BASE = 'http://192.168.1.7/FashFind/api';

const CARGOS = ['Administrador', 'Vendedor', 'Domiciliario', 'Cliente'];
const ESTADOS = ['Activo', 'Inactivo'];

export default function EditarUsuario() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);

  const [form, setForm] = useState({
    cc: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    genero: 'Femenino',
    direccion: '',
    fecha_nacimiento: '',
    cargo: 'Cliente',
    estado: 'Activo',
    contrasena: ''
  });

  useEffect(() => {
    if (id) cargarUsuario();
  }, [id]);

  const cargarUsuario = async () => {
    try {
      const res = await fetch(`${API_BASE}/usuarios.php?id=${id}`);
      const json = await res.json();
      if (json.success) {
        setForm({ ...json.data, contrasena: '' });
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar el usuario');
    } finally {
      setCargandoDatos(false);
    }
  };

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const guardar = async () => {
    // Validaciones antes de enviar
    if (!form.nombres.trim() || !form.apellidos.trim()) {
      Alert.alert('Campo requerido', 'Los nombres y apellidos son obligatorios');
      return;
    }

    if (form.correo && !validarEmail(form.correo)) {
      Alert.alert('Correo inválido', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    if (form.telefono && form.telefono.length < 7) {
      Alert.alert('Teléfono inválido', 'El teléfono debe tener al menos 7 dígitos');
      return;
    }

    try {
      setCargando(true);
      const res = await fetch(`${API_BASE}/usuarios.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        if (Platform.OS === 'web') {
          window.alert('Éxito: Usuario actualizado');
          router.back();
        } else {
          Alert.alert('Éxito', 'Usuario actualizado', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        }
      } else {
        Alert.alert('Error', json.mensaje);
      }
    } catch (e) {
      Alert.alert('Error', 'Error de conexión');
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

  if (cargandoDatos) return <ActivityIndicator size="large" color={ACCENT} style={{marginTop: 50}} />;

  return (
    <View style={s.container}>
      <ImageBackground source={require('../../assets/images/fondoLogin.jpeg')} style={s.bg}>
        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={s.scrollContent}>
            <View style={s.card}>
              <TouchableOpacity onPress={() => router.back()} style={s.back}>
                <Ionicons name="arrow-back" size={24} color={DARK} />
              </TouchableOpacity>
              <Text style={s.title}>Editar Usuario</Text>

              <Text style={s.label}>Cédula (No editable)</Text>
              <TextInput style={[s.input, {color: '#888'}]} value={form.cc} editable={false} />

              <Text style={s.label}>Nombres</Text>
              <TextInput 
                style={s.input} 
                value={form.nombres} 
                onChangeText={v => manejarCambioTexto('nombres', v)}
                placeholder="Solo letras"
              />

              <Text style={s.label}>Apellidos</Text>
              <TextInput 
                style={s.input} 
                value={form.apellidos} 
                onChangeText={v => manejarCambioTexto('apellidos', v)}
                placeholder="Solo letras"
              />

              <Text style={s.label}>Correo Electrónico</Text>
              <TextInput 
                style={s.input} 
                value={form.correo} 
                onChangeText={v => setForm({...form, correo: v})}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="ejemplo@correo.com"
              />

              <Text style={s.label}>Teléfono</Text>
              <TextInput 
                style={s.input} 
                value={form.telefono} 
                onChangeText={v => manejarCambioNumerico('telefono', v)}
                keyboardType="numeric"
                maxLength={10}
                placeholder="Solo números"
              />

              <Text style={s.label}>Dirección</Text>
              <TextInput 
                style={s.input} 
                value={form.direccion} 
                onChangeText={v => setForm({...form, direccion: v})}
              />

              <Text style={s.label}>Nueva Contraseña (Opcional)</Text>
              <TextInput 
                style={s.input} 
                secureTextEntry 
                placeholder="Dejar en blanco para no cambiar" 
                value={form.contrasena} 
                onChangeText={v => setForm({...form, contrasena: v})} 
              />

              <Text style={s.label}>Cargo</Text>
              <View style={s.row}>
                {CARGOS.map(c => (
                  <TouchableOpacity key={c} style={[s.chip, form.cargo === c && s.chipActive]} onPress={() => setForm({...form, cargo: c})}>
                    <Text style={[s.chipText, form.cargo === c && s.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>Estado</Text>
              <View style={s.row}>
                {ESTADOS.map(e => (
                  <TouchableOpacity key={e} style={[s.chip, form.estado === e && s.chipActive]} onPress={() => setForm({...form, estado: e})}>
                    <Text style={[s.chipText, form.estado === e && s.chipTextActive]}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>Fecha Nacimiento</Text>
              {Platform.OS === 'web' ? (
                <input type="date" style={s.webDate} value={form.fecha_nacimiento} onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} />
              ) : (
                <TouchableOpacity style={s.input} onPress={() => setMostrarDatePicker(true)}>
                  <Text>{form.fecha_nacimiento || 'Seleccionar...'}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={s.btn} onPress={guardar} disabled={cargando}>
                {cargando ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Guardar Cambios</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {mostrarDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={form.fecha_nacimiento ? new Date(form.fecha_nacimiento + 'T12:00:00') : new Date()}
          mode="date"
          onChange={(e, d) => {
            setMostrarDatePicker(false);
            if (d) setForm({...form, fecha_nacimiento: d.toISOString().split('T')[0]});
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
  back: { marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: ACCENT, textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 14, color: DARK, marginTop: 15, marginBottom: 5, fontWeight: '600' },
  input: { borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 8, fontSize: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  chip: { borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText: { fontSize: 12, color: DARK },
  chipTextActive: { color: '#fff' },
  webDate: { width: '100%', padding: 8, marginTop: 5, border: 'none', borderBottom: '1px solid #ccc', fontSize: 16, outline: 'none', backgroundColor: 'transparent' },
  btn: { backgroundColor: ACCENT, marginTop: 30, padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
