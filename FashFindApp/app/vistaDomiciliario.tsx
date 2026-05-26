import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const ACCENT = '#e91e8c';
const DARK = '#3A3A3A';
const BORDER = '#9A9A9A';

type Seccion = 'pagina_principal' | 'pedido';

export default function VistaDomiciliario() {
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('pagina_principal');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const menuItems: { id: Seccion; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'pagina_principal', label: 'Página Principal', icon: 'home-outline' },
    { id: 'pedido', label: 'Gestión de Pedidos', icon: 'bicycle-outline' },
  ];

  const columnasPedido = [
    'Id Pedido', 'Fecha', 'Hora', 'Método Pago', 'Total', 'Costo Envío',
    'Tipo Entrega', 'Dirección', 'Ciudad', 'Teléfono', 'Fecha Entrega',
    'Estado', 'Domiciliario', 'Cliente',
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Drawer lateral */}
      {menuAbierto && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBg} onPress={() => setMenuAbierto(false)} />
          <View style={styles.barra}>
            <Text style={styles.barraTitle}>Domiciliario</Text>
            <ScrollView>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.barraItem, seccionActiva === item.id && styles.barraItemActivo]}
                  onPress={() => { setSeccionActiva(item.id); setMenuAbierto(false); }}
                >
                  <Ionicons name={item.icon} size={20} color="#fff" />
                  <Text style={styles.barraItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.barraCerrar} onPress={() => router.replace('/login')}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.barraItemText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.contenidoPrincipal}>
        {/* Barra superior */}
        <View style={styles.barraSuperior}>
          <TouchableOpacity onPress={() => setMenuAbierto(true)}>
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.barraSuperiorTitulo}>Bienvenido, Domiciliario</Text>
          <TouchableOpacity style={styles.btnRosa} onPress={() => router.replace('/login')}>
            <Text style={styles.btnRosaTexto}>Salir</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 30 }}>
          {/* Buscador */}
          <View style={styles.buscador}>
            <TextInput
              style={styles.buscadorInput}
              placeholder="Escribe tu búsqueda"
              placeholderTextColor="#999"
              value={busqueda}
              onChangeText={setBusqueda}
            />
            <TouchableOpacity style={styles.btnRosa}>
              <Ionicons name="search" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Página principal */}
          {seccionActiva === 'pagina_principal' && (
            <View style={styles.seccionCajas}>
              <View style={styles.caja}>
                <Ionicons name="time-outline" size={28} color={ACCENT} style={{ marginBottom: 6 }} />
                <Text style={styles.cajaTitulo}>Pedidos Por Entregar</Text>
                <Text style={styles.cajaValor}>5</Text>
              </View>
              <View style={styles.caja}>
                <Ionicons name="checkmark-circle-outline" size={28} color="#2e7d32" style={{ marginBottom: 6 }} />
                <Text style={styles.cajaTitulo}>Pedidos Entregados</Text>
                <Text style={[styles.cajaValor, { color: '#2e7d32' }]}>20</Text>
              </View>
            </View>
          )}

          {/* Tabla pedidos */}
          {seccionActiva === 'pedido' && (
            <View>
              <Text style={styles.seccionTitulo}>Gestión de Pedidos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <View>
                  <View style={styles.tablaHeader}>
                    {columnasPedido.map((col, i) => (
                      <Text key={i} style={styles.tablaTh}>{col}</Text>
                    ))}
                  </View>
                  <View style={styles.tablaFila}>
                    <Text style={styles.tablaTd}>No hay pedidos registrados.</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* Tab bar inferior */}
        <View style={styles.tabBar}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.tabItem}
              onPress={() => setSeccionActiva(item.id)}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={seccionActiva === item.id ? ACCENT : '#999'}
              />
              <Text style={[styles.tabLabel, seccionActiva === item.id && { color: ACCENT }]}>
                {item.label.replace('Gestión de ', '').replace('Página ', '')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, flexDirection: 'row' },
  overlayBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  barra: { width: 260, backgroundColor: DARK, padding: 20, paddingTop: 50 },
  barraTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  barraItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 6 },
  barraItemActivo: { backgroundColor: ACCENT },
  barraItemText: { color: '#fff', fontSize: 15 },
  barraCerrar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: '#555', marginTop: 10 },
  contenidoPrincipal: { flex: 1 },
  barraSuperior: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: DARK, paddingHorizontal: 16, paddingVertical: 14,
  },
  barraSuperiorTitulo: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1, marginLeft: 12 },
  btnRosa: { backgroundColor: ACCENT, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 5 },
  btnRosaTexto: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
  buscador: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  buscadorInput: {
    flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 5,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#333',
  },
  seccionCajas: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  caja: {
    width: (width - 44) / 2, backgroundColor: '#fff', borderRadius: 8, padding: 16,
    borderTopWidth: 4, borderTopColor: ACCENT,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, alignItems: 'center',
  },
  cajaTitulo: { fontSize: 13, fontWeight: '600', color: DARK, textAlign: 'center', marginBottom: 6 },
  cajaValor: { fontSize: 26, fontWeight: 'bold', color: ACCENT },
  seccionTitulo: { fontSize: 20, fontWeight: 'bold', color: DARK, marginBottom: 14 },
  tablaHeader: { flexDirection: 'row', backgroundColor: DARK },
  tablaTh: { color: '#fff', fontWeight: '600', fontSize: 13, paddingHorizontal: 14, paddingVertical: 12, minWidth: 130, borderRightWidth: 1, borderRightColor: '#555' },
  tablaFila: { flexDirection: 'row', borderWidth: 1, borderColor: BORDER, padding: 12 },
  tablaTd: { fontSize: 14, color: '#555' },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff', paddingBottom: 8 },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 8, gap: 2 },
  tabLabel: { fontSize: 11, color: '#999', textAlign: 'center' },
});