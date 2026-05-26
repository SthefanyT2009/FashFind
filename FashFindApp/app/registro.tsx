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
} from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

  const evaluarFortaleza = (password: string) => {
    let puntaje = 0;

    if (password.length >= 6) puntaje++;
    if (/[A-Z]/.test(password)) puntaje++;
    if (/[0-9]/.test(password)) puntaje++;
    if (/[^A-Za-z0-9]/.test(password)) puntaje++;

    setFortalezaPass(puntaje);
  };

  const validar = () => {
    const nuevosErrores: Errores = {};

    if (!/^\d{7,11}$/.test(campos.cc))
      nuevosErrores.cc = 'Cédula inválida';

    if (campos.nombres.trim().length < 2)
      nuevosErrores.nombres = 'Mínimo 2 caracteres';

    if (campos.apellidos.trim().length < 2)
      nuevosErrores.apellidos = 'Mínimo 2 caracteres';

    if (campos.nombre_usuario.trim().length < 3)
      nuevosErrores.nombre_usuario = 'Mínimo 3 caracteres';

    if (campos.contrasena.length < 6)
      nuevosErrores.contrasena = 'Mínimo 6 caracteres';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.correo))
      nuevosErrores.correo = 'Correo inválido';

    if (!/^\d{7,10}$/.test(campos.telefono))
      nuevosErrores.telefono = 'Teléfono inválido';

    if (!campos.genero)
      nuevosErrores.genero = 'Selecciona un género';

    if (campos.direccion.trim().length < 5)
      nuevosErrores.direccion = 'Mínimo 5 caracteres';

    if (!campos.fecha_nacimiento)
      nuevosErrores.fecha_nacimiento = 'Selecciona una fecha';

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
        Alert.alert(
          'Éxito',
          'Cuenta creada correctamente'
        );

        router.replace('/login');
      } else {
        Alert.alert(
          'Error',
          resultado.mensaje ||
            'No se pudo registrar'
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Ocurrió un problema'
      );
    }

    setCargando(false);
  };


  return (
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
                value={campos.cc}
                onChangeText={(text) =>
                  setCampos({
                    ...campos,
                    cc: text,
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
                    value={campos.nombres}
                    onChangeText={(text) =>
                      setCampos({
                        ...campos,
                        nombres: text,
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
                    value={campos.apellidos}
                    onChangeText={(text) =>
                      setCampos({
                        ...campos,
                        apellidos: text,
                      })
                    }
                  />
                </View>
              </View>
            </View>

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
                value={campos.nombre_usuario}
                onChangeText={(text) =>
                  setCampos({
                    ...campos,
                    nombre_usuario: text,
                  })
                }
              />
            </View>

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
                value={campos.correo}
                onChangeText={(text) =>
                  setCampos({
                    ...campos,
                    correo: text,
                  })
                }
              />
            </View>

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
                value={campos.telefono}
                onChangeText={(text) =>
                  setCampos({
                    ...campos,
                    telefono: text,
                  })
                }
              />
            </View>

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
                value={campos.direccion}
                onChangeText={(text) =>
                  setCampos({
                    ...campos,
                    direccion: text,
                  })
                }
              />
            </View>

            {/* Fecha */}
<Text style={styles.label}>
  Fecha nacimiento *
</Text>

<View style={styles.inputContainer}>
  <Ionicons
    name="calendar"
    size={20}
    color="#ccc"
  />

  <TextInput
    style={styles.input}
    placeholder="2005-08-15"
    placeholderTextColor="#ccc"
    value={campos.fecha_nacimiento}
    onChangeText={(text) =>
      setCampos({
        ...campos,
        fecha_nacimiento: text,
      })
    }
  />
</View>
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
});