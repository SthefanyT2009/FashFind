import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Modal,
} from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { registro } from './authService';

interface Errores {
  [key: string]: string;
}

interface Campos {
  cc: string;
  nombres: string;
  apellidos: string;
  nombre_usuario: string;
  contrasena: string;
  correo: string;
  telefono: string;
  genero: string;
  direccion: string;
  fecha_nacimiento: string;
  fecha_registro: string;
  acepta_terminos: boolean;
}

export default function RegistroScreen() {
  const router = useRouter();

  const [campos, setCampos] = useState<Campos>({
    cc: '',
    nombres: '',
    apellidos: '',
    nombre_usuario: '',
    contrasena: '',
    correo: '',
    telefono: '',
    genero: '',
    direccion: '',
    fecha_nacimiento: '',
    fecha_registro: new Date().toISOString().split('T')[0],
    acepta_terminos: false,
  });

  const [errores, setErrores] = useState<Errores>({});
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [fortalezaPass, setFortalezaPass] = useState(0);
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(undefined);
  const [alerta, setAlerta] = useState<{ tipo: 'exito' | 'error'; texto: string; onClose?: () => void } | null>(null);

  const mostrarAlerta = (tipo: 'exito' | 'error', texto: string, onClose?: () => void) => {
    setAlerta({ tipo, texto, onClose });
  };

  const evaluarFortaleza = (password: string) => {
    let puntaje = 0;

    if (password.length >= 8) puntaje++;
    if (/[A-Z]/.test(password)) puntaje++;
    if (/[0-9]/.test(password)) puntaje++;
    if (/[^A-Za-z0-9]/.test(password)) puntaje++;

    setFortalezaPass(puntaje);
  };

  const validar = () => {
    const nuevosErrores: Errores = {};

    if (!/^\d{7,11}$/.test(campos.cc))
      nuevosErrores.cc = 'Cédula inválida (7 a 11 dígitos)';

    if (!/^[A-Za-záéíóúÁÉÍÓÚñÑüÜ ]+$/.test(campos.nombres.trim()))
      nuevosErrores.nombres = 'Solo se permiten letras';
    else if (campos.nombres.trim().length < 3)
      nuevosErrores.nombres = 'Mínimo 3 caracteres';
    else if (campos.nombres.trim().length > 50)
      nuevosErrores.nombres = 'Máximo 50 caracteres';

    if (!/^[A-Za-záéíóúÁÉÍÓÚñÑüÜ ]+$/.test(campos.apellidos.trim()))
      nuevosErrores.apellidos = 'Solo se permiten letras';
    else if (campos.apellidos.trim().length < 3)
      nuevosErrores.apellidos = 'Mínimo 3 caracteres';
    else if (campos.apellidos.trim().length > 50)
      nuevosErrores.apellidos = 'Máximo 50 caracteres';

    if (!/^[A-Za-z0-9_]+$/.test(campos.nombre_usuario))
      nuevosErrores.nombre_usuario = 'Solo letras, números y guion bajo';
    else if (campos.nombre_usuario.trim().length < 6)
      nuevosErrores.nombre_usuario = 'Mínimo 6 caracteres';
    else if (campos.nombre_usuario.trim().length > 20)
      nuevosErrores.nombre_usuario = 'Máximo 20 caracteres';

    if (campos.contrasena.length < 8)
      nuevosErrores.contrasena = 'Mínimo 8 caracteres';
    else if (campos.contrasena.length > 64)
      nuevosErrores.contrasena = 'Máximo 64 caracteres';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.correo))
      nuevosErrores.correo = 'Correo inválido (debe tener @ y dominio)';
    else if (campos.correo.length < 6)
      nuevosErrores.correo = 'Correo demasiado corto';
    else if (campos.correo.length > 100)
      nuevosErrores.correo = 'Máximo 100 caracteres';

    if (!/^\d{7}$/.test(campos.telefono) && !/^3\d{9}$/.test(campos.telefono))
      nuevosErrores.telefono = 'Ingresa un número válido de Colombia (7 dígitos fijo o 10 celular iniciando en 3)';

    if (!campos.genero)
      nuevosErrores.genero = 'Selecciona un género';

    if (campos.direccion.trim().length < 10)
      nuevosErrores.direccion = 'Mínimo 10 caracteres';
    else if (campos.direccion.trim().length > 100)
      nuevosErrores.direccion = 'Máximo 100 caracteres';

    if (!campos.fecha_nacimiento)
      nuevosErrores.fecha_nacimiento = 'Selecciona una fecha de nacimiento';

    if (!campos.acepta_terminos)
      nuevosErrores.acepta_terminos =
        'Debes aceptar los términos';

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleRegistro = async () => {
    if (!validar()) return;

    setCargando(true);

    try {
      const resultado = await registro(campos);

      if (resultado.success) {
        mostrarAlerta('exito', 'Cuenta creada correctamente', () => router.replace('/login'));
      } else {
        mostrarAlerta('error', resultado.mensaje || 'No se pudo registrar');
      }
    } catch (error) {
      mostrarAlerta('error', 'Ocurrió un problema');
    }

    setCargando(false);
  };


  return (
    <>
    <ImageBackground
  source={require('../assets/images/fondoLogin.jpeg')}
  style={styles.background}
  imageStyle={styles.imagen}
  resizeMode="cover"
>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={styles.overlay}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.caja}>
            <Text style={styles.titulo}>
              Crear Cuenta
            </Text>

            {/* CC */}

            <Text style={styles.label}>
              Cédula *
            </Text>

            <View
              style={[
                styles.inputContainer,
                errores.cc && styles.errorInput,
              ]}
            >
              <Ionicons
                name="id-card"
                size={20}
                color="#ccc"
              />

              <TextInput
                style={styles.input}
                placeholder="1012345678"
                placeholderTextColor="#ccc"
                keyboardType="numeric"
                maxLength={11}
                value={campos.cc}
                onChangeText={(text) =>
                  setCampos({
                    ...campos,
                    cc: text.replace(/[^0-9]/g, ''),
                  })
                }
              />
            </View>

            {errores.cc && (
              <Text style={styles.errorText}>
                {errores.cc}
              </Text>
            )}

            {/* Nombres */}

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>
                  Nombres *
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    errores.nombres &&
                      styles.errorInput,
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={20}
                    color="#ccc"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Carlos"
                    placeholderTextColor="#ccc"
                    maxLength={50}
                    value={campos.nombres}
                    onChangeText={(text) =>
                      setCampos({
                        ...campos,
                        nombres: text.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑüÜ ]/g, ''),
                      })
                    }
                  />
                </View>
              </View>

              <View style={{ width: 10 }} />

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>
                  Apellidos *
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    errores.apellidos &&
                      styles.errorInput,
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={20}
                    color="#ccc"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Sánchez"
                    placeholderTextColor="#ccc"
                    maxLength={50}
                    value={campos.apellidos}
                    onChangeText={(text) =>
                      setCampos({
                        ...campos,
                        apellidos: text.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑüÜ ]/g, ''),
                      })
                    }
                  />
                </View>
              </View>
            </View>

            {(errores.nombres || errores.apellidos) && (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  {errores.nombres && (
                    <Text style={styles.errorText}>{errores.nombres}</Text>
                  )}
                </View>
                <View style={{ width: 10 }} />
                <View style={{ flex: 1 }}>
                  {errores.apellidos && (
                    <Text style={styles.errorText}>{errores.apellidos}</Text>
                  )}
                </View>
              </View>
            )}

            {/* Usuario */}

            <Text style={styles.label}>
              Usuario *
            </Text>

            <View
              style={[
                styles.inputContainer,
                errores.nombre_usuario &&
                  styles.errorInput,
              ]}
            >
              <Ionicons
                name="person-circle"
                size={20}
                color="#ccc"
              />

              <TextInput
                style={styles.input}
                placeholder="usuario123"
                placeholderTextColor="#ccc"
                maxLength={20}
                autoCapitalize="none"
                value={campos.nombre_usuario}
                onChangeText={(text) =>
                  setCampos({
                    ...campos,
                    nombre_usuario: text.replace(/[^A-Za-z0-9_]/g, ''),
                  })
                }
              />
            </View>

            {errores.nombre_usuario && (
              <Text style={styles.errorText}>{errores.nombre_usuario}</Text>
            )}

            {/* Contraseña */}

            <Text style={styles.label}>
              Contraseña *
            </Text>

            <View
              style={[
                styles.inputContainer,
                errores.contrasena &&
                  styles.errorInput,
              ]}
            >
              <Ionicons
                name="lock-closed"
                size={20}
                color="#ccc"
              />

              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#ccc"
                secureTextEntry={!mostrarContrasena}
                maxLength={64}
                value={campos.contrasena}
                onChangeText={(text) => {
                  setCampos({
                    ...campos,
                    contrasena: text,
                  });

                  evaluarFortaleza(text);
                }}
              />

              <TouchableOpacity
                onPress={() =>
                  setMostrarContrasena(
                    !mostrarContrasena
                  )
                }
              >
                <Ionicons
                  name={
                    mostrarContrasena
                      ? 'eye-off'
                      : 'eye'
                  }
                  size={20}
                  color="#ccc"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.barra}>
              <View
                style={[
                  styles.barraInterna,
                  {
                    width: `${
                      (fortalezaPass / 4) * 100
                    }%`,
                  },
                ]}
              />
            </View>

            {errores.contrasena && (
              <Text style={styles.errorText}>{errores.contrasena}</Text>
            )}

            {/* Correo */}

            <Text style={styles.label}>
              Correo *
            </Text>

            <View
              style={[
                styles.inputContainer,
                errores.correo &&
                  styles.errorInput,
              ]}
            >
              <Ionicons
                name="mail"
                size={20}
                color="#ccc"
              />

              <TextInput
                style={styles.input}
                placeholder="correo@gmail.com"
                placeholderTextColor="#ccc"
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={100}
                value={campos.correo}
                onChangeText={(text) =>
                  setCampos({
                    ...campos,
                    correo: text.trim(),
                  })
                }
              />
            </View>

            {errores.correo && (
              <Text style={styles.errorText}>{errores.correo}</Text>
            )}

            {/* Teléfono */}

            <Text style={styles.label}>
              Teléfono *
            </Text>

            <View
              style={[
                styles.inputContainer,
                errores.telefono &&
                  styles.errorInput,
              ]}
            >
              <Ionicons
                name="call"
                size={20}
                color="#ccc"
              />

              <TextInput
                style={styles.input}
                placeholder="3001234567"
                placeholderTextColor="#ccc"
                keyboardType="numeric"
                maxLength={10}
                value={campos.telefono}
                onChangeText={(text) =>
                  setCampos({
                    ...campos,
                    telefono: text.replace(/[^0-9]/g, ''),
                  })
                }
              />
            </View>

            {errores.telefono && (
              <Text style={styles.errorText}>{errores.telefono}</Text>
            )}

            {/* Género */}

            <Text style={styles.label}>
              Género *
            </Text>

            <View style={styles.generos}>
              {['Masculino', 'Femenino'].map(
                (genero) => (
                  <TouchableOpacity
                    key={genero}
                    style={[
                      styles.generoBtn,
                      campos.genero === genero &&
                        styles.generoActivo,
                    ]}
                    onPress={() =>
                      setCampos({
                        ...campos,
                        genero,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.generoTexto,
                        campos.genero === genero &&
                          styles.generoTextoActivo,
                      ]}
                    >
                      {genero}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Dirección */}

            <Text style={styles.label}>
              Dirección *
            </Text>

            <View
              style={[
                styles.inputContainer,
                errores.direccion &&
                  styles.errorInput,
              ]}
            >
              <Ionicons
                name="location"
                size={20}
                color="#ccc"
              />

              <TextInput
                style={styles.input}
                placeholder="Tu dirección"
                placeholderTextColor="#ccc"
                maxLength={100}
                value={campos.direccion}
                onChangeText={(text) =>
                  setCampos({
                    ...campos,
                    direccion: text,
                  })
                }
              />
            </View>

            {errores.direccion && (
              <Text style={styles.errorText}>{errores.direccion}</Text>
            )}

            {/* Fecha */}
<Text style={styles.label}>
  Fecha nacimiento *
</Text>

{/* WEB: input date nativo del navegador */}
{Platform.OS === 'web' ? (
  <View
    style={[
      styles.inputContainer,
      errores.fecha_nacimiento && styles.errorInput,
    ]}
  >
    <Ionicons name="calendar" size={20} color="#ccc" />
    <input
      type="date"
      max={new Date().toISOString().split('T')[0]}
      value={campos.fecha_nacimiento}
      onChange={(e) =>
        setCampos({ ...campos, fecha_nacimiento: e.target.value })
      }
      style={{
        flex: 1,
        border: 'none',
        outline: 'none',
        fontSize: 15,
        color: campos.fecha_nacimiento ? '#1a1a2e' : '#aaa',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    />
  </View>
) : (
  /* NATIVO: botón que abre el DateTimePicker */
  <TouchableOpacity
    style={[
      styles.inputContainer,
      errores.fecha_nacimiento && styles.errorInput,
    ]}
    onPress={() => setMostrarDatePicker(true)}
    activeOpacity={0.7}
  >
    <Ionicons name="calendar" size={20} color="#ccc" />
    <Text
      style={[
        styles.input,
        { lineHeight: 55, color: campos.fecha_nacimiento ? '#1a1a2e' : '#ccc' },
      ]}
    >
      {campos.fecha_nacimiento || 'Seleccionar fecha'}
    </Text>
    <Ionicons name="chevron-down" size={18} color="#ccc" />
  </TouchableOpacity>
)}

{errores.fecha_nacimiento && (
  <Text style={styles.errorText}>
    {errores.fecha_nacimiento}
  </Text>
)}

{/* DatePicker Android (inline) */}
{mostrarDatePicker && Platform.OS === 'android' && (
  <DateTimePicker
    value={fechaSeleccionada ?? new Date(2000, 0, 1)}
    mode="date"
    display="default"
    maximumDate={new Date()}
    onChange={(event: DateTimePickerEvent, date?: Date) => {
      setMostrarDatePicker(false);
      if (event.type === 'set' && date) {
        setFechaSeleccionada(date);
        setCampos({
          ...campos,
          fecha_nacimiento: date.toISOString().split('T')[0],
        });
      }
    }}
  />
)}

{/* DatePicker iOS (modal) */}
{Platform.OS === 'ios' && (
  <Modal
    visible={mostrarDatePicker}
    transparent
    animationType="slide"
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContenido}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setMostrarDatePicker(false)}>
            <Text style={styles.modalCancelar}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitulo}>Fecha de nacimiento</Text>
          <TouchableOpacity
            onPress={() => {
              const fecha = fechaSeleccionada ?? new Date(2000, 0, 1);
              setCampos({
                ...campos,
                fecha_nacimiento: fecha.toISOString().split('T')[0],
              });
              setMostrarDatePicker(false);
            }}
          >
            <Text style={styles.modalAceptar}>Aceptar</Text>
          </TouchableOpacity>
        </View>
        <DateTimePicker
          value={fechaSeleccionada ?? new Date(2000, 0, 1)}
          mode="date"
          display="spinner"
          maximumDate={new Date()}
          locale="es-CO"
          onChange={(event: DateTimePickerEvent, date?: Date) => {
            if (date) setFechaSeleccionada(date);
          }}
        />
      </View>
    </View>
  </Modal>
)}
            {/* Términos */}

            <TouchableOpacity
              style={styles.terminos}
              onPress={() =>
                setCampos({
                  ...campos,
                  acepta_terminos:
                    !campos.acepta_terminos,
                })
              }
            >
              <View
                style={[
                  styles.check,
                  campos.acepta_terminos &&
                    styles.checkActivo,
                ]}
              >
                {campos.acepta_terminos && (
                  <Ionicons
                    name="checkmark"
                    size={15}
                    color="#fff"
                  />
                )}
              </View>

              <Text style={styles.terminosTexto}>
                Acepto términos y condiciones
              </Text>
            </TouchableOpacity>

            {/* Botón */}

            <TouchableOpacity
              style={styles.boton}
              onPress={handleRegistro}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="person-add"
                    size={20}
                    color="#fff"
                  />

                  <Text style={styles.botonTexto}>
                    REGISTRARSE
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Login */}

            <TouchableOpacity
              onPress={() =>
                router.replace('/login')
              }
            >
              <Text style={styles.loginTexto}>
                ← Volver al login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>

      {/* Modal alerta */}
      {alerta && (
        <Modal transparent animationType="fade" visible={!!alerta}>
          <View style={styles.alertaOverlay}>
            <View style={styles.alertaCaja}>
              <View style={[styles.alertaIconoWrap, alerta.tipo === 'exito' ? styles.alertaIconoExito : styles.alertaIconoError]}>
                <Ionicons
                  name={alerta.tipo === 'exito' ? 'checkmark-circle' : 'alert-circle'}
                  size={40}
                  color="#fff"
                />
              </View>
              <Text style={styles.alertaTitulo}>
                {alerta.tipo === 'exito' ? '¡Éxito!' : 'Error'}
              </Text>
              <Text style={styles.alertaTexto}>{alerta.texto}</Text>
              <TouchableOpacity
                style={[styles.alertaBoton, alerta.tipo === 'exito' ? styles.alertaBotonExito : styles.alertaBotonError]}
                onPress={() => {
                  const cb = alerta.onClose;
                  setAlerta(null);
                  cb?.();
                }}
              >
                <Text style={styles.alertaBotonTexto}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
  },

  scroll: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  caja: {
    width: '92%',
    maxWidth: 520,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 35,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },

  titulo: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a1a2e',
    marginBottom: 25,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 6,
    marginTop: 12,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 4,
    paddingHorizontal: 12,
    height: 55,
    gap: 10,
    backgroundColor: '#fff',
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a2e',
  },

  errorInput: {
    borderColor: '#ff4d4d',
  },

  errorText: {
    color: '#ff4d4d',
    marginTop: 4,
    fontSize: 12,
  },

  row: {
    flexDirection: 'row',
  },

  barra: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginTop: 10,
    overflow: 'hidden',
  },

  barraInterna: {
    height: '100%',
    backgroundColor: '#e91e8c',
  },

  generos: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },

  generoBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },

  generoActivo: {
    backgroundColor: '#e91e8c',
    borderColor: '#e91e8c',
  },

  generoTexto: {
    color: '#666',
    fontWeight: '600',
  },

  generoTextoActivo: {
    color: '#fff',
  },

  fechaTexto: {
    color: '#1a1a2e',
    fontSize: 15,
    marginLeft: 10,
  },

  terminos: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },

  check: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkActivo: {
    backgroundColor: '#e91e8c',
    borderColor: '#e91e8c',
  },

  terminosTexto: {
    marginLeft: 10,
    color: '#555',
  },

  boton: {
    backgroundColor: '#1a1a2e',
    height: 56,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 25,
  },

  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  imagen: {
  width: '100%',
  height: '100%',
},

  loginTexto: {
    textAlign: 'center',
    marginTop: 22,
    color: '#e91e8c',
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContenido: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  modalTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },

  modalCancelar: {
    fontSize: 15,
    color: '#888',
  },

  modalAceptar: {
    fontSize: 15,
    color: '#e91e8c',
    fontWeight: '700',
  },

  alertaOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  alertaCaja: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },

  alertaIconoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  alertaIconoExito: {
    backgroundColor: '#22c55e',
  },

  alertaIconoError: {
    backgroundColor: '#ef4444',
  },

  alertaTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 8,
  },

  alertaTexto: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },

  alertaBoton: {
    width: '100%',
    height: 48,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  alertaBotonExito: {
    backgroundColor: '#1a1a2e',
  },

  alertaBotonError: {
    backgroundColor: '#e91e8c',
  },

  alertaBotonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
});