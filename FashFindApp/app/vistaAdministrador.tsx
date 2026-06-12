import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const { width } = Dimensions.get('window');

const ACCENT = '#e91e8c';
const DARK = '#3A3A3A';
const BORDER = '#9A9A9A';
const SIDEBAR_WIDTH = 220;

const ES_WEB_ESCRITORIO = Platform.OS === 'web' && width >= 768;

const API_BASE = Platform.OS === 'web' ? 'http://localhost/FashFind/api' : 'http://172.30.3.163/FashFind/api';

const mostrarAlerta = (titulo: string, mensaje: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    onOk?.();
  } else {
    Alert.alert(titulo, mensaje, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
};

type Seccion = 'pagina_principal' | 'usuario' | 'venta' | 'pedido' | 'producto' | 'inventario';

const columnasPorSeccion: Record<Seccion, string[]> = {
  pagina_principal: [],
  usuario: ['Id Usuario', 'CC', 'Nombre Usuario', 'Contraseña', 'Nombres', 'Apellidos', 'Teléfono', 'Correo', 'Dirección', 'Género', 'Fecha Nacimiento', 'Fecha Registro', 'Cargo', 'Estado', 'Acciones'],
  venta: [],
  pedido: [],
  producto: ['Id Producto', 'Imagen', 'Nombre Producto', 'Descripción', 'Categoría', 'Talla', 'Color', 'Precio', 'Estado', 'Acciones'],
  inventario: ['Id Inventario', 'Stock Disponible', 'Stock Mínimo', 'Id Producto', 'Acciones'],
};

const accionesPorSeccion: Record<Seccion, { label: string; ruta: string }[]> = {
  pagina_principal: [],
  usuario: [{ label: 'Crear Nuevo Usuario', ruta: '/form_registros/registroUsuarios' }],
  venta: [
    { label: 'Crear Nueva Venta', ruta: '/form_registros/registroVentas' },
    { label: 'Reporte de Ventas', ruta: '/form_actualizaciones/reporteVentas' },
  ],
  pedido: [
    { label: 'Crear Nuevo Pedido', ruta: '/form_registros/registroPedidos' },
    { label: 'Reporte de Pedidos', ruta: '/form_actualizaciones/reportePedidos' },
  ],
  producto: [
    { label: 'Crear Nuevo Producto', ruta: '/form_registros/registroProductos' },
  ],
  inventario: [
    { label: 'Crear Nuevo Inventario', ruta: '/form_registros/registroInventario' },
    { label: 'Reporte de Inventario', ruta: '/form_actualizaciones/reporteInventario' },
  ],
};

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
  const [refreshing, setRefreshing] = useState(false);
  const buscadorRef = useRef<TextInput>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Filtros ventas
  const [filtroVentaEstado,     setFiltroVentaEstado]     = useState('');
  const [filtroVentaMetodo,     setFiltroVentaMetodo]     = useState('');
  const [filtroVentaFechaDesde, setFiltroVentaFechaDesde] = useState('');
  const [filtroVentaFechaHasta, setFiltroVentaFechaHasta] = useState('');

  // Filtros pedidos
  const [filtroPedidoEstado,      setFiltroPedidoEstado]      = useState('');
  const [filtroPedidoTipoEntrega, setFiltroPedidoTipoEntrega] = useState('');
  const [filtroPedidoCiudad,      setFiltroPedidoCiudad]      = useState('');
  const [filtroPedidoFechaDesde,  setFiltroPedidoFechaDesde]  = useState('');
  const [filtroPedidoFechaHasta,  setFiltroPedidoFechaHasta]  = useState('');

  // Filtros productos
  const [filtroProductoCategoria, setFiltroProductoCategoria] = useState('');
  const [filtroProductoColor,     setFiltroProductoColor]     = useState('');
  const [filtroProductoTalla,     setFiltroProductoTalla]     = useState('');
  const [filtroProductoEstado,    setFiltroProductoEstado]    = useState('');

  const [usuarios, setUsuarios]               = useState<any[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);

  const [ventas, setVentas]             = useState<any[]>([]);
  const [cargandoVentas, setCargandoVentas] = useState(false);

  const [pedidos, setPedidos]             = useState<any[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);

  const [productos, setProductos]             = useState<any[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);

  const [inventarios, setInventarios]             = useState<any[]>([]);
  const [cargandoInventarios, setCargandoInventarios] = useState(false);

  const [estadisticas, setEstadisticas] = useState<any>({
    usuarios_activos: 0,
    usuarios_inactivos: 0,
    clientes_registrados: 0,
    clientes_inactivos: 0,
    ventas_quincenales: 0,
    pedidos_por_entregar: 0,
    pedidos_entregados: 0,
    productos_activos: 0,
  });

  // ── Cargar Usuarios ──
  const cargarUsuarios = useCallback(async (mostrarCarga = true) => {
    try {
      if (mostrarCarga) setCargandoUsuarios(true);
      const res = await fetch(`${API_BASE}/usuarios.php`);
      const json = await res.json();
      if (json.success) {
        setUsuarios(json.data ?? []);
      } else {
        mostrarAlerta('Error', json.mensaje ?? 'No se pudieron cargar los usuarios.');
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      mostrarAlerta('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      if (mostrarCarga) setCargandoUsuarios(false);
      setRefreshing(false);
    }
  }, []);

  const cargarVentas = useCallback(async (mostrarCarga = true) => {
    try {
      if (mostrarCarga) setCargandoVentas(true);
      const res = await fetch(`${API_BASE}/ventas.php`);
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
  }, []);

  const cargarPedidos = useCallback(async (mostrarCarga = true) => {
    try {
      if (mostrarCarga) setCargandoPedidos(true);
      const res = await fetch(`${API_BASE}/pedidos.php`);
      const json = await res.json();
      if (json.success) {
        setPedidos(json.data ?? []);
      } else {
        Alert.alert('Error', json.mensaje ?? 'No se pudieron cargar los pedidos.');
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      if (mostrarCarga) setCargandoPedidos(false);
      setRefreshing(false);
    }
  }, []);

  const cargarProductos = useCallback(async (mostrarCarga = true) => {
    try {
      if (mostrarCarga) setCargandoProductos(true);
      const res = await fetch(`${API_BASE}/productos.php`);
      const json = await res.json();
      if (json.success) {
        setProductos(json.data ?? []);
      } else {
        mostrarAlerta('Error', json.mensaje ?? 'No se pudieron cargar los productos.');
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      mostrarAlerta('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      if (mostrarCarga) setCargandoProductos(false);
      setRefreshing(false);
    }
  }, []);

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

  const cargarEstadisticas = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/estadisticas.php`);
      const json = await res.json();
      if (json.success) {
        setEstadisticas(json.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (seccionActiva === 'usuario') {
        cargarUsuarios();
      } else if (seccionActiva === 'venta') {
        cargarVentas();
      } else if (seccionActiva === 'pedido') {
        cargarPedidos();
      } else if (seccionActiva === 'producto') {
        cargarProductos();
      } else if (seccionActiva === 'inventario') {
        cargarInventarios();
      } else if (seccionActiva === 'pagina_principal') {
        cargarEstadisticas();
      }
    }, [seccionActiva, cargarUsuarios, cargarVentas, cargarPedidos, cargarProductos, cargarInventarios, cargarEstadisticas])
  );

  useEffect(() => {
    if (seccionActiva === 'usuario') {
      cargarUsuarios();
    } else if (seccionActiva === 'venta') {
      cargarVentas();
    } else if (seccionActiva === 'pedido') {
      cargarPedidos();
    } else if (seccionActiva === 'producto') {
      cargarProductos();
    } else if (seccionActiva === 'inventario') {
      cargarInventarios();
    }
  }, [seccionActiva, cargarUsuarios, cargarVentas, cargarPedidos, cargarProductos, cargarInventarios]);

  // ── Filtros ──
  const usuariosFiltrados = usuarios.filter(u => {
    const q = busqueda.trim().toLowerCase();
    if (q && !(
      (u.id_usuario && String(u.id_usuario).includes(q)) ||
      (u.nombres && String(u.nombres).toLowerCase().includes(q)) ||
      (u.apellidos && String(u.apellidos).toLowerCase().includes(q)) ||
      (u.cargo && String(u.cargo).toLowerCase().includes(q)) ||
      (u.estado && String(u.estado).toLowerCase().includes(q))
    )) return false;
    return true;
  });

  const ventasFiltradas = ventas.filter(v => {
    const q = busqueda.trim().toLowerCase();
    if (q && !(
      (v.id_venta && String(v.id_venta).includes(q)) ||
      (v.fecha_venta && String(v.fecha_venta).toLowerCase().includes(q)) ||
      (v.hora && String(v.hora).toLowerCase().includes(q)) ||
      (v.metodo_pago && String(v.metodo_pago).toLowerCase().includes(q)) ||
      (v.estado && String(v.estado).toLowerCase().includes(q)) ||
      (v.nombres && String(v.nombres).toLowerCase().includes(q)) ||
      (v.apellidos && String(v.apellidos).toLowerCase().includes(q)) ||
      (v.costo_total && String(v.costo_total).includes(q))
    )) return false;
    if (filtroVentaEstado  && v.estado      !== filtroVentaEstado)  return false;
    if (filtroVentaMetodo  && v.metodo_pago !== filtroVentaMetodo)  return false;
    if (filtroVentaFechaDesde && v.fecha_venta < filtroVentaFechaDesde) return false;
    if (filtroVentaFechaHasta && v.fecha_venta > filtroVentaFechaHasta) return false;
    return true;
  });

  const pedidosFiltrados = pedidos.filter(p => {
    const q = busqueda.trim().toLowerCase();
    if (q && !(
      (p.id_pedido && String(p.id_pedido).includes(q)) ||
      (p.fecha_pedido && String(p.fecha_pedido).toLowerCase().includes(q)) ||
      (p.hora_pedido && String(p.hora_pedido).toLowerCase().includes(q)) ||
      (p.metodo_pago && String(p.metodo_pago).toLowerCase().includes(q)) ||
      (p.estado && String(p.estado).toLowerCase().includes(q)) ||
      (p.tipo_entrega && String(p.tipo_entrega).toLowerCase().includes(q)) ||
      (p.ciudad_entrega && String(p.ciudad_entrega).toLowerCase().includes(q)) ||
      (p.direccion_entrega && String(p.direccion_entrega).toLowerCase().includes(q)) ||
      (p.nombres && String(p.nombres).toLowerCase().includes(q)) ||
      (p.apellidos && String(p.apellidos).toLowerCase().includes(q)) ||
      (p.telefono_contacto && String(p.telefono_contacto).toLowerCase().includes(q)) ||
      (p.total_pedido && String(p.total_pedido).includes(q))
    )) return false;
    if (filtroPedidoEstado      && p.estado       !== filtroPedidoEstado)      return false;
    if (filtroPedidoTipoEntrega && p.tipo_entrega !== filtroPedidoTipoEntrega) return false;
    if (filtroPedidoCiudad      && !String(p.ciudad_entrega ?? '').toLowerCase().includes(filtroPedidoCiudad.toLowerCase())) return false;
    if (filtroPedidoFechaDesde  && p.fecha_pedido < filtroPedidoFechaDesde)    return false;
    if (filtroPedidoFechaHasta  && p.fecha_pedido > filtroPedidoFechaHasta)    return false;
    return true;
  });

  const productosFiltrados = productos.filter(prod => {
    const q = busqueda.trim().toLowerCase();
    if (q && !(
      (prod.id_producto && String(prod.id_producto).includes(q)) ||
      (prod.nombre_producto && String(prod.nombre_producto).toLowerCase().includes(q)) ||
      (prod.descripcion && String(prod.descripcion).toLowerCase().includes(q)) ||
      (prod.categoria && String(prod.categoria).toLowerCase().includes(q)) ||
      (prod.talla && String(prod.talla).toLowerCase().includes(q)) ||
      (prod.color && String(prod.color).toLowerCase().includes(q)) ||
      (prod.precio && String(prod.precio).includes(q)) ||
      (prod.estado && String(prod.estado).toLowerCase().includes(q))
    )) return false;
    if (filtroProductoCategoria && prod.categoria !== filtroProductoCategoria) return false;
    if (filtroProductoTalla     && prod.talla     !== filtroProductoTalla)     return false;
    if (filtroProductoColor     && !String(prod.color ?? '').toLowerCase().includes(filtroProductoColor.toLowerCase())) return false;
    if (filtroProductoEstado    && prod.estado    !== filtroProductoEstado)    return false;
    return true;
  });

  const inventariosFiltrados = inventarios.filter(inv => {
    const q = busqueda.trim().toLowerCase();
    if (q && !(
      (inv.id_inventario && String(inv.id_inventario).includes(q)) ||
      (inv.stock_disponible && String(inv.stock_disponible).includes(q)) ||
      (inv.stock_minimo && String(inv.stock_minimo).includes(q)) ||
      (inv.id_producto && String(inv.id_producto).includes(q)) ||
      (inv.nombre_producto && String(inv.nombre_producto).toLowerCase().includes(q))
    )) return false;
    return true;
  }).sort((a, b) => b.id_inventario - a.id_inventario);

  const limpiarFiltrosSeccion = () => {
    setFiltroVentaEstado(''); setFiltroVentaMetodo('');
    setFiltroVentaFechaDesde(''); setFiltroVentaFechaHasta('');
    setFiltroPedidoEstado(''); setFiltroPedidoTipoEntrega('');
    setFiltroPedidoCiudad(''); setFiltroPedidoFechaDesde(''); setFiltroPedidoFechaHasta('');
    setFiltroProductoCategoria(''); setFiltroProductoColor('');
    setFiltroProductoTalla(''); setFiltroProductoEstado('');
  };

  const hayFiltrosActivos = (): boolean => {
    if (seccionActiva === 'venta')
      return !!(filtroVentaEstado || filtroVentaMetodo || filtroVentaFechaDesde || filtroVentaFechaHasta);
    if (seccionActiva === 'pedido')
      return !!(filtroPedidoEstado || filtroPedidoTipoEntrega || filtroPedidoCiudad || filtroPedidoFechaDesde || filtroPedidoFechaHasta);
    if (seccionActiva === 'producto')
      return !!(filtroProductoCategoria || filtroProductoColor || filtroProductoTalla || filtroProductoEstado);
    return false;
  };

  const Chip = ({ label, activo, onPress }: { label: string; activo: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
        borderWidth: 1, borderColor: activo ? ACCENT : '#ccc',
        backgroundColor: activo ? ACCENT : '#f5f5f5', marginRight: 6, marginBottom: 6,
      }}
    >
      <Text style={{ fontSize: 12, color: activo ? '#fff' : '#555', fontWeight: activo ? '700' : '400' }}>{label}</Text>
    </TouchableOpacity>
  );

  // ── Acciones de fila ──
  const accionFilaUsuario = async (btn: string, usuario: any) => {
    if (btn === 'Actualizar') {
      router.push({ pathname: '/form_actualizaciones/editarUsuario', params: { id: String(usuario.id_usuario) } } as any);
      return;
    }
    const esEliminar  = btn === 'Eliminar';
    const esReactivar = btn === 'Reactivar';
    if (!esEliminar && !esReactivar) return;
    const accion  = esEliminar ? 'eliminar' : 'reactivar';
    const mensaje = esEliminar
      ? `¿Desactivar al usuario ${usuario.nombres} ${usuario.apellidos}?`
      : `¿Reactivar al usuario ${usuario.nombres} ${usuario.apellidos}?`;

    const confirmar = Platform.OS === 'web'
      ? window.confirm(mensaje)
      : await new Promise<boolean>((resolve) =>
          Alert.alert('Confirmar', mensaje, [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Confirmar', onPress: () => resolve(true) },
          ])
        );

    if (!confirmar) return;

    try {
      const res  = await fetch(`${API_BASE}/usuarios.php?id=${usuario.id_usuario}&action=${accion}`, { method: 'PUT' });
      const json = await res.json();
      if (json.success) {
        mostrarAlerta('Éxito', json.mensaje);
        await cargarUsuarios(false);
      } else {
        mostrarAlerta('Error', json.mensaje ?? 'No se pudo completar la acción.');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarAlerta('Error de conexión', 'No se pudo conectar con el servidor.');
    }
  };

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

    const confirmar = Platform.OS === 'web'
      ? window.confirm(mensaje)
      : await new Promise<boolean>((resolve) =>
          Alert.alert('Confirmar', mensaje, [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Confirmar', onPress: () => resolve(true) },
          ])
        );

    if (!confirmar) return;

    try {
      const res  = await fetch(`${API_BASE}/ventas.php?id=${venta.id_venta}&action=${accion}`, { method: 'PUT' });
      const json = await res.json();
      if (json.success) {
        mostrarAlerta('Éxito', json.mensaje);
        await cargarVentas(false);
      } else {
        mostrarAlerta('Error', json.mensaje ?? 'No se pudo completar la acción.');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarAlerta('Error de conexión', 'No se pudo conectar con el servidor.');
    }
  };

  const accionFilaPedido = async (btn: string, pedido: any) => {
    if (btn === 'Actualizar') {
      router.push({ pathname: '/form_actualizaciones/editarPedidos', params: { id: String(pedido.id_pedido) } } as any);
      return;
    }
    const esCancelar  = btn === 'Cancelar';
    const esReactivar = btn === 'Reactivar';
    if (!esCancelar && !esReactivar) return;
    const accion  = esCancelar ? 'cancelar' : 'reactivar';
    const mensaje = esCancelar
      ? `¿Cancelar el pedido #${pedido.id_pedido}?`
      : `¿Reactivar el pedido #${pedido.id_pedido}?`;

    const confirmar = Platform.OS === 'web'
      ? window.confirm(mensaje)
      : await new Promise<boolean>((resolve) =>
          Alert.alert('Confirmar', mensaje, [
            { text: 'No', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Sí', onPress: () => resolve(true) },
          ])
        );

    if (!confirmar) return;

    try {
      const res  = await fetch(`${API_BASE}/pedidos.php?id=${pedido.id_pedido}&action=${accion}`, { method: 'PUT' });
      const json = await res.json();
      if (json.success) {
        Platform.OS === 'web' ? window.alert(json.mensaje) : Alert.alert('Éxito', json.mensaje);
        await cargarPedidos();
      } else {
        Platform.OS === 'web' ? window.alert(json.mensaje) : Alert.alert('Error', json.mensaje);
      }
    } catch (error) {
      console.error(error);
      Platform.OS === 'web'
        ? window.alert('No se pudo conectar con el servidor')
        : Alert.alert('Error', 'No se pudo conectar con el servidor');
    }
  };

  const accionFilaProducto = async (btn: string, producto: any) => {
    if (btn === 'Actualizar') {
      router.push({ pathname: '/form_actualizaciones/editarProductos', params: { id: String(producto.id_producto) } } as any);
      return;
    }
    const esEliminar  = btn === 'Eliminar';
    const esReactivar = btn === 'Reactivar';
    if (!esEliminar && !esReactivar) return;
    const accion  = esEliminar ? 'eliminar' : 'reactivar';
    const mensaje = esEliminar
      ? `¿Desactivar el producto #${producto.id_producto}?`
      : `¿Reactivar el producto #${producto.id_producto}?`;

    const confirmar = Platform.OS === 'web'
      ? window.confirm(mensaje)
      : await new Promise<boolean>((resolve) =>
          Alert.alert('Confirmar', mensaje, [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Confirmar', onPress: () => resolve(true) },
          ])
        );

    if (!confirmar) return;

    try {
      const res  = await fetch(`${API_BASE}/productos.php?id=${producto.id_producto}&action=${accion}`, { method: 'PUT' });
      const json = await res.json();
      if (json.success) {
        mostrarAlerta('Éxito', json.mensaje);
        await cargarProductos(false);
      } else {
        mostrarAlerta('Error', json.mensaje ?? 'No se pudo completar la acción.');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarAlerta('Error de conexión', 'No se pudo conectar con el servidor.');
    }
  };

  const accionFilaInventario = async (btn: string, inventario: any) => {
    if (btn === 'Actualizar') {
      router.push({ pathname: '/form_actualizaciones/editarInventario', params: { id: String(inventario.id_inventario) } } as any);
    }
  };

  const limpiarBusqueda = () => { setBusqueda(''); setMostrarFiltros(false); limpiarFiltrosSeccion(); };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (seccionActiva === 'usuario') {
      cargarUsuarios(false);
    } else if (seccionActiva === 'venta') {
      cargarVentas(false);
    } else if (seccionActiva === 'pedido') {
      cargarPedidos(false);
    } else if (seccionActiva === 'producto') {
      cargarProductos(false);
    } else if (seccionActiva === 'inventario') {
      cargarInventarios(false);
    } else {
      setRefreshing(false);
    }
  }, [seccionActiva, cargarUsuarios, cargarVentas, cargarPedidos, cargarProductos, cargarInventarios]);

  const menuItems: { id: Seccion; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'pagina_principal', label: 'Página Principal', icon: 'home-outline' },
    { id: 'usuario',          label: 'Gestión de Usuarios',   icon: 'people-outline' },
    { id: 'venta',            label: 'Gestión de Ventas',     icon: 'cash-outline' },
    { id: 'pedido',           label: 'Gestión de Pedidos',    icon: 'cart-outline' },
    { id: 'producto',         label: 'Gestión de Productos',  icon: 'shirt-outline' },
    { id: 'inventario',       label: 'Gestión de Inventario', icon: 'layers-outline' },
  ];

  const cajas = [
    { titulo: 'Usuarios Activos',      valor: String(estadisticas.usuarios_activos) },
    { titulo: 'Usuarios Inactivos',    valor: String(estadisticas.usuarios_inactivos) },
    { titulo: 'Clientes Registrados',  valor: String(estadisticas.clientes_registrados) },
    { titulo: 'Clientes Inactivos',    valor: String(estadisticas.clientes_inactivos) },
    { titulo: 'Ventas Quincenales',    valor: `$${Number(estadisticas.ventas_quincenales).toLocaleString('es-CO')}` },
    { titulo: 'Pedidos Por Entregar',  valor: String(estadisticas.pedidos_por_entregar) },
    { titulo: 'Pedidos Entregados',    valor: String(estadisticas.pedidos_entregados) },
    { titulo: 'Productos Activos',     valor: String(estadisticas.productos_activos) },
  ];

  const BarraLateral = ({ onClose }: { onClose?: () => void }) => (
    <View style={styles.barra}>
      <Text style={styles.barraTitle}>Administrador</Text>
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
      <TouchableOpacity style={styles.barraCerrar} onPress={() => router.replace('/login')}>
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
          Bienvenido, Administrador
        </Text>
        <TouchableOpacity style={styles.btnRosa} onPress={() => router.replace('/login')}>
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
        {/* Buscador con filtros avanzados (ventas / pedidos / productos / inventario) */}
        {(seccionActiva === 'venta' || seccionActiva === 'pedido' || seccionActiva === 'producto' || seccionActiva === 'inventario') && (
          <View style={{ marginBottom: 4 }}>
            <View style={styles.buscador}>
              <Ionicons name="search-outline" size={20} color="#999" style={styles.buscadorIcon} />
              <TextInput
                ref={buscadorRef}
                style={styles.buscadorInput}
                placeholder="Buscar por ID, fecha, estado, cliente..."
                placeholderTextColor="#999"
                onChangeText={setBusqueda}
                value={busqueda}
                autoCorrect={false}
                autoCapitalize="none"
                autoComplete="off"
                editable={true}
              />
              <TouchableOpacity
                onPress={() => setMostrarFiltros(!mostrarFiltros)}
                style={[styles.buscadorFiltroBtn, (mostrarFiltros || hayFiltrosActivos()) && styles.buscadorFiltroBtnActivo]}
              >
                <Ionicons name="options-outline" size={20} color={(mostrarFiltros || hayFiltrosActivos()) ? '#fff' : '#666'} />
                {hayFiltrosActivos() && <View style={styles.filtroIndicador} />}
              </TouchableOpacity>
              {(busqueda !== '' || hayFiltrosActivos()) && (
                <TouchableOpacity onPress={limpiarBusqueda} style={styles.buscadorLimpiar}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Panel filtros avanzados */}
            {mostrarFiltros && (
              <View style={styles.panelFiltros}>

                {/* Ventas */}
                {seccionActiva === 'venta' && (
                  <>
                    <Text style={styles.filtroGrupoTitulo}>Estado</Text>
                    <View style={styles.chipsRow}>
                      {['', 'Activo', 'Inactivo'].map(v => (
                        <Chip key={v} label={v || 'Todos'} activo={filtroVentaEstado === v} onPress={() => setFiltroVentaEstado(v)} />
                      ))}
                    </View>
                    <Text style={styles.filtroGrupoTitulo}>Método de pago</Text>
                    <View style={styles.chipsRow}>
                      {['', 'Efectivo', 'Transferencia'].map(v => (
                        <Chip key={v} label={v || 'Todos'} activo={filtroVentaMetodo === v} onPress={() => setFiltroVentaMetodo(v)} />
                      ))}
                    </View>
                    <Text style={styles.filtroGrupoTitulo}>Rango de fecha</Text>
                    <View style={styles.rangoFechaRow}>
                      <View style={styles.rangoFechaItem}>
                        <Text style={styles.rangoFechaLabel}>Desde</Text>
                        <TextInput style={styles.rangoFechaInput} {...(Platform.OS === 'web' ? { type: 'date' } : {})} onFocus={(e) => Platform.OS === 'web' && (e.target.type = 'date')} onBlur={(e) => Platform.OS === 'web' && !e.target.value && (e.target.type = 'text')} placeholder="AAAA-MM-DD" placeholderTextColor="#bbb" value={filtroVentaFechaDesde} onChangeText={setFiltroVentaFechaDesde} />
                      </View>
                      <Text style={styles.rangoFechaSep}>—</Text>
                      <View style={styles.rangoFechaItem}>
                        <Text style={styles.rangoFechaLabel}>Hasta</Text>
                        <TextInput style={styles.rangoFechaInput} {...(Platform.OS === 'web' ? { type: 'date' } : {})} onFocus={(e) => Platform.OS === 'web' && (e.target.type = 'date')} onBlur={(e) => Platform.OS === 'web' && !e.target.value && (e.target.type = 'text')} placeholder="AAAA-MM-DD" placeholderTextColor="#bbb" value={filtroVentaFechaHasta} onChangeText={setFiltroVentaFechaHasta} />
                      </View>
                    </View>
                  </>
                )}

                {/* Pedidos */}
                {seccionActiva === 'pedido' && (
                  <>
                    <Text style={styles.filtroGrupoTitulo}>Estado</Text>
                    <View style={styles.chipsRow}>
                      {['', 'Por Entregar', 'Entregado', 'Cancelado'].map(v => (
                        <Chip key={v} label={v || 'Todos'} activo={filtroPedidoEstado === v} onPress={() => setFiltroPedidoEstado(v)} />
                      ))}
                    </View>
                    <Text style={styles.filtroGrupoTitulo}>Tipo de entrega</Text>
                    <View style={styles.chipsRow}>
                      {['', 'Domicilio', 'Recogida en tienda'].map(v => (
                        <Chip key={v} label={v || 'Todos'} activo={filtroPedidoTipoEntrega === v} onPress={() => setFiltroPedidoTipoEntrega(v)} />
                      ))}
                    </View>
                    <Text style={styles.filtroGrupoTitulo}>Ciudad</Text>
                    <TextInput style={styles.filtroInput} placeholder="Ej: Bogotá, Medellín…" placeholderTextColor="#bbb" value={filtroPedidoCiudad} onChangeText={setFiltroPedidoCiudad} autoCapitalize="words" />
                    <Text style={styles.filtroGrupoTitulo}>Rango de fecha</Text>
                    <View style={styles.rangoFechaRow}>
                      <View style={styles.rangoFechaItem}>
                        <Text style={styles.rangoFechaLabel}>Desde</Text>
                        <TextInput style={styles.rangoFechaInput} {...(Platform.OS === 'web' ? { type: 'date' } : {})} onFocus={(e) => Platform.OS === 'web' && (e.target.type = 'date')} onBlur={(e) => Platform.OS === 'web' && !e.target.value && (e.target.type = 'text')} placeholder="AAAA-MM-DD" placeholderTextColor="#bbb" value={filtroPedidoFechaDesde} onChangeText={setFiltroPedidoFechaDesde} />
                      </View>
                      <Text style={styles.rangoFechaSep}>—</Text>
                      <View style={styles.rangoFechaItem}>
                        <Text style={styles.rangoFechaLabel}>Hasta</Text>
                        <TextInput style={styles.rangoFechaInput} {...(Platform.OS === 'web' ? { type: 'date' } : {})} onFocus={(e) => Platform.OS === 'web' && (e.target.type = 'date')} onBlur={(e) => Platform.OS === 'web' && !e.target.value && (e.target.type = 'text')} placeholder="AAAA-MM-DD" placeholderTextColor="#bbb" value={filtroPedidoFechaHasta} onChangeText={setFiltroPedidoFechaHasta} />
                      </View>
                    </View>
                  </>
                )}

                {/* Productos */}
                {seccionActiva === 'producto' && (
                  <>
                    <Text style={styles.filtroGrupoTitulo}>Categoría</Text>
                    <View style={styles.chipsRow}>
                      {['', 'Camisas', 'Pantalones', 'Chaquetas', 'Camisetas', 'Vestidos', 'Sudaderas', 'Shorts', 'Blusas', 'Faldas'].map(v => (
                        <Chip key={v} label={v || 'Todas'} activo={filtroProductoCategoria === v} onPress={() => setFiltroProductoCategoria(v)} />
                      ))}
                    </View>
                    <Text style={styles.filtroGrupoTitulo}>Talla</Text>
                    <View style={styles.chipsRow}>
                      {['', 'XS', 'S', 'M', 'L', 'XL', '6', '8', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44'].map(v => (
                        <Chip key={v} label={v || 'Todas'} activo={filtroProductoTalla === v} onPress={() => setFiltroProductoTalla(v)} />
                      ))}
                    </View>
                    <Text style={styles.filtroGrupoTitulo}>Estado</Text>
                    <View style={styles.chipsRow}>
                      {['', 'Activo', 'Inactivo'].map(v => (
                        <Chip key={v} label={v || 'Todos'} activo={filtroProductoEstado === v} onPress={() => setFiltroProductoEstado(v)} />
                      ))}
                    </View>
                    <Text style={styles.filtroGrupoTitulo}>Color</Text>
                    <TextInput style={styles.filtroInput} placeholder="Ej: Rojo, Azul, Negro…" placeholderTextColor="#bbb" value={filtroProductoColor} onChangeText={setFiltroProductoColor} autoCapitalize="words" />
                  </>
                )}

                <TouchableOpacity onPress={limpiarFiltrosSeccion} style={styles.btnLimpiarFiltros}>
                  <Text style={styles.btnLimpiarFiltrosTxt}>Limpiar filtros</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Buscador simple para usuario */}
        {seccionActiva === 'usuario' && (
          <View style={styles.buscador}>
            <Ionicons name="search-outline" size={20} color="#999" style={styles.buscadorIcon} />
            <TextInput
              style={styles.buscadorInput}
              placeholder="Buscar por nombre, cargo, estado..."
              placeholderTextColor="#999"
              onChangeText={setBusqueda}
              value={busqueda}
              autoCorrect={false}
              autoCapitalize="none"
              editable={true}
            />
            {busqueda !== '' && (
              <TouchableOpacity onPress={() => setBusqueda('')} style={styles.buscadorLimpiar}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Resultados encontrados */}
        {(busqueda !== '' || hayFiltrosActivos()) && (
          <Text style={styles.resultadoBusqueda}>
            {seccionActiva === 'usuario'
              ? `🔍 ${usuariosFiltrados.length} resultado(s) encontrado(s)`
              : seccionActiva === 'venta'
              ? `🔍 ${ventasFiltradas.length} resultado(s) encontrado(s)`
              : seccionActiva === 'pedido'
              ? `🔍 ${pedidosFiltrados.length} resultado(s) encontrado(s)`
              : seccionActiva === 'producto'
              ? `🔍 ${productosFiltrados.length} resultado(s) encontrado(s)`
              : `🔍 Resultados para "${busqueda}"`
            }
          </Text>
        )}

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

        {/* Secciones */}
        {seccionActiva !== 'pagina_principal' && (
          <View>
            <View style={styles.headerSeccionConAcciones}>
              <Text style={styles.seccionTitulo}>
                {menuItems.find(m => m.id === seccionActiva)?.label}
              </Text>
              <View style={styles.botonesSeccionSuperior}>
                {accionesPorSeccion[seccionActiva].map((accion, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.btnSeccionSuperior}
                    onPress={() => router.push(accion.ruta as any)}
                  >
                    <Text style={styles.btnSeccionTexto}>{accion.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ── Tarjetas de Usuarios ── */}
            {seccionActiva === 'usuario' && (
              <View>
                {cargandoUsuarios ? (
                  <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={ACCENT} />
                    <Text style={{ color: '#888', marginTop: 8 }}>Cargando usuarios...</Text>
                  </View>
                ) : usuariosFiltrados.length === 0 ? (
                  <Text style={{ color: '#888', padding: 16 }}>
                    {busqueda ? 'No hay usuarios que coincidan con tu búsqueda.' : 'No hay usuarios registrados.'}
                  </Text>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <View key={u.id_usuario} style={styles.ventaCard}>
                      <View style={styles.ventaCardHeader}>
                        <Text style={styles.ventaCardId}>Usuario #{u.id_usuario}</Text>
                        <Text style={[styles.ventaCardEstado, {
                          backgroundColor: u.estado === 'Activo' ? '#27ae60' : '#e74c3c',
                        }]}>{u.estado}</Text>
                      </View>
                      <View style={styles.ventaCardInfo}>
                        <Text style={styles.ventaCardTxt}>
                          <Text style={{ fontWeight: 'bold' }}>Nombre: </Text>
                          {u.nombres} {u.apellidos}
                        </Text>
                        <Text style={styles.ventaCardTxt}>
                          <Text style={{ fontWeight: 'bold' }}>Cargo: </Text>
                          {u.cargo}
                        </Text>
                      </View>
                      <View style={styles.ventaCardBtns}>
                        <TouchableOpacity style={styles.ventaBtn} onPress={() => accionFilaUsuario('Actualizar', u)}>
                          <Text style={styles.ventaBtnTxt}>Actualizar</Text>
                        </TouchableOpacity>
                        {u.estado === 'Activo' && (
                          <TouchableOpacity style={[styles.ventaBtn, { backgroundColor: '#e74c3c' }]} onPress={() => accionFilaUsuario('Eliminar', u)}>
                            <Text style={styles.ventaBtnTxt}>Eliminar</Text>
                          </TouchableOpacity>
                        )}
                        {u.estado === 'Inactivo' && (
                          <TouchableOpacity style={[styles.ventaBtn, { backgroundColor: '#27ae60' }]} onPress={() => accionFilaUsuario('Reactivar', u)}>
                            <Text style={styles.ventaBtnTxt}>Reactivar</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ── Tarjetas de Ventas ── */}
            {seccionActiva === 'venta' && (
              <View>
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
                        <Text style={styles.ventaCardTxt}> {v.fecha_venta}    {v.hora}</Text>
                        <Text style={styles.ventaCardTxt}> {v.metodo_pago}</Text>
                        <Text style={styles.ventaCardTxt}> {v.id_usuario} - {v.nombres} {v.apellidos}</Text>
                        <Text style={styles.ventaCardTxt}>
                           Total: ${Number(v.costo_total).toLocaleString('es-CO')}  |  Recibido: ${Number(v.pago_recibido).toLocaleString('es-CO')}  |  Cambio: ${Number(v.cambio).toLocaleString('es-CO')}
                        </Text>
                      </View>
                      <View style={styles.ventaCardBtns}>
                        <TouchableOpacity style={styles.ventaBtn} onPress={() => accionFila('Actualizar', v)}>
                          <Text style={styles.ventaBtnTxt}>Actualizar</Text>
                        </TouchableOpacity>
                        {v.estado === 'Activo' && (
                          <TouchableOpacity style={[styles.ventaBtn, { backgroundColor: '#e74c3c' }]} onPress={() => accionFila('Eliminar', v)}>
                            <Text style={styles.ventaBtnTxt}>Eliminar</Text>
                          </TouchableOpacity>
                        )}
                        {v.estado === 'Inactivo' && (
                          <TouchableOpacity style={[styles.ventaBtn, { backgroundColor: '#27ae60' }]} onPress={() => accionFila('Reactivar', v)}>
                            <Text style={styles.ventaBtnTxt}>Reactivar</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ── Tarjetas de Pedidos ── */}
            {seccionActiva === 'pedido' && (
              <View>
                {cargandoPedidos ? (
                  <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={ACCENT} />
                    <Text style={{ color: '#888', marginTop: 8 }}>Cargando pedidos...</Text>
                  </View>
                ) : pedidosFiltrados.length === 0 ? (
                  <Text style={{ color: '#888', padding: 16 }}>
                    {busqueda ? 'No hay pedidos que coincidan con tu búsqueda.' : 'No hay pedidos registrados.'}
                  </Text>
                ) : (
                  pedidosFiltrados.map((p) => (
                    <View key={p.id_pedido} style={styles.pedidoCard}>
                      <View style={styles.pedidoCardHeader}>
                        <Text style={styles.pedidoCardId}>Pedido #{p.id_pedido}</Text>
                        <Text style={[styles.pedidoCardEstado, {
                          backgroundColor: p.estado === 'Entregado' ? '#27ae60'
                                         : p.estado === 'Cancelado' ? '#e74c3c'
                                         : '#f39c12',
                        }]}>{p.estado}</Text>
                      </View>
                      <View style={styles.pedidoCardInfo}>
                        <Text style={styles.pedidoCardTxt}> {p.fecha_pedido}   {p.hora_pedido}</Text>
                        <Text style={styles.pedidoCardTxt}> {p.metodo_pago}  |   {p.tipo_entrega}</Text>
                        <Text style={styles.pedidoCardTxt}> {p.direccion_entrega}, {p.ciudad_entrega}</Text>
                        <Text style={styles.pedidoCardTxt}> {p.telefono_contacto}</Text>
                        <Text style={styles.pedidoCardTxt}> Entrega: {p.fecha_entrega || 'Pendiente'}</Text>
                        <Text style={styles.pedidoCardTxt}> {p.nombres} {p.apellidos}</Text>
                        <Text style={styles.pedidoCardTxt}> Total: ${Number(p.total_pedido).toLocaleString('es-CO')}  |  Envío: ${Number(p.costo_envio).toLocaleString('es-CO')}</Text>
                      </View>
                      <View style={styles.pedidoCardBtns}>
                        <TouchableOpacity style={styles.pedidoBtn} onPress={() => accionFilaPedido('Actualizar', p)}>
                          <Text style={styles.pedidoBtnTxt}>Actualizar</Text>
                        </TouchableOpacity>
                        {p.estado !== 'Cancelado' && p.estado !== 'Entregado' && (
                          <TouchableOpacity style={[styles.pedidoBtn, { backgroundColor: '#e74c3c' }]} onPress={() => accionFilaPedido('Cancelar', p)}>
                            <Text style={styles.pedidoBtnTxt}>Cancelar</Text>
                          </TouchableOpacity>
                        )}
                        {p.estado === 'Cancelado' && (
                          <TouchableOpacity style={[styles.pedidoBtn, { backgroundColor: '#27ae60' }]} onPress={() => accionFilaPedido('Reactivar', p)}>
                            <Text style={styles.pedidoBtnTxt}>Reactivar</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ── Tarjetas de Productos ── */}
            {seccionActiva === 'producto' && (
              <View>
                {cargandoProductos ? (
                  <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={ACCENT} />
                    <Text style={{ color: '#888', marginTop: 8 }}>Cargando productos...</Text>
                  </View>
                ) : productosFiltrados.length === 0 ? (
                  <Text style={{ color: '#888', padding: 16 }}>
                    {busqueda ? 'No hay productos que coincidan con tu búsqueda.' : 'No hay productos registrados.'}
                  </Text>
                ) : (
                  productosFiltrados.map((prod) => (
                    <View key={prod.id_producto} style={styles.ventaCard}>
                      <View style={styles.ventaCardHeader}>
                        <Text style={styles.ventaCardId}>Producto #{prod.id_producto}</Text>
                        <Text style={[styles.ventaCardEstado, {
                          backgroundColor: prod.estado === 'Activo' ? '#27ae60' : '#e74c3c',
                        }]}>{prod.estado}</Text>
                      </View>
                      <View style={styles.ventaCardInfo}>
                        <Text style={styles.ventaCardTxt}><Text style={{ fontWeight: 'bold' }}>Nombre:</Text> {prod.nombre_producto}</Text>
                        <Text style={styles.ventaCardTxt}><Text style={{ fontWeight: 'bold' }}>Descripción:</Text> {prod.descripcion || 'N/A'}</Text>
                        <Text style={styles.ventaCardTxt}><Text style={{ fontWeight: 'bold' }}>Categoría:</Text> {prod.categoria}</Text>
                        <Text style={styles.ventaCardTxt}><Text style={{ fontWeight: 'bold' }}>Talla:</Text> {prod.talla}  |  <Text style={{ fontWeight: 'bold' }}>Color:</Text> {prod.color}</Text>
                        <Text style={styles.ventaCardTxt}><Text style={{ fontWeight: 'bold' }}>Precio:</Text> ${Number(prod.precio).toLocaleString('es-CO')}</Text>
                      </View>
                      <View style={styles.ventaCardBtns}>
                        <TouchableOpacity style={styles.ventaBtn} onPress={() => accionFilaProducto('Actualizar', prod)}>
                          <Text style={styles.ventaBtnTxt}>Actualizar</Text>
                        </TouchableOpacity>
                        {prod.estado === 'Activo' && (
                          <TouchableOpacity style={[styles.ventaBtn, { backgroundColor: '#e74c3c' }]} onPress={() => accionFilaProducto('Eliminar', prod)}>
                            <Text style={styles.ventaBtnTxt}>Eliminar</Text>
                          </TouchableOpacity>
                        )}
                        {prod.estado === 'Inactivo' && (
                          <TouchableOpacity style={[styles.ventaBtn, { backgroundColor: '#27ae60' }]} onPress={() => accionFilaProducto('Reactivar', prod)}>
                            <Text style={styles.ventaBtnTxt}>Reactivar</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ── Tarjetas de Inventarios ── */}
            {seccionActiva === 'inventario' && (
              <View>
                {cargandoInventarios ? (
                  <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={ACCENT} />
                    <Text style={{ color: '#888', marginTop: 8 }}>Cargando inventarios...</Text>
                  </View>
                ) : inventariosFiltrados.length === 0 ? (
                  <Text style={{ color: '#888', padding: 16 }}>
                    {busqueda ? 'No hay inventarios que coincidan con tu búsqueda.' : 'No hay inventarios registrados.'}
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
                      <View style={styles.ventaCardBtns}>
                        <TouchableOpacity style={styles.ventaBtn} onPress={() => accionFilaInventario('Actualizar', inv)}>
                          <Text style={styles.ventaBtnTxt}>Actualizar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Otras secciones (tabla genérica — ya no aplica a usuario) */}
            {seccionActiva !== 'usuario' && seccionActiva !== 'venta' && seccionActiva !== 'pedido' && seccionActiva !== 'producto' && seccionActiva !== 'inventario' && seccionActiva !== 'pagina_principal' && (
              <ScrollView horizontal={!ES_WEB_ESCRITORIO} showsHorizontalScrollIndicator={!ES_WEB_ESCRITORIO}>
                <View style={ES_WEB_ESCRITORIO ? { width: '100%' } : {}}>
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
          </View>
        )}
      </ScrollView>

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
  barraCerrar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: '#555', marginTop: 10 },

  contenidoPrincipal: { flex: 1, width: '100%' },
  barraSuperior: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: DARK, paddingHorizontal: 16, paddingVertical: 14 },
  barraSuperiorTitulo: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1, marginLeft: 12 },

  btnRosa: { backgroundColor: ACCENT, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 5 },
  btnRosaTexto: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },

  buscador: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fff', marginBottom: 8, paddingHorizontal: 12 },
  buscadorIcon: { marginRight: 8 },
  buscadorInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#333', outline: 'none' },
  buscadorLimpiar: { padding: 4 },
  buscadorFiltroBtn: { padding: 6, borderRadius: 6, marginLeft: 4, backgroundColor: '#f0f0f0' },
  buscadorFiltroBtnActivo: { backgroundColor: ACCENT },
  filtroIndicador: { position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff', borderWidth: 1, borderColor: ACCENT },
  panelFiltros: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#eee', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  filtroGrupoTitulo: { fontSize: 12, fontWeight: '700', color: DARK, marginTop: 10, marginBottom: 6 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  rangoFechaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rangoFechaItem: { flex: 1 },
  rangoFechaLabel: { fontSize: 11, color: '#888', marginBottom: 3 },
  rangoFechaInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 7, fontSize: 12, color: '#333', backgroundColor: '#fafafa' },
  rangoFechaSep: { fontSize: 16, color: '#bbb', marginTop: 14 },
  filtroInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#333', backgroundColor: '#fafafa' },
  btnLimpiarFiltros: { marginTop: 12, alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6, borderWidth: 1, borderColor: ACCENT },
  btnLimpiarFiltrosTxt: { fontSize: 12, color: ACCENT, fontWeight: '600' },
  resultadoBusqueda: { fontSize: 12, color: '#666', marginBottom: 12, marginTop: 0, fontStyle: 'italic' },

  seccionCajas: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  caja: { width: (width - 44) / 2, backgroundColor: '#fff', borderRadius: 8, padding: 16, borderTopWidth: 4, borderTopColor: ACCENT, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, alignItems: 'center' },
  cajaWeb: { width: 200 },
  cajaTitulo: { fontSize: 13, fontWeight: '600', color: DARK, textAlign: 'center', marginBottom: 6 },
  cajaValor: { fontSize: 22, fontWeight: 'bold', color: ACCENT },

  seccionTitulo: { fontSize: 20, fontWeight: 'bold', color: DARK },
  headerSeccionConAcciones: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 },
  botonesSeccionSuperior: { flexDirection: 'row', gap: 8 },
  btnSeccionSuperior: { backgroundColor: DARK, borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8 },

  tablaHeader: { flexDirection: 'row', backgroundColor: DARK, borderRadius: 4 },
  tablaTh: { color: '#fff', fontWeight: '600', fontSize: 12, paddingHorizontal: 10, paddingVertical: 10, minWidth: 110, borderRightWidth: 1, borderRightColor: '#555' },
  tablaFila: { flexDirection: 'row', borderWidth: 1, borderColor: BORDER, alignItems: 'center', backgroundColor: '#fff' },
  tablaTd: { fontSize: 13, color: '#555', paddingHorizontal: 14, paddingVertical: 12, minWidth: 110, borderRightWidth: 1, borderRightColor: BORDER },
  tablaTdVacio: { fontSize: 13, color: '#555', paddingHorizontal: 14, paddingVertical: 14, flex: 1, minWidth: 200, borderRightWidth: 1, borderRightColor: BORDER },
  tablaTdAcciones: { minWidth: 90, paddingHorizontal: 6, paddingVertical: 6, gap: 4, justifyContent: 'center', alignItems: 'center' },
  btnAccion: { backgroundColor: ACCENT, borderRadius: 3, paddingHorizontal: 7, paddingVertical: 4, marginBottom: 3, alignItems: 'center', width: 76 },
  btnAccionTexto: { color: '#fff', fontSize: 10, fontWeight: '600' },

  botonesSeccion: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  btnSeccion: { backgroundColor: DARK, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 10 },
  btnSeccionTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },

  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff', paddingBottom: 8 },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 8, gap: 2 },
  tabLabel: { fontSize: 9, color: '#999', textAlign: 'center' },

  // Tarjetas de ventas / usuarios / productos / inventario (comparten estilos)
  ventaCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, borderLeftWidth: 4, borderLeftColor: ACCENT },
  ventaCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ventaCardId: { fontSize: 15, fontWeight: 'bold', color: DARK },
  ventaCardEstado: { fontSize: 11, fontWeight: '700', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  ventaCardInfo: { gap: 3, marginBottom: 10 },
  ventaCardTxt: { fontSize: 13, color: '#555' },
  ventaCardBtns: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  ventaBtn: { backgroundColor: ACCENT, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
  ventaBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Tarjetas de pedidos
  pedidoCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, borderLeftWidth: 4, borderLeftColor: ACCENT },
  pedidoCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pedidoCardId: { fontSize: 15, fontWeight: 'bold', color: DARK },
  pedidoCardEstado: { fontSize: 11, fontWeight: '700', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pedidoCardInfo: { gap: 3, marginBottom: 10 },
  pedidoCardTxt: { fontSize: 13, color: '#555' },
  pedidoCardBtns: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pedidoBtn: { backgroundColor: ACCENT, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
  pedidoBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },
});