import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ACCENT = '#e91e8c';
const DARK = '#3A3A3A';

const REPORTE_URL = Platform.OS === 'web'
  ? 'http://localhost/FashFind/api/reporteVentas.php'
  : 'http://192.168.0.7/FashFind/api/reporteVentas.php';

export default function ReporteVentas() {
  const router = useRouter();

  const abrirReporte = () => {
    if (Platform.OS === 'web') {
      window.open(REPORTE_URL, '_blank');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.barraSuperior}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnVolver}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.barraTitulo}>Reporte de Ventas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.tarjeta}>
          <Ionicons name="document-text-outline" size={48} color={ACCENT} style={{ marginBottom: 16 }} />
          <Text style={styles.titulo}>Reporte Quincenal de Ventas</Text>
          <Text style={styles.descripcion}>
            Genera un reporte con todas las ventas activas de la quincena actual, incluyendo
            detalle de productos, cliente, método de pago e ingresos totales.{'\n\n'}
            Al hacer clic se abrirá el reporte y podrás guardarlo como PDF desde el navegador.
          </Text>

          <TouchableOpacity style={styles.btnDescargar} onPress={abrirReporte}>
            <Ionicons name="print-outline" size={20} color="#fff" />
            <Text style={styles.btnDescargarTexto}>Ver e Imprimir Reporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  barraSuperior: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DARK, paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  btnVolver: { padding: 2 },
  barraTitulo: { color: '#fff', fontSize: 16, fontWeight: '600' },
  contenido: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  tarjeta: {
    backgroundColor: '#fff', borderRadius: 12, padding: 28, alignItems: 'center',
    width: '100%', maxWidth: 420,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  titulo: { fontSize: 18, fontWeight: 'bold', color: DARK, textAlign: 'center', marginBottom: 10 },
  descripcion: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  btnDescargar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: ACCENT, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 8,
  },
  btnDescargarTexto: { color: '#fff', fontSize: 15, fontWeight: '700' },
});