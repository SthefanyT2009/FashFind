import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import Carrito from './carrito';

import Perfil from './perfil';

import { productos } from './catalogos';

const { width } = Dimensions.get('window');

const ACCENT = '#e91e8c';
const DARK = '#1a1a2e';
const GRAY = '#888';

export default function VistaCliente() {

  const [carritoVisible, setCarritoVisible] =
    useState(false);

  const [perfilVisible, setPerfilVisible] =
    useState(false);

  const [slideActivo, setSlideActivo] =
    useState(0);

  const [categoriaActiva, setCategoriaActiva] =
    useState('Todos');

  const [carrito, setCarrito] =
    useState<any[]>([]);

  const [usuario, setUsuario] =
    useState<any>(null);

  /* =========================
     SLIDES
  ========================= */

  const slides = [

    {
      titulo: 'Nueva Colección',
      subtitulo: 'Moda elegante y moderna',
      img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    },

    {
      titulo: 'Colección Caballero',
      subtitulo: 'Estilo premium',
      img: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&q=80',
    },

    {
      titulo: 'Ofertas Especiales',
      subtitulo: 'Hasta 40% OFF',
      img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    },

  ];

  /* =========================
     FILTRAR PRODUCTOS
  ========================= */

  const productosFiltrados =
    categoriaActiva === 'Todos'
      ? productos || []
      : (productos || []).filter(
          p => p.categoria === categoriaActiva
        );

  /* =========================
     STORAGE
  ========================= */

  useEffect(() => {

    cargarCarrito();
    cargarUsuario();

  }, []);

  const cargarUsuario = async () => {

    try {

      const data =
        await AsyncStorage.getItem('usuario');

      if (data) {

        setUsuario(JSON.parse(data));

      } else {

        // usuario demo
        const demo = {

          nombre: 'Maria Garcia',
          usuario: 'maria04',
          correo: 'maria@email.com',
          telefono: '300111111',
          cedula: '1004',
          direccion: 'Bogotá',

        };

        setUsuario(demo);

      }

    } catch (error) {

      console.log(error);

    }
  };

  const cargarCarrito = async () => {

    try {

      const data =
        await AsyncStorage.getItem('fashf_cart');

      if (data) {

        setCarrito(JSON.parse(data));

      }

    } catch (error) {

      console.log(error);

    }
  };

  const guardarCarrito = async (
    nuevoCarrito: any[]
  ) => {

    try {

      await AsyncStorage.setItem(
        'fashf_cart',
        JSON.stringify(nuevoCarrito)
      );

    } catch (error) {

      console.log(error);

    }
  };

  /* =========================
     AGREGAR CARRITO
  ========================= */

  const agregarAlCarrito = async (
    producto: any
  ) => {

    const existe = carrito.find(
      p => p.id === producto.id
    );

    let nuevoCarrito;

    if (existe) {

      nuevoCarrito = carrito.map(p =>

        p.id === producto.id

          ? {
              ...p,
              cantidad: (p.cantidad || 1) + 1,
            }

          : p
      );

    } else {

      nuevoCarrito = [
        ...carrito,
        {
          ...producto,
          cantidad: 1,
        },
      ];
    }

    setCarrito(nuevoCarrito);

    await guardarCarrito(nuevoCarrito);

    setCarritoVisible(true);
  };

  /* =========================
     ELIMINAR PRODUCTO
  ========================= */

  const eliminarProducto = async (
    id: number
  ) => {

    const nuevo =
      carrito.filter(p => p.id !== id);

    setCarrito(nuevo);

    await guardarCarrito(nuevo);
  };

  /* =========================
     CANTIDADES
  ========================= */

  const cambiarCantidad = async (
    id: number,
    tipo: 'sumar' | 'restar'
  ) => {

    const nuevo = carrito.map(p => {

      if (p.id === id) {

        let cantidad =
          p.cantidad || 1;

        cantidad =
          tipo === 'sumar'
            ? cantidad + 1
            : cantidad - 1;

        if (cantidad < 1) {
          cantidad = 1;
        }

        return {
          ...p,
          cantidad,
        };
      }

      return p;
    });

    setCarrito(nuevo);

    await guardarCarrito(nuevo);
  };

  /* =========================
     FINALIZAR
  ========================= */

  const finalizarCompra = async () => {

    if (carrito.length === 0) {

      Alert.alert(
        'Carrito vacío',
        'Agrega productos antes de finalizar.'
      );

      return;
    }

    try {

      setCarritoVisible(false);

      setCarrito([]);

      await AsyncStorage.removeItem(
        'fashf_cart'
      );

      Alert.alert(
        'Compra realizada',
        'Gracias por comprar en FashF'
      );

    } catch (error) {

      console.log(error);

    }
  };

  /* =========================
     TOTAL
  ========================= */

  const totalCarrito = carrito.reduce(
    (acc, p) =>
      acc + p.precio * (p.cantidad || 1),
    0
  );

  const formatPrice = (n: number) =>
    '$' + n.toLocaleString('es-CO');

  return (

    <SafeAreaView style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <Text style={styles.logo}>
          Fash
          <Text style={{ color: ACCENT }}>
            F
          </Text>
        </Text>

        <View style={styles.headerRight}>

          {/* PERFIL */}

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() =>
              setPerfilVisible(true)
            }
          >

            <Ionicons
              name="person-outline"
              size={24}
              color={DARK}
            />

          </TouchableOpacity>

          {/* CARRITO */}

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() =>
              setCarritoVisible(true)
            }
          >

            <Ionicons
              name="bag-outline"
              size={24}
              color={DARK}
            />

            {carrito.length > 0 && (

              <View style={styles.badge}>

                <Text style={styles.badgeText}>
                  {carrito.length}
                </Text>

              </View>
            )}
          </TouchableOpacity>

        </View>
      </View>

      {/* CONTENIDO */}

      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        {/* HERO */}

        <View style={styles.hero}>

          <Image
            source={{
              uri: slides[slideActivo]?.img,
            }}
            style={styles.heroImg}
            resizeMode="cover"
          />

          <View style={styles.overlay} />

          <View style={styles.heroContent}>

            <Text style={styles.heroTitle}>
              {slides[slideActivo]?.titulo}
            </Text>

            <Text style={styles.heroSub}>
              {slides[slideActivo]?.subtitulo}
            </Text>

          </View>
        </View>

        {/* CATEGORIAS */}

        <View style={styles.tabsContainer}>

          {[
            'Todos',
            'Dama',
            'Caballero',
            'Niños',
          ].map(cat => (

            <TouchableOpacity
              key={cat}
              style={[
                styles.tabBtn,
                categoriaActiva === cat &&
                  styles.tabBtnActivo,
              ]}
              onPress={() =>
                setCategoriaActiva(cat)
              }
            >

              <Text
                style={[
                  styles.tabText,
                  categoriaActiva === cat &&
                    styles.tabTextActivo,
                ]}
              >
                {cat}
              </Text>

            </TouchableOpacity>
          ))}
        </View>

        {/* PRODUCTOS */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Catálogo
          </Text>

          <View style={styles.grid}>

            {(productosFiltrados || []).map(p => (

              <View
                key={p.id}
                style={styles.card}
              >

                <Image
                  source={{
                    uri: p.img,
                  }}
                  style={styles.cardImg}
                  resizeMode="cover"
                />

                <View
                  style={[
                    styles.badgeProd,
                    {
                      backgroundColor:
                        p.badgeColor,
                    },
                  ]}
                >

                  <Text style={styles.badgeProdText}>
                    {p.badge}
                  </Text>

                </View>

                <View style={styles.cardInfo}>

                  <Text style={styles.cardTitle}>
                    {p.nombre}
                  </Text>

                  <Text style={styles.cardDesc}>
                    {p.descripcion}
                  </Text>

                  <Text style={styles.stars}>
                    {'★'.repeat(p.estrellas)}
                  </Text>

                  <View style={styles.cardFooter}>

                    <Text style={styles.price}>
                      {formatPrice(p.precio)}
                    </Text>

                    <TouchableOpacity
                      style={styles.btnAdd}
                      onPress={() =>
                        agregarAlCarrito(p)
                      }
                    >

                      <Ionicons
                        name="add"
                        size={16}
                        color="#fff"
                      />

                      <Text style={styles.btnAddText}>
                        Agregar
                      </Text>

                    </TouchableOpacity>

                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>

          <Text style={styles.footerText}>
            © 2026 FashF
          </Text>

        </View>

      </ScrollView>

      {/* CARRITO */}

      <Carrito
        visible={carritoVisible}
        cerrar={() =>
          setCarritoVisible(false)
        }
        carrito={carrito}
        eliminarProducto={eliminarProducto}
        cambiarCantidad={cambiarCantidad}
        finalizarCompra={finalizarCompra}
        totalCarrito={totalCarrito}
        formatPrice={formatPrice}
      />

      {/* PERFIL */}

      <Perfil
        visible={perfilVisible}
        cerrar={() =>
          setPerfilVisible(false)
        }
        usuario={usuario}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: DARK,
  },

  headerBtn: {
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  hero: {
    height: 260,
    position: 'relative',
  },

  heroImg: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  heroContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
  },

  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },

  heroSub: {
    color: '#fff',
    marginTop: 6,
  },

  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    padding: 16,
  },

  tabBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: '#f3f3f3',
  },

  tabBtnActivo: {
    backgroundColor: ACCENT,
  },

  tabText: {
    color: DARK,
    fontWeight: '600',
  },

  tabTextActivo: {
    color: '#fff',
  },

  section: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DARK,
    marginBottom: 18,
    textAlign: 'center',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  card: {
    width:
      width > 900
        ? (width - 80) / 4
        : width > 600
        ? (width - 60) / 3
        : (width - 44) / 2,

    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.1,
    shadowRadius: 6,

    elevation: 4,
  },

  cardImg: {
    width: '100%',
    height: 190,
  },

  badgeProd: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badgeProdText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  cardInfo: {
    padding: 12,
  },

  cardTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: DARK,
  },

  cardDesc: {
    color: GRAY,
    marginVertical: 5,
    fontSize: 12,
  },

  stars: {
    color: '#f9a825',
    marginBottom: 10,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  price: {
    fontWeight: 'bold',
    fontSize: 15,
    color: DARK,
  },

  btnAdd: {
    backgroundColor: DARK,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },

  btnAddText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  footer: {
    padding: 24,
    alignItems: 'center',
  },

  footerText: {
    color: GRAY,
  },

});