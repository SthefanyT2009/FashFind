import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ACCENT = '#e91e8c';
const DARK = '#6b2d8b';
const SIDEBAR_WIDTH = 220;

const ES_WEB_ESCRITORIO = Platform.OS === 'web' && width >= 768;

const API_BASE = Platform.OS === 'web' ? 'http://localhost/FashFind/api' : 'http://192.168.1.7/FashFind/api';

const mostrarAlerta = (titulo: string, mensaje: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    onOk?.();
  } else {
    Alert.alert(titulo, mensaje, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
};

type Seccion = 'pagina_principal' | 'venta' | 'inventario';

// ── Gráfica de Ventas últimos 15 días ──────────────────────────
const GraficaVentas = ({ ventas }: { ventas: any[] }) => {
  if (Platform.OS !== 'web') return null;

  const chartW = ES_WEB_ESCRITORIO ? Math.min(width - SIDEBAR_WIDTH - 80, 900) : width - 32;
  const chartH = 220;
  const pL = 62, pR = 16, pT = 16, pB = 40;
  const innerW = chartW - pL - pR;
  const innerH = chartH - pT - pB;

  const hoy = new Date();
  const dias: string[] = [];
  for (let i = 14; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i);
    dias.push(d.toISOString().slice(0, 10));
  }

  const totales: Record<string, number> = {};
  dias.forEach(d => { totales[d] = 0; });
  ventas.forEach(v => {
    if (v.estado === 'Activo' && totales[v.fecha_venta] !== undefined) {
      totales[v.fecha_venta] += Number(v.costo_total) || 0;
    }
  });
  const vals = dias.map(d => totales[d]);
  const maxVal = Math.max(...vals, 1);

  const gx = (i: number) => pL + (i / (dias.length - 1)) * innerW;
  const gy = (v: number) => pT + innerH - (v / maxVal) * innerH;

  const linePts = vals.map((v, i) => `${gx(i)},${gy(v)}`).join(' ');
  const areaPts = [`${gx(0)},${pT + innerH}`, ...vals.map((v, i) => `${gx(i)},${gy(v)}`), `${gx(14)},${pT + innerH}`].join(' ');
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(maxVal * f));
  const fmt = (n: number) => n >= 1_000_000 ? `$${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${(n/1_000).toFixed(0)}k` : `$${n}`;

  const svgHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="${chartW}" height="${chartH}" style="overflow:visible">
    ${yTicks.map(val => {
      const y = gy(val);
      return `<line x1="${pL}" y1="${y}" x2="${chartW - pR}" y2="${y}" stroke="#f0e6fb" stroke-width="1" stroke-dasharray="4,3"/>
              <text x="${pL - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#9b59b6">${fmt(val)}</text>`;
    }).join('')}
    <polygon points="${areaPts}" fill="#e91e8c" fill-opacity="0.08"/>
    <polyline points="${linePts}" fill="none" stroke="#e91e8c" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${vals.map((v, i) => `<circle cx="${gx(i)}" cy="${gy(v)}" r="4" fill="#fff" stroke="#e91e8c" stroke-width="2"/>`).join('')}
    ${dias.map((d, i) => {
      if (i % 3 !== 0 && i !== 14) return '';
      const [, mm, dd] = d.split('-');
      return `<text x="${gx(i)}" y="${chartH - 8}" text-anchor="middle" font-size="10" fill="#9b59b6">${dd}/${mm}</text>`;
    }).join('')}
  </svg>`;

  return (
    <View style={{ marginTop: 24, backgroundColor: '#fff', borderRadius: 12, padding: 16,
      shadowColor: '#6b2d8b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 12 }}>
        Ventas — Últimos 15 días
      </Text>
      <div dangerouslySetInnerHTML={{ __html: svgHtml }} style={{ overflowX: 'auto' } as any} />
    </View>
  );
};

export default function VistaVendedor() {
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('pagina_principal');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [ventas, setVentas] = useState<any[]>([]);
  const [cargandoVentas, setCargandoVentas] = useState(false);

  const [inventarios, setInventarios] = useState<any[]>([]);
  const [cargandoInventarios, setCargandoInventarios] = useState(false);

  // Usuario que inició sesión (guardado por login.tsx en AsyncStorage)
  const [usuarioSesion, setUsuarioSesion] = useState<any>(null);
  const [sesionCargada, setSesionCargada] = useState(false);

  const menuItems: { id: Seccion; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'pagina_principal', label: 'Página Principal', icon: 'home-outline' },
    { id: 'venta', label: 'Gestión de Ventas', icon: 'cash-outline' },
    { id: 'inventario', label: 'Gestión de Inventario', icon: 'layers-outline' },
  ];

  // ── Cargar usuario de sesión ──
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('usuarioSesion');
        setUsuarioSesion(raw ? JSON.parse(raw) : null);
      } catch (error) {
        console.error('Error leyendo la sesión:', error);
        setUsuarioSesion(null);
      } finally {
        setSesionCargada(true);
      }
    })();
  }, []);

  // ── Cargar Ventas (solo las del vendedor que inició sesión) ──
  const cargarVentas = useCallback(async (mostrarCarga = true) => {
    try {
      if (mostrarCarga) setCargandoVentas(true);
      const idUsuario = usuarioSesion?.id;
      const url = idUsuario
        ? `${API_BASE}/ventas.php?id_usuario=${idUsuario}`
        : `${API_BASE}/ventas.php`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setVentas(json.data ?? []);
      } else {
        mostrarAlerta('Error', json.mensaje ?? 'No se pudieron cargar las ventas.');
      }
    } catch (error) {
      console.error('Error cargando ventas:', error);
      mostrarAlerta('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      if (mostrarCarga) setCargandoVentas(false);
      setRefreshing(false);
    }
  }, [usuarioSesion]);

  // ── Cargar Inventario ──
  const cargarInventarios = useCallback(async (mostrarCarga = true) => {
    try {
      if (mostrarCarga) setCargandoInventarios(true);
      const res = await fetch(`${API_BASE}/inventario.php`);
      const json = await res.json();
      if (json.success) {
        setInventarios(json.data ?? []);
      } else {
        mostrarAlerta('Error', json.mensaje ?? 'No se pudieron cargar los inventarios.');
      }
    } catch (error) {
      console.error('Error cargando inventarios:', error);
      mostrarAlerta('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      if (mostrarCarga) setCargandoInventarios(false);
      setRefreshing(false);
    }
  }, []);

  // ── Ventas Quincenales (calculado en el cliente sobre las ventas ya filtradas por vendedor) ──
  const ventasQuincenales = ventas.reduce((total, v) => {
    if (v.estado !== 'Activo') return total;
    const limite = new Date();
    limite.setDate(limite.getDate() - 15);
    const limiteStr = limite.toISOString().slice(0, 10);
    if (v.fecha_venta >= limiteStr) {
      return total + (Number(v.costo_total) || 0);
    }
    return total;
  }, 0);

  useFocusEffect(
    useCallback(() => {
      if (!sesionCargada) return;
      if (seccionActiva === 'venta') {
        cargarVentas();
      } else if (seccionActiva === 'inventario') {
        cargarInventarios();
      } else if (seccionActiva === 'pagina_principal') {
        cargarVentas();
      }
    }, [seccionActiva, sesionCargada, cargarVentas, cargarInventarios])
  );

  useEffect(() => {
    if (!sesionCargada) return;
    if (seccionActiva === 'venta') {
      cargarVentas();
    } else if (seccionActiva === 'inventario') {
      cargarInventarios();
    }
  }, [seccionActiva, sesionCargada, cargarVentas, cargarInventarios]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (seccionActiva === 'venta') {
      cargarVentas(false);
    } else if (seccionActiva === 'inventario') {
      cargarInventarios(false);
    } else {
      setRefreshing(false);
    }
  }, [seccionActiva, cargarVentas, cargarInventarios]);

  // ── Filtros de búsqueda simple ──
  const ventasFiltradas = ventas.filter(v => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      (v.id_venta && String(v.id_venta).includes(q)) ||
      (v.fecha_venta && String(v.fecha_venta).toLowerCase().includes(q)) ||
      (v.hora && String(v.hora).toLowerCase().includes(q)) ||
      (v.metodo_pago && String(v.metodo_pago).toLowerCase().includes(q)) ||
      (v.estado && String(v.estado).toLowerCase().includes(q)) ||
      (v.costo_total && String(v.costo_total).includes(q))
    );
  });

  const inventariosFiltrados = inventarios.filter(inv => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      (inv.id_inventario && String(inv.id_inventario).includes(q)) ||
      (inv.nombre_producto && String(inv.nombre_producto).toLowerCase().includes(q)) ||
      (inv.stock_disponible && String(inv.stock_disponible).includes(q)) ||
      (inv.stock_minimo && String(inv.stock_minimo).includes(q)) ||
      (inv.id_producto && String(inv.id_producto).includes(q)) ||
      (inv.estado && String(inv.estado).toLowerCase().includes(q))
    );
  });

  const limpiarBusqueda = () => setBusqueda('');

  const cerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('usuarioSesion');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    } finally {
      router.replace('/login');
    }
  };

  const BarraLateral = ({ onClose }: { onClose?: () => void }) => (
    <View style={styles.barra}>
      <Text style={styles.barraTitle}>Vendedor</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.barraItem, seccionActiva === item.id && styles.barraItemActivo]}
            onPress={() => { setSeccionActiva(item.id); onClose?.(); limpiarBusqueda(); }}
          >
            <Ionicons name={item.icon} size={20} color="#fff" />
            <Text style={styles.barraItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.barraCerrar} onPress={cerrarSesion}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.barraItemText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );

  const contenidoJSX = (
    <View style={styles.contenidoPrincipal}>
      {/* Barra superior */}
      <View style={styles.barraSuperior}>
        {!ES_WEB_ESCRITORIO && (
          <TouchableOpacity onPress={() => setMenuAbierto(true)}>
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={[styles.barraSuperiorTitulo, ES_WEB_ESCRITORIO && { marginLeft: 0 }]}>
          Bienvenido, {usuarioSesion?.nombres ?? 'Vendedor'}
        </Text>
        <TouchableOpacity style={styles.btnRosa} onPress={cerrarSesion}>
          <Text style={styles.btnRosaTexto}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ACCENT]} />
        }
      >
        {/* Buscador */}
        {(seccionActiva === 'venta' || seccionActiva === 'inventario') && (
          <View style={styles.buscador}>
            <TextInput
              style={styles.buscadorInput}
              placeholder={
                seccionActiva === 'venta'
                  ? 'Buscar por ID, fecha, estado...'
                  : 'Buscar por producto, stock...'
              }
              placeholderTextColor="#999"
              value={busqueda}
              onChangeText={setBusqueda}
            />
            {busqueda !== '' && (
              <TouchableOpacity style={styles.btnRosa} onPress={limpiarBusqueda}>
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Página principal */}
        {seccionActiva === 'pagina_principal' && (
          <>
            <View style={styles.seccionCajas}>
              <View style={[styles.caja, ES_WEB_ESCRITORIO && styles.cajaWeb]}>
                <Text style={styles.cajaTitulo}>Ventas Quincenales</Text>
                <Text style={styles.cajaValor}>
                  ${Number(ventasQuincenales).toLocaleString('es-CO')}
                </Text>
              </View>
            </View>
            <GraficaVentas ventas={ventas} />
          </>
        )}

        {/* Gestión de Ventas */}
        {seccionActiva === 'venta' && (
          <View>
            <View style={styles.headerSeccionConAcciones}>
              <Text style={styles.seccionTitulo}>Gestión de Ventas</Text>
              <View style={styles.botonesSeccionSuperior}>
                <TouchableOpacity
                  style={styles.btnSeccionSuperior}
                  onPress={() => router.push('/form_registros/registroVentasVendedor' as any)}
                >
                  <Text style={styles.btnSeccionTexto}>Crear Nueva Venta</Text>
                </TouchableOpacity>
              </View>
            </View>

            {cargandoVentas ? (
              <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={ACCENT} />
                <Text style={{ color: '#888', marginTop: 8 }}>Cargando ventas...</Text>
              </View>
            ) : ventasFiltradas.length === 0 ? (
              <Text style={{ color: '#888', padding: 16 }}>
                {busqueda ? 'No hay ventas que coincidan con tu búsqueda.' : 'No hay ventas registradas.'}
              </Text>
            ) : (
              ventasFiltradas.map((v) => (
                <View key={v.id_venta} style={styles.ventaCard}>
                  <View style={styles.ventaCardHeader}>
                    <Text style={styles.ventaCardId}>Venta #{v.id_venta}</Text>
                    <Text style={[styles.ventaCardEstado, {
                      backgroundColor: v.estado === 'Activo' ? '#27ae60' : '#e74c3c',
                    }]}>{v.estado}</Text>
                  </View>
                  <View style={styles.ventaCardInfo}>
                    <Text style={styles.ventaCardTxt}>{v.fecha_venta}   {v.hora}</Text>
                    <Text style={styles.ventaCardTxt}>{v.metodo_pago}</Text>
                    <Text style={styles.ventaCardTxt}>
                      Total: ${Number(v.costo_total).toLocaleString('es-CO')}  |  Cambio: ${Number(v.cambio).toLocaleString('es-CO')}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Gestión de Inventario */}
        {seccionActiva === 'inventario' && (
          <View>
            <Text style={styles.seccionTitulo}>Gestión de Inventario</Text>
            <View style={{ height: 16 }} />

            {cargandoInventarios ? (
              <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={ACCENT} />
                <Text style={{ color: '#888', marginTop: 8 }}>Cargando inventarios...</Text>
              </View>
            ) : inventariosFiltrados.length === 0 ? (
              <Text style={{ color: '#888', padding: 16 }}>
                {busqueda ? 'No hay inventarios que coincidan con tu búsqueda.' : 'No hay registros de inventario.'}
              </Text>
            ) : (
              inventariosFiltrados.map((inv) => (
                <View key={inv.id_inventario} style={styles.ventaCard}>
                  <View style={styles.ventaCardHeader}>
                    <Text style={styles.ventaCardId}>Inventario #{inv.id_inventario}</Text>
                    <Text style={[styles.ventaCardEstado, {
                      backgroundColor: inv.estado === 'Activo' ? '#27ae60' : '#e74c3c',
                    }]}>{inv.estado}</Text>
                  </View>
                  <View style={styles.ventaCardInfo}>
                    <Text style={styles.ventaCardTxt}><Text style={{ fontWeight: 'bold' }}>Producto:</Text> {inv.nombre_producto}</Text>
                    <Text style={styles.ventaCardTxt}><Text style={{ fontWeight: 'bold' }}>ID Producto:</Text> {inv.id_producto}</Text>
                    <Text style={styles.ventaCardTxt}><Text style={{ fontWeight: 'bold' }}>Stock Disponible:</Text> {inv.stock_disponible} unidades</Text>
                    <Text style={styles.ventaCardTxt}><Text style={{ fontWeight: 'bold' }}>Stock Mínimo:</Text> {inv.stock_minimo} unidades</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Tab bar inferior (solo móvil) */}
      {!ES_WEB_ESCRITORIO && (
        <View style={styles.tabBar}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.tabItem}
              onPress={() => { setSeccionActiva(item.id); limpiarBusqueda(); }}
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
      )}
    </View>
  );

  if (ES_WEB_ESCRITORIO) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.layoutWeb}>
          <BarraLateral />
          {contenidoJSX}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {menuAbierto && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBg} onPress={() => setMenuAbierto(false)} />
          <BarraLateral onClose={() => setMenuAbierto(false)} />
        </View>
      )}
      {contenidoJSX}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  layoutWeb: { flex: 1, flexDirection: 'row', paddingLeft: SIDEBAR_WIDTH },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, flexDirection: 'row' },
  overlayBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },

  barra: { width: SIDEBAR_WIDTH, backgroundColor: DARK, padding: 20, paddingTop: 20, height: '100%', position: ES_WEB_ESCRITORIO ? 'fixed' : 'relative', top: 0, left: 0, zIndex: 50 },
  barraTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  barraItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 6 },
  barraItemActivo: { backgroundColor: ACCENT },
  barraItemText: { color: '#fff', fontSize: 16 },
  barraCerrar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: '#9b59b6', marginTop: 10 },

  contenidoPrincipal: { flex: 1, width: '100%' },
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
    flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, color: '#333',
  },
  seccionCajas: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  caja: {
    backgroundColor: '#fff', borderRadius: 8, padding: 16,
    borderTopWidth: 4, borderTopColor: ACCENT,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, alignItems: 'center',
  },
  cajaWeb: { width: 200 },
  cajaTitulo: { fontSize: 13, fontWeight: '600', color: DARK, textAlign: 'center', marginBottom: 6 },
  cajaValor: { fontSize: 22, fontWeight: 'bold', color: ACCENT },
  seccionTitulo: { fontSize: 20, fontWeight: 'bold', color: DARK },
  headerSeccionConAcciones: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 },
  botonesSeccionSuperior: { flexDirection: 'row', gap: 8 },
  btnSeccionSuperior: { backgroundColor: DARK, borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8 },
  btnSeccionTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },

  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff', paddingBottom: 8 },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 8, gap: 2 },
  tabLabel: { fontSize: 9, color: '#999', textAlign: 'center' },

  // Tarjetas de ventas / inventario (comparten estilos)
  ventaCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, borderLeftWidth: 4, borderLeftColor: ACCENT },
  ventaCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ventaCardId: { fontSize: 15, fontWeight: 'bold', color: DARK },
  ventaCardEstado: { fontSize: 11, fontWeight: '700', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  ventaCardInfo: { gap: 3, marginBottom: 10 },
  ventaCardTxt: { fontSize: 13, color: '#555' },
});