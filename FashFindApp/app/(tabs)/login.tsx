import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { login } from '../authService';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorVisible, setErrorVisible] = useState(''); 

  const ingresar = async () => {
    setErrorVisible('');

    if (usuario.trim().length < 3) {
      setErrorVisible('Usuario inválido');
      return;
    }

    if (contrasena.length < 8) {
      setErrorVisible('La contraseña debe tener mínimo 8 caracteres');
      return;
    }

    try {
      setCargando(true);
      setErrorVisible('Conectando...');

      const respuesta = await login(usuario.trim(), contrasena);

      setErrorVisible('Respuesta: ' + JSON.stringify(respuesta));

      if (respuesta.success && respuesta.usuario) {
        const cargo = respuesta.usuario.cargo;
        setErrorVisible('Cargo: ' + cargo);

        setTimeout(() => {
          switch (cargo) {
            case 'Administrador':
              router.replace('/vistaAdministrador');
              break;
            case 'Vendedor':
              router.replace('/vistaVendedor');
              break;
            case 'Domiciliario':
              router.replace('/vistaDomiciliario');
              break;
            case 'Cliente':
              router.replace('/vistaCliente');
              break;
            default:
              setErrorVisible('Cargo no reconocido: ' + cargo);
          }
        }, 1000);

      } else {
        setErrorVisible((respuesta.mensaje || 'Credenciales incorrectas'));
      }
    } catch (error: any) {
      setErrorVisible('Error: ' + (error?.message || JSON.stringify(error)));
    } finally {
      setCargando(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/fondoLogin.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.caja}>
          <Text style={styles.titulo}>Iniciar Sesión</Text>

          {/* Usuario */}
          <Text style={styles.label}>Nombre de usuario *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="#ccc" />
            <TextInput
              placeholder="Tu nombre de usuario"
              placeholderTextColor="#ccc"
              style={styles.input}
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
              editable={!cargando}
            />
          </View>

          {/* Contraseña */}
          <Text style={styles.label}>Contraseña *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#ccc" />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#ccc"
              secureTextEntry={!mostrarPass}
              style={styles.input}
              value={contrasena}
              onChangeText={setContrasena}
              editable={!cargando}
            />
            <TouchableOpacity onPress={() => setMostrarPass(!mostrarPass)}>
              <Ionicons
                name={mostrarPass ? 'eye-off' : 'eye'}
                size={20}
                color="#ccc"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity>
            <Text style={styles.olvido}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón ingresar */}
          <TouchableOpacity
            style={[styles.boton, cargando && { opacity: 0.7 }]}
            onPress={ingresar}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in" size={20} color="#fff" />
                <Text style={styles.botonTexto}>INGRESAR</Text>
              </>
            )}
          </TouchableOpacity>

          {/* ← Mensaje de diagnóstico visible en pantalla */}
          {errorVisible !== '' && (
            <View style={styles.mensajeBox}>
              <Text style={styles.mensajeTexto}>{errorVisible}</Text>
            </View>
          )}

          {/* Registro */}
          <View style={styles.registroContainer}>
            <Text style={styles.registroTexto}>¿No tienes cuenta?</Text>
            <TouchableOpacity onPress={() => router.push('/registro')}>
              <Text style={styles.registroBoton}>Regístrate gratis →</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity>
            <Text style={styles.volver}>← Volver a la tienda</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caja: {
    width: 430,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 45,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 20,
  },
  titulo: {
    fontSize: 44,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a1a2e',
    marginBottom: 35,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 6,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 4,
    paddingHorizontal: 14,
    height: 58,
    marginBottom: 15,
    gap: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a2e',
  },
  olvido: {
    color: '#e91e8c',
    textAlign: 'right',
    marginBottom: 28,
    fontSize: 14,
  },
  boton: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 18,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 15,
  },
  mensajeBox: {
    marginTop: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#e91e8c',
  },
  mensajeTexto: {
    fontSize: 12,
    color: '#333',
  },
  registroContainer: {
    marginTop: 28,
    alignItems: 'center',
  },
  registroTexto: {
    color: '#888',
    fontSize: 14,
  },
  registroBoton: {
    color: '#e91e8c',
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 15,
  },
  volver: {
    textAlign: 'center',
    marginTop: 22,
    color: '#999',
    fontSize: 14,
  },
});