import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

const ACCENT = '#e91e8c';
const DARK = '#1a1a2e';

export default function Perfil({

  visible,
  cerrar,
  usuario,

}: any) {

  const router = useRouter();

  const cerrarSesion = async () => {

    try {

      await AsyncStorage.removeItem('usuario');

      cerrar();

      router.replace('/login');

    } catch (error) {

      console.log(error);
    }
  };

  return (

    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >

      <View style={styles.overlay}>

        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={cerrar}
        />

        <View style={styles.panel}>

          {/* HEADER */}

          <View style={styles.header}>

            <Text style={styles.title}>
              Mi Perfil
            </Text>

            <TouchableOpacity onPress={cerrar}>

              <Ionicons
                name="close"
                size={24}
                color={DARK}
              />

            </TouchableOpacity>
          </View>

          {/* PERFIL */}

          <View style={styles.info}>

            <View style={styles.avatar}>

              <Text style={styles.avatarText}>
                {usuario?.nombre?.charAt(0)}
              </Text>

            </View>

            <Text style={styles.nombre}>
              {usuario?.nombre}
            </Text>

            <Text style={styles.correo}>
              {usuario?.correo}
            </Text>

          </View>

          {/* DATOS */}

          <View style={styles.dataBox}>

            <Text style={styles.label}>
              Teléfono
            </Text>

            <Text style={styles.value}>
              {usuario?.telefono || 'No registrado'}
            </Text>

            <Text style={styles.label}>
              Dirección
            </Text>

            <Text style={styles.value}>
              {usuario?.direccion || 'No registrada'}
            </Text>

          </View>

          {/* BOTÓN */}

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={cerrarSesion}
          >

            <Ionicons
              name="log-out-outline"
              size={20}
              color="#fff"
            />

            <Text style={styles.logoutText}>
              Cerrar Sesión
            </Text>

          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  panel: {
    width: '85%',
    backgroundColor: '#fff',
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DARK,
  },

  info: {
    alignItems: 'center',
    padding: 25,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },

  nombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK,
  },

  correo: {
    color: '#777',
    marginTop: 5,
  },

  dataBox: {
    paddingHorizontal: 25,
    marginTop: 10,
  },

  label: {
    fontSize: 12,
    color: '#999',
    marginTop: 18,
  },

  value: {
    fontSize: 16,
    color: DARK,
    fontWeight: '600',
    marginTop: 4,
  },

  logoutBtn: {
    marginTop: 35,
    marginHorizontal: 25,
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

});