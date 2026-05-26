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
const LIGHT_BG = '#F3F3F3';
const BORDER = '#9A9A9A';

type Seccion = 'pagina_principal' | 'usuario' | 'venta' | 'pedido' | 'producto' | 'inventario';

export default function VistaAdministrador() {
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('pagina_principal');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const menuItems: { id: Seccion; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'pagina_principal', label: 'Página Principal', icon: 'home-outline' },
    { id: 'usuario', label: 'Gestión de Usuarios', icon: 'people-outline' },
    { id: 'venta', label: 'Gestión de Ventas', icon: 'cash-outline' },
    { id: 'pedido', label: 'Gestión de Pedidos', icon: 'cart-outline' },
    { id: 'producto', label: 'Gestión de Productos', icon: 'shirt-outline' },
    { id: 'inventario', label: 'Gestión de Inventario', icon: 'layers-outline' },
  ];

  const cajas = [
    { titulo: 'Usuarios Activos', valor: '3' },
    { titulo: 'Usuarios Inactivos', valor: '4' },
    { titulo: 'Clientes Registrados', valor: '5' },
    { titulo: 'Clientes Inactivos', valor: '8' },
    { titulo: 'Ventas Quincenales', valor: '$500.000' },
    { titulo: 'Pedidos Por Entregar', valor: '5' },
    { titulo: 'Pedidos Entregados', valor: '20' },
    { titulo: 'Productos Activos', valor: '20' },
  ];

  const columnasPorSeccion: Record<Seccion, string[]> = {
    pagina_principal: [],
    usuario: ['Id', 'CC', 'Nombre Usuario', 'Nombres', 'Apellidos', 'Teléfono', 'Correo', 'Dirección', 'Cargo', 'Estado'],
    venta: ['Id Venta', 'Fecha', 'Hora', 'Método Pago', 'Total', 'Pago Recibido', 'Cambio', 'Estado', 'Id Vendedor'],
    pedido: ['Id Pedido', 'Fecha', 'Hora', 'Método', 'Total', 'Envío', 'Tipo Entrega', 'Dirección', 'Ciudad', 'Teléfono', 'Fecha Entrega', 'Estado', 'Domiciliario', 'Cliente'],
    producto: ['Id Producto', 'Nombre', 'Descripción', 'Categoría', 'Talla', 'Color', 'Precio', 'Estado'],
    inventario: ['Id Inventario', 'Stock Disponible', 'Stock Mínimo', 'Id Producto'],
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra lateral como drawer */}
      {menuAbierto && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBg} onPress={() => setMenuAbierto(false)} />
          <View style={styles.barra}>
            <Text style={styles.barraTitle}>Administrador</Text>
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

      {/* Contenido principal */}
      <View style={styles.contenidoPrincipal}>
        {/* Barra superior */}
        <View style={styles.barraSuperior}>
          <TouchableOpacity onPress={() => setMenuAbierto(true)}>
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.barraSuperiorTitulo}>Bienvenido, Administrador</Text>
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

          {/* Sección principal */}
          {seccionActiva === 'pagina_principal' && (
            <View>
              <View style={styles.seccionCajas}>
                {cajas.map((caja, i) => (
                  <View key={i} style={styles.caja}>
                    <Text style={styles.cajaTitulo}>{caja.titulo}</Text>
                    <Text style={styles.cajaValor}>{caja.valor}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Secciones con tablas */}
          {seccionActiva !== 'pagina_principal' && (
            <View>
              <Text style={styles.seccionTitulo}>
                {menuItems.find(m => m.id === seccionActiva)?.label}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <View>
                  {/* Header tabla */}
                  <View style={styles.tablaHeader}>
                    {columnasPorSeccion[seccionActiva].map((col, i) => (
                      <Text key={i} style={styles.tablaTh}>{col}</Text>
                    ))}
                  </View>
                  {/* Fila vacía */}
                  <View style={styles.tablaFila}>
                    <Text style={styles.tablaTd}>No hay registros.</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* Tab inferior de navegación */}
        <View style={styles.tabBar}>
          {menuItems.slice(0, 5).map((item) => (
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
  barra: {
    width: 260,
    backgroundColor: DARK,
    padding: 20,
    paddingTop: 50,
  },
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
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderTopWidth: 4,
    borderTopColor: ACCENT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  cajaTitulo: { fontSize: 13, fontWeight: '600', color: DARK, textAlign: 'center', marginBottom: 6 },
  cajaValor: { fontSize: 22, fontWeight: 'bold', color: ACCENT },
  seccionTitulo: { fontSize: 20, fontWeight: 'bold', color: DARK, marginBottom: 14 },
  tablaHeader: { flexDirection: 'row', backgroundColor: DARK },
  tablaTh: { color: '#fff', fontWeight: '600', fontSize: 13, paddingHorizontal: 14, paddingVertical: 12, minWidth: 120, borderRightWidth: 1, borderRightColor: '#555' },
  tablaFila: { flexDirection: 'row', borderWidth: 1, borderColor: BORDER, padding: 12 },
  tablaTd: { fontSize: 14, color: '#555' },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingBottom: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 8, gap: 2 },
  tabLabel: { fontSize: 10, color: '#999', textAlign: 'center' },
});