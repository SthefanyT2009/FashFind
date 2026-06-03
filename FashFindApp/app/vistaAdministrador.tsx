import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const ACCENT = '#e91e8c';
const DARK = '#3A3A3A';
const BORDER = '#9A9A9A';
const SIDEBAR_WIDTH = 220;

const ES_WEB_ESCRITORIO = Platform.OS === 'web' && width >= 768;

const API_BASE = 'http://localhost/FashFind/api';

type Seccion = 'pagina_principal' | 'usuario' | 'venta' | 'pedido' | 'producto' | 'inventario';

// ── Definición de columnas por sección (igual al PHP) ──
const columnasPorSeccion: Record<Seccion, string[]> = {
  pagina_principal: [],
  usuario: ['Id Usuario', 'CC', 'Nombre Usuario', 'Contraseña', 'Nombres', 'Apellidos', 'Teléfono', 'Correo', 'Dirección', 'Género', 'Fecha Nacimiento', 'Fecha Registro', 'Cargo', 'Estado', 'Acciones'],
  venta: ['Id Venta', 'Fecha Venta', 'Hora', 'Método Pago', 'Costo Total', 'Pago Recibido', 'Cambio', 'Estado', 'Id Vendedor', 'Acciones'],
  pedido: ['Id Pedido', 'Fecha Pedido', 'Hora Pedido', 'Método Pago', 'Total Pedido', 'Costo Envío', 'Tipo Entrega', 'Dirección Entrega', 'Ciudad Entrega', 'Teléfono Contacto', 'Fecha Entrega', 'Estado', 'Id Domiciliario', 'Id Cliente', 'Acciones'],
  producto: ['Id Producto', 'Imagen', 'Nombre Producto', 'Descripción', 'Categoría', 'Talla', 'Color', 'Precio', 'Estado', 'Acciones'],
  inventario: ['Id Inventario', 'Stock Disponible', 'Stock Mínimo', 'Id Producto', 'Acciones'],
};

// Botones de acción por sección
const accionesPorSeccion: Record<Seccion, { label: string; ruta: string }[]> = {
  pagina_principal: [],
  usuario: [
    { label: 'Crear Nuevo Usuario', ruta: '/registroUsuarios' },
  ],
  venta: [
    { label: 'Crear Nueva Venta', ruta: '/form_registros/registroVentas' },
    { label: 'Reporte de Ventas', ruta: '/form_actualizaciones/reporteVentas' },
  ],
  pedido: [
    { label: 'Crear Nuevo Pedido', ruta: '/registroPedidos' },
    { label: 'Reporte de Pedidos', ruta: '/reportePedidos' },
  ],
  producto: [
    { label: 'Crear Nuevo Producto', ruta: '/registroProductos' },
  ],
  inventario: [
    { label: 'Crear Nuevo Inventario', ruta: '/registroInventario' },
    { label: 'Reporte de Inventario', ruta: '/reporteInventario' },
  ],
};

// Botones de fila por sección
const botonesFilaPorSeccion: Record<Seccion, string[]> = {
  pagina_principal: [],
  usuario: ['Actualizar', 'Eliminar', 'Reactivar'],
  venta: ['Actualizar', 'Eliminar', 'Reactivar'],
  pedido: ['Actualizar', 'Cancelar', 'Reactivar'],
  producto: ['Actualizar', 'Eliminar', 'Reactivar'],
  inventario: ['Actualizar'],
};

export default function VistaAdministrador() {
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('pagina_principal');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // ── Estado ventas ──────────────────────────────────────────────────────────
  const [ventas, setVentas] = useState<any[]>([]);
  const [cargandoVentas, setCargandoVentas] = useState(false);

  // ── Cargar ventas al entrar a la sección ──────────────────────────────────
  const cargarVentas = useCallback(async () => {
    try {
      setCargandoVentas(true);
      const res  = await fetch(`${API_BASE}/ventas.php`);
      const json = await res.json();
      if (json.success) setVentas(json.data ?? []);
      else Alert.alert('Error', json.mensaje ?? 'No se pudieron cargar las ventas.');
    } catch {
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setCargandoVentas(false);
    }
  }, []);

  useEffect(() => {
    if (seccionActiva === 'venta') cargarVentas();
  }, [seccionActiva]);

  // ── Filtrar ventas según búsqueda ─────────────────────────────────────────
  const ventasFiltradas = ventas.filter(v => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      String(v.id_venta).includes(q) ||
      (v.fecha_venta ?? '').toLowerCase().includes(q) ||
      (v.metodo_pago ?? '').toLowerCase().includes(q) ||
      (v.estado ?? '').toLowerCase().includes(q) ||
      (v.nombres ?? '').toLowerCase().includes(q) ||
      (v.apellidos ?? '').toLowerCase().includes(q)
    );
  });

  // ── Acciones de fila ──────────────────────────────────────────────────────
  const accionFila = async (btn: string, venta: any) => {
    if (btn === 'Actualizar') {
      router.push({ pathname: '/form_actualizaciones/editarVentas', params: { id: String(venta.id_venta) } } as any);
      return;
    }

    const esEliminar  = btn === 'Eliminar';
    const esReactivar = btn === 'Reactivar';
    if (!esEliminar && !esReactivar) return;

    const accion  = esEliminar ? 'eliminar' : 'reactivar';
    const mensaje = esEliminar
      ? `¿Desactivar la venta #${venta.id_venta}?`
      : `¿Reactivar la venta #${venta.id_venta}?`;

    Alert.alert('Confirmar', mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            const res  = await fetch(`${API_BASE}/ventas.php?id=${venta.id_venta}&action=${accion}`, { method: 'PUT' });
            const json = await res.json();
            if (json.success) {
              Alert.alert('Éxito', json.mensaje);
              cargarVentas();
            } else {
              Alert.alert('Error', json.mensaje ?? 'No se pudo completar la acción.');
            }
          } catch {
            Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
          }
        },
      },
    ]);
  };

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

  const BarraLateral = ({ onClose }: { onClose?: () => void }) => (
    <View style={styles.barra}>
      <Text style={styles.barraTitle}>Administrador</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.barraItem, seccionActiva === item.id && styles.barraItemActivo]}
            onPress={() => { setSeccionActiva(item.id); onClose?.(); }}
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
  );

  const Contenido = () => (
    <View style={styles.contenidoPrincipal}>
      {/* Barra superior */}
      <View style={styles.barraSuperior}>
        {!ES_WEB_ESCRITORIO && (
          <TouchableOpacity onPress={() => setMenuAbierto(true)}>
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={[styles.barraSuperiorTitulo, ES_WEB_ESCRITORIO && { marginLeft: 0 }]}>
          Bienvenido, Administrador
        </Text>
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

        {/* Página principal: cajas */}
        {seccionActiva === 'pagina_principal' && (
          <View style={styles.seccionCajas}>
            {cajas.map((caja, i) => (
              <View key={i} style={[styles.caja, ES_WEB_ESCRITORIO && styles.cajaWeb]}>
                <Text style={styles.cajaTitulo}>{caja.titulo}</Text>
                <Text style={styles.cajaValor}>{caja.valor}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Secciones con tablas */}
        {seccionActiva !== 'pagina_principal' && (
          <View>
            <Text style={styles.seccionTitulo}>
              {menuItems.find(m => m.id === seccionActiva)?.label}
            </Text>

            {/* ── Tabla de Ventas con datos reales ── */}
            {seccionActiva === 'venta' && (
              <View>
                {cargandoVentas ? (
                  <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={ACCENT} />
                    <Text style={{ color: '#888', marginTop: 8 }}>Cargando ventas...</Text>
                  </View>
                ) : (
                  <ScrollView horizontal={!ES_WEB_ESCRITORIO} showsHorizontalScrollIndicator={!ES_WEB_ESCRITORIO}>
                    <View style={ES_WEB_ESCRITORIO ? { width: '100%' } : {}}>
                      {/* Header */}
                      <View style={styles.tablaHeader}>
                        {columnasPorSeccion.venta.map((col, i) => (
                          <Text key={i} style={[styles.tablaTh, ES_WEB_ESCRITORIO && { flex: 1, minWidth: 0 }]}>{col}</Text>
                        ))}
                      </View>
                      {/* Filas */}
                      {ventasFiltradas.length === 0 ? (
                        <View style={styles.tablaFila}>
                          <Text style={[styles.tablaTdVacio, ES_WEB_ESCRITORIO && { flex: 1 }]}>
                            No hay ventas registradas.
                          </Text>
                          <View style={styles.tablaTdAcciones}>
                            {botonesFilaPorSeccion.venta.map((btn, i) => (
                              <TouchableOpacity key={i} style={styles.btnAccion}>
                                <Text style={styles.btnAccionTexto}>{btn}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      ) : (
                        ventasFiltradas.map((v) => (
                          <View key={v.id_venta} style={styles.tablaFila}>
                            <Text style={styles.tablaTd}>{v.id_venta}</Text>
                            <Text style={styles.tablaTd}>{v.fecha_venta}</Text>
                            <Text style={styles.tablaTd}>{v.hora}</Text>
                            <Text style={styles.tablaTd}>{v.metodo_pago}</Text>
                            <Text style={styles.tablaTd}>${Number(v.costo_total).toLocaleString('es-CO')}</Text>
                            <Text style={styles.tablaTd}>${Number(v.pago_recibido).toLocaleString('es-CO')}</Text>
                            <Text style={styles.tablaTd}>${Number(v.cambio).toLocaleString('es-CO')}</Text>
                            <Text style={[styles.tablaTd, { color: v.estado === 'Activo' ? '#27ae60' : '#e74c3c', fontWeight: '600' }]}>{v.estado}</Text>
                            <Text style={styles.tablaTd}>{v.id_usuario} - {v.nombres} {v.apellidos}</Text>
                            {/* Columna Acciones */}
                            <View style={styles.tablaTdAcciones}>
                              {botonesFilaPorSeccion.venta.map((btn, i) => (
                                <TouchableOpacity key={i} style={styles.btnAccion} onPress={() => accionFila(btn, v)}>
                                  <Text style={styles.btnAccionTexto}>{btn}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        ))
                      )}
                    </View>
                  </ScrollView>
                )}
              </View>
            )}

            {/* ── Otras secciones: tabla estática sin datos reales aún ── */}
            {seccionActiva !== 'venta' && (
              <ScrollView horizontal={!ES_WEB_ESCRITORIO} showsHorizontalScrollIndicator={!ES_WEB_ESCRITORIO}>
                <View style={ES_WEB_ESCRITORIO ? { width: '100%' } : {}}>
                  {/* Header */}
                  <View style={styles.tablaHeader}>
                    {columnasPorSeccion[seccionActiva].map((col, i) => (
                      <Text key={i} style={[styles.tablaTh, ES_WEB_ESCRITORIO && { flex: 1, minWidth: 0 }]}>{col}</Text>
                    ))}
                  </View>
                  <View style={styles.tablaFila}>
                    <Text style={[styles.tablaTdVacio, ES_WEB_ESCRITORIO && { flex: 1 }]}>
                      No hay registros.
                    </Text>
                    <View style={styles.tablaTdAcciones}>
                      {botonesFilaPorSeccion[seccionActiva].map((btn, i) => (
                        <TouchableOpacity key={i} style={styles.btnAccion}>
                          <Text style={styles.btnAccionTexto}>{btn}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Botones de sección (Crear, Reporte) */}
            <View style={styles.botonesSeccion}>
              {accionesPorSeccion[seccionActiva].map((accion, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.btnSeccion}
                  onPress={() => router.push(accion.ruta as any)}
                >
                  <Text style={styles.btnSeccionTexto}>{accion.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Tab bar inferior: visible siempre en móvil, oculto en escritorio */}
      {!ES_WEB_ESCRITORIO && (
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
      )}
    </View>
  );

  if (ES_WEB_ESCRITORIO) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.layoutWeb}>
          <BarraLateral />
          <Contenido />
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
      <Contenido />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  layoutWeb: { flex: 1, flexDirection: 'row' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, flexDirection: 'row' },
  overlayBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },

  barra: { width: SIDEBAR_WIDTH, backgroundColor: DARK, padding: 20, paddingTop: 200 },
  barraTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  barraItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 6 },
  barraItemActivo: { backgroundColor: ACCENT },
  barraItemText: { color: '#fff', fontSize: 16 },
  barraCerrar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: '#555', marginTop: 10 },

  contenidoPrincipal: { flex: 1 },
  barraSuperior: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: DARK, paddingHorizontal: 16, paddingVertical: 14 },
  barraSuperiorTitulo: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1, marginLeft: 12 },

  btnRosa: { backgroundColor: ACCENT, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 5 },
  btnRosaTexto: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },

  buscador: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  buscadorInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#333' },

  seccionCajas: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  caja: {
    width: (width - 44) / 2,
    backgroundColor: '#fff', borderRadius: 8, padding: 16,
    borderTopWidth: 4, borderTopColor: ACCENT,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, alignItems: 'center',
  },
  cajaWeb: { width: 200 },
  cajaTitulo: { fontSize: 13, fontWeight: '600', color: DARK, textAlign: 'center', marginBottom: 6 },
  cajaValor: { fontSize: 22, fontWeight: 'bold', color: ACCENT },

  seccionTitulo: { fontSize: 20, fontWeight: 'bold', color: DARK, marginBottom: 14 },

  tablaHeader: { flexDirection: 'row', backgroundColor: DARK },
  tablaTh: { color: '#fff', fontWeight: '600', fontSize: 12, paddingHorizontal: 10, paddingVertical: 10, minWidth: 110, borderRightWidth: 1, borderRightColor: '#555' },

  tablaFila: { flexDirection: 'row', borderWidth: 1, borderColor: BORDER, alignItems: 'center' },
  tablaTd: { fontSize: 13, color: '#555', paddingHorizontal: 14, paddingVertical: 12, minWidth: 110, borderRightWidth: 1, borderRightColor: BORDER },
  // Celda "No hay registros" que se expande como colspan en HTML
  tablaTdVacio: { fontSize: 13, color: '#555', paddingHorizontal: 14, paddingVertical: 14, flex: 1, minWidth: 200, borderRightWidth: 1, borderRightColor: BORDER },

  // Columna de acciones dentro de la fila — botones más pequeños
  tablaTdAcciones: { minWidth: 90, paddingHorizontal: 6, paddingVertical: 6, gap: 4, justifyContent: 'center', alignItems: 'center' },
  btnAccion: { backgroundColor: ACCENT, borderRadius: 3, paddingHorizontal: 7, paddingVertical: 4, marginBottom: 3, alignItems: 'center', width: 76 },
  btnAccionTexto: { color: '#fff', fontSize: 10, fontWeight: '600' },

  // Botones de crear/reporte debajo de la tabla
  botonesSeccion: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  btnSeccion: { backgroundColor: DARK, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 10 },
  btnSeccionTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },

  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff', paddingBottom: 8 },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 8, gap: 2 },
  tabLabel: { fontSize: 9, color: '#999', textAlign: 'center' },
});