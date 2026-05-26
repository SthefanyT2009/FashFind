import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Modal,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const ACCENT = '#e91e8c';
const DARK = '#1a1a2e';
const GRAY = '#888';

// Datos estáticos
const productos = [
  { id: 1, nombre: 'Blusa Floral Primavera', descripcion: 'Estampado floral, tela fresca. Tallas S–XL.', precio: 49900, badge: 'Más Vendida', badgeColor: ACCENT, estrellas: 5, img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80' },
  { id: 2, nombre: 'Camisa Oxford Clásica', descripcion: 'Algodón premium. Blanco, azul y gris.', precio: 89900, badge: 'Oferta', badgeColor: '#ff6b35', estrellas: 4, img: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&q=80' },
  { id: 3, nombre: 'Vestido Casual Verde', descripcion: 'Vestido midi con cinturón incluido.', precio: 129900, badge: 'Nuevo', badgeColor: '#2e7d32', estrellas: 5, img: null },
  { id: 4, nombre: 'Conjunto Niño Deportivo', descripcion: 'Camiseta y pantaloneta transpirable.', precio: 59900, badge: 'Popular', badgeColor: '#f9a825', estrellas: 4, img: null },
  { id: 5, nombre: 'Jean Skinny Mujer', descripcion: 'Mezclilla stretch, súper cómodo.', precio: 99900, badge: 'Trending', badgeColor: ACCENT, estrellas: 5, img: null },
  { id: 6, nombre: 'Chaqueta Hombre Classic', descripcion: 'Cuero sintético, estilo moderno. Tallas S–XXL.', precio: 199900, badge: 'Más Vendida', badgeColor: ACCENT, estrellas: 5, img: null },
];

const pedidos = [
  { id: '#0001', ciudad: 'Bogotá', fecha: '01 jun 2024', estado: 'Por Entregar', estadoColor: '#1565c0', total: '$85.000' },
  { id: '#0002', ciudad: 'Bogotá', fecha: '15 may 2024', estado: 'Entregado', estadoColor: '#2e7d32', total: '$120.000' },
  { id: '#0003', ciudad: 'Bogotá', fecha: '02 abr 2024', estado: 'Cancelado', estadoColor: '#c62828', total: '$55.000' },
];

const categorias = [
  { label: 'DAMA', icon: 'woman-outline' as const, gradient: [ACCENT, '#ff6b35'] },
  { label: 'CABALLERO', icon: 'man-outline' as const, gradient: ['#1a1a2e', '#0f3460'] },
  { label: 'NIÑOS', icon: 'happy-outline' as const, gradient: ['#f9a825', '#e64a19'] },
];

export default function VistaCliente() {
  const router = useRouter();
  const [perfilVisible, setPerfilVisible] = useState(false);
  const [carritoVisible, setCarritoVisible] = useState(false);
  const [carrito, setCarrito] = useState<typeof productos>([]);
  const [slideActivo, setSlideActivo] = useState(0);

  const agregarAlCarrito = (producto: typeof productos[0]) => {
    setCarrito(prev => [...prev, producto]);
  };

  const totalCarrito = carrito.reduce((acc, p) => acc + p.precio, 0);

  const formatPrice = (n: number) =>
    '$' + n.toLocaleString('es-CO');

  const slides = [
    { titulo: 'Nueva Colección Primavera', subtitulo: 'Descubre los looks más frescos de la temporada', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80' },
    { titulo: 'Elegancia para Caballeros', subtitulo: 'Estilo clásico y contemporáneo en una sola colección', img: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&q=80' },
    { titulo: 'Ofertas de Temporada', subtitulo: 'Hasta 40% de descuento en prendas seleccionadas', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>Fash<Text style={{ color: ACCENT }}>F</Text></Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setCarritoVisible(true)} style={styles.headerBtn}>
            <Ionicons name="bag-outline" size={24} color={DARK} />
            {carrito.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{carrito.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPerfilVisible(true)} style={styles.headerBtn}>
            <Ionicons name="person-outline" size={24} color={DARK} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* CARRUSEL */}
        <View style={styles.carrusel}>
          <Image
            source={{ uri: slides[slideActivo].img }}
            style={styles.carruselImg}
            resizeMode="cover"
          />
          <View style={styles.carruselOverlay} />
          <View style={styles.carruselContent}>
            <Text style={styles.carruselTitulo}>{slides[slideActivo].titulo}</Text>
            <Text style={styles.carruselSubtitulo}>{slides[slideActivo].subtitulo}</Text>
            <TouchableOpacity style={styles.btnSlide}>
              <Text style={styles.btnSlideText}>Ver Colección</Text>
            </TouchableOpacity>
          </View>
          {/* Dots */}
          <View style={styles.carruselDots}>
            {slides.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setSlideActivo(i)}>
                <View style={[styles.dot, i === slideActivo && styles.dotActivo]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CATEGORÍAS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catSection} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
          {categorias.map((cat, i) => (
            <View key={i} style={[styles.catCard, { backgroundColor: cat.gradient[0] }]}>
              <Ionicons name={cat.icon} size={28} color="#fff" />
              <Text style={styles.catLabel}>{cat.label}</Text>
              <Text style={styles.catSub}>Ver colección →</Text>
            </View>
          ))}
        </ScrollView>

        {/* MÁS VENDIDOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prendas Más Vendidas</Text>
          <View style={styles.productosGrid}>
            {productos.map((p) => (
              <View key={p.id} style={styles.productoCard}>
                {p.img ? (
                  <Image source={{ uri: p.img }} style={styles.productoImg} resizeMode="cover" />
                ) : (
                  <View style={[styles.productoImg, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="shirt-outline" size={40} color="#ccc" />
                  </View>
                )}
                <View style={[styles.badgeProd, { backgroundColor: p.badgeColor }]}>
                  <Text style={styles.badgeProdText}>{p.badge}</Text>
                </View>
                <View style={styles.productoInfo}>
                  <Text style={styles.productoNombre}>{p.nombre}</Text>
                  <Text style={styles.productoDesc}>{p.descripcion}</Text>
                  <Text style={styles.estrellas}>{'★'.repeat(p.estrellas)}{'☆'.repeat(5 - p.estrellas)}</Text>
                  <View style={styles.productoFooter}>
                    <Text style={styles.productoPrecio}>{formatPrice(p.precio)}</Text>
                    <TouchableOpacity style={styles.btnAgregar} onPress={() => agregarAlCarrito(p)}>
                      <Ionicons name="add" size={16} color="#fff" />
                      <Text style={styles.btnAgregarText}>Agregar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* BANNER PROMO */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoSmall}>Exclusivo Online</Text>
          <Text style={styles.promoTitulo}>Hasta 40% OFF{'\n'}en temporada</Text>
          <Text style={styles.promoSub}>Descuentos especiales en toda la colección.</Text>
          <TouchableOpacity style={styles.btnPromo}>
            <Text style={styles.btnPromoText}>Ver Ofertas</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 <Text style={{ fontWeight: 'bold' }}>FashF</Text>. Todos los derechos reservados.</Text>
        </View>
      </ScrollView>

      {/* PANEL CARRITO */}
      <Modal visible={carritoVisible} animationType="slide" transparent>
        <View style={styles.panelOverlay}>
          <TouchableOpacity style={styles.panelBg} onPress={() => setCarritoVisible(false)} />
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitulo}>Tu Carrito</Text>
              <TouchableOpacity onPress={() => setCarritoVisible(false)}>
                <Ionicons name="close" size={24} color={DARK} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }}>
              {carrito.length === 0 ? (
                <View style={styles.panelVacio}>
                  <Ionicons name="bag-outline" size={48} color="#ccc" />
                  <Text style={{ color: '#999', marginTop: 8 }}>Tu carrito está vacío</Text>
                </View>
              ) : (
                carrito.map((item, i) => (
                  <View key={i} style={styles.carritoItem}>
                    <View style={[styles.carritoImg, { backgroundColor: '#f5c6e0' }]}>
                      <Ionicons name="shirt-outline" size={22} color={ACCENT} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.carritoNombre}>{item.nombre}</Text>
                      <Text style={styles.carritoPrecio}>{formatPrice(item.precio)}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            {carrito.length > 0 && (
              <View style={styles.panelFooter}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValor}>{formatPrice(totalCarrito)}</Text>
                </View>
                <TouchableOpacity style={styles.btnVerCarrito}>
                  <Text style={styles.btnVerCarritoText}>Ver carrito completo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* PANEL PERFIL */}
      <Modal visible={perfilVisible} animationType="slide" transparent>
        <View style={styles.panelOverlay}>
          <TouchableOpacity style={styles.panelBg} onPress={() => setPerfilVisible(false)} />
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitulo}>Mi Perfil</Text>
              <TouchableOpacity onPress={() => setPerfilVisible(false)}>
                <Ionicons name="close" size={24} color={DARK} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {/* Avatar */}
              <View style={styles.perfilAvatar}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetras}>MG</Text>
                </View>
                <Text style={styles.perfilNombre}>María García</Text>
                <Text style={styles.perfilUsername}>@maria04</Text>
                <View style={styles.badgeCliente}>
                  <Text style={styles.badgeClienteText}>Cliente</Text>
                </View>
              </View>

              {/* Datos */}
              {[
                { icon: 'mail-outline', label: 'Correo', val: 'maria.garcia@email.com' },
                { icon: 'call-outline', label: 'Teléfono', val: '3001111114' },
                { icon: 'location-outline', label: 'Dirección', val: 'Carrera 30 #18-65' },
                { icon: 'card-outline', label: 'Cédula', val: '1004' },
                { icon: 'transgender-outline', label: 'Género', val: 'Femenino' },
                { icon: 'calendar-outline', label: 'Fecha de nacimiento', val: '20 abr 2000' },
                { icon: 'checkmark-circle-outline', label: 'Cliente desde', val: '04 ene 2024' },
              ].map((row, i) => (
                <View key={i} style={styles.perfilFila}>
                  <View style={styles.perfilIcono}>
                    <Ionicons name={row.icon as any} size={16} color={ACCENT} />
                  </View>
                  <View>
                    <Text style={styles.perfilLabel}>{row.label}</Text>
                    <Text style={styles.perfilVal}>{row.val}</Text>
                  </View>
                </View>
              ))}

              {/* Últimos pedidos */}
              <View style={styles.pedidosTitulo}>
                <Ionicons name="bag-outline" size={16} color={ACCENT} />
                <Text style={styles.pedidosTituloText}>Últimos pedidos</Text>
              </View>

              {pedidos.map((p, i) => (
                <View key={i} style={styles.pedidoItem}>
                  <View style={[styles.pedidoImg, { backgroundColor: i % 2 === 0 ? '#f5c6e0' : '#e3f2fd' }]}>
                    <Ionicons name="bag-outline" size={18} color={i % 2 === 0 ? ACCENT : '#1565c0'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pedidoId}>{p.id} · {p.ciudad}</Text>
                    <Text style={styles.pedidoFecha}>{p.fecha}</Text>
                    <Text style={[styles.pedidoEstado, { color: p.estadoColor }]}>● {p.estado}</Text>
                  </View>
                  <Text style={styles.pedidoTotal}>{p.total}</Text>
                </View>
              ))}

              <View style={{ height: 16 }} />
            </ScrollView>
            <View style={styles.panelFooter}>
              <TouchableOpacity
                style={[styles.btnVerCarrito, { backgroundColor: GRAY }]}
                onPress={() => { setPerfilVisible(false); router.replace('/login'); }}
              >
                <Ionicons name="log-out-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.btnVerCarritoText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  logo: { fontSize: 26, fontWeight: '900', color: DARK, letterSpacing: 1 },
  headerActions: { flexDirection: 'row', gap: 16 },
  headerBtn: { position: 'relative' },
  badge: { position: 'absolute', top: -6, right: -6, backgroundColor: ACCENT, borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Carrusel
  carrusel: { height: 220, position: 'relative' },
  carruselImg: { width: '100%', height: '100%' },
  carruselOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  carruselContent: { position: 'absolute', bottom: 36, left: 20, right: 20 },
  carruselTitulo: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  carruselSubtitulo: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 12 },
  btnSlide: { backgroundColor: ACCENT, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4, alignSelf: 'flex-start' },
  btnSlideText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  carruselDots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActivo: { backgroundColor: '#fff', width: 20 },

  // Categorías
  catSection: { marginVertical: 16 },
  catCard: { width: 120, borderRadius: 10, padding: 16, alignItems: 'center', gap: 6 },
  catLabel: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  catSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },

  // Productos
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: DARK, marginBottom: 14, textAlign: 'center' },
  productosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productoCard: {
    width: (width - 44) / 2, borderRadius: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
    backgroundColor: '#fff', overflow: 'hidden',
  },
  productoImg: { width: '100%', height: 130 },
  badgeProd: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3 },
  badgeProdText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  productoInfo: { padding: 10 },
  productoNombre: { fontSize: 13, fontWeight: '700', color: DARK, marginBottom: 3 },
  productoDesc: { fontSize: 11, color: GRAY, marginBottom: 4 },
  estrellas: { color: '#f9a825', fontSize: 12, marginBottom: 6 },
  productoFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productoPrecio: { fontSize: 14, fontWeight: 'bold', color: DARK },
  btnAgregar: { backgroundColor: DARK, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 4, gap: 3 },
  btnAgregarText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // Promo banner
  promoBanner: {
    margin: 16, borderRadius: 12, backgroundColor: DARK,
    padding: 24, alignItems: 'flex-start',
  },
  promoSmall: { color: ACCENT, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  promoTitulo: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 8, lineHeight: 32 },
  promoSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 16 },
  btnPromo: { backgroundColor: ACCENT, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  btnPromoText: { color: '#fff', fontWeight: 'bold' },

  // Footer
  footer: { padding: 20, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  footerText: { color: GRAY, fontSize: 13 },

  // Panel (Carrito y Perfil)
  panelOverlay: { flex: 1, flexDirection: 'row' },
  panelBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  panel: { width: width * 0.85, backgroundColor: '#fff', flex: 1 },
  panelHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    backgroundColor: DARK,
  },
  panelTitulo: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  panelVacio: { alignItems: 'center', paddingVertical: 40 },
  panelFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },

  // Carrito items
  carritoItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  carritoImg: { width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  carritoNombre: { fontSize: 14, fontWeight: '600', color: DARK },
  carritoPrecio: { fontSize: 13, color: ACCENT, fontWeight: 'bold', marginTop: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 15, fontWeight: '600', color: DARK },
  totalValor: { fontSize: 15, fontWeight: 'bold', color: DARK },
  btnVerCarrito: { backgroundColor: ACCENT, padding: 14, borderRadius: 6, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnVerCarritoText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // Perfil panel
  perfilAvatar: { alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#ce93d8', justifyContent: 'center', alignItems: 'center',
    marginBottom: 10, borderWidth: 3, borderColor: ACCENT,
  },
  avatarLetras: { fontSize: 26, fontWeight: '900', color: '#fff' },
  perfilNombre: { fontSize: 18, fontWeight: 'bold', color: DARK, marginBottom: 3 },
  perfilUsername: { fontSize: 13, color: GRAY, marginBottom: 8 },
  badgeCliente: { backgroundColor: ACCENT, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeClienteText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  perfilFila: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  perfilIcono: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fce4ec', justifyContent: 'center', alignItems: 'center' },
  perfilLabel: { fontSize: 10, fontWeight: '600', color: GRAY, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  perfilVal: { fontSize: 14, color: DARK, fontWeight: '500' },
  pedidosTitulo: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 3, borderTopColor: ACCENT },
  pedidosTituloText: { fontSize: 14, fontWeight: 'bold', color: DARK },
  pedidoItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  pedidoImg: { width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  pedidoId: { fontSize: 13, fontWeight: '700', color: DARK },
  pedidoFecha: { fontSize: 12, color: GRAY, marginTop: 1 },
  pedidoEstado: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  pedidoTotal: { fontSize: 13, fontWeight: 'bold', color: DARK },
});