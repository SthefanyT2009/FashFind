import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView,
  ImageBackground, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { descargarReporte } from '../reportService';

const ACCENT = '#e91e8c';
const DARK   = '#6b2d8b';
const GREEN  = '#27ae60';

export default function ReporteInventario() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  const manejarDescarga = async (formato: 'pdf' | 'excel') => {
    setCargando(true);
    try {
      await descargarReporte('reporteInventario.php', formato, 'inventario');
    } catch (e) {
      console.error('Error al generar reporte:', e);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.raiz}>
      <ImageBackground
        source={require('../../assets/images/fondoLogin.jpeg')}
        style={styles.fondo}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.barraSuperior}>
            <TouchableOpacity onPress={() => router.back()} style={styles.btnVolver} disabled={cargando}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.barraTitulo}>Reporte de Inventario</Text>
          </View>

          <ScrollView contentContainerStyle={styles.contenido}>
            <View style={styles.tarjeta}>
              <Ionicons name="layers-outline" size={48} color={ACCENT} style={{ marginBottom: 16 }} />
              <Text style={styles.titulo}>Reporte Completo de Inventario</Text>
              <Text style={styles.descripcion}>
                Genera un reporte con todos los registros de inventario activos, incluyendo
                detalle de productos, stock disponible, stock mínimo y estado del inventario.
              </Text>

              <View style={styles.botonesGroup}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: ACCENT, opacity: cargando ? 0.6 : 1 }]}
                  onPress={() => manejarDescarga('pdf')}
                  disabled={cargando}
                >
                  {cargando
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Ionicons name="print-outline" size={20} color="#fff" />}
                  <Text style={styles.btnTexto}>{cargando ? 'Descargando...' : 'Guardar como PDF'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: GREEN, opacity: cargando ? 0.6 : 1 }]}
                  onPress={() => manejarDescarga('excel')}
                  disabled={cargando}
                >
                  {cargando
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Ionicons name="grid-outline" size={20} color="#fff" />}
                  <Text style={styles.btnTexto}>{cargando ? 'Descargando...' : 'Descargar Excel'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.nota}>
                {Platform.OS === 'web'
                  ? 'PDF: se abrirá una ventana para imprimir o guardar.\nExcel: se descargará el archivo directamente.'
                  : 'El archivo se descargará y podrás compartirlo o guardarlo en tu dispositivo.'}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz:           { flex: 1 },
  fondo:          { flex: 1, width: '100%', height: '100%' },
  container:      { flex: 1, backgroundColor: 'transparent' },
  barraSuperior:  { flexDirection: 'row', alignItems: 'center', backgroundColor: DARK, paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  btnVolver:      { padding: 2 },
  barraTitulo:    { color: '#fff', fontSize: 16, fontWeight: '600' },
  contenido:      { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  tarjeta: {
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 28, alignItems: 'center',
    width: '100%', maxWidth: 420,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  titulo:       { fontSize: 18, fontWeight: 'bold', color: DARK, textAlign: 'center', marginBottom: 10 },
  descripcion:  { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  botonesGroup: { width: '100%', gap: 12, marginBottom: 20 },
  btn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 8, width: '100%' },
  btnTexto:     { color: '#fff', fontSize: 15, fontWeight: '700' },
  nota:         { fontSize: 11, color: '#999', textAlign: 'center', lineHeight: 18 },
});