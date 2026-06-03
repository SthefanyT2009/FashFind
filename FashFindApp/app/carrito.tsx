import React, { useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ACCENT = '#e91e8c';
const DARK = '#1a1a2e';

export default function Carrito({

  visible,
  cerrar,
  carrito,
  eliminarProducto,
  cambiarCantidad,
  finalizarCompra,
  totalCarrito,
  formatPrice,

}: any) {

  const [mostrarPago, setMostrarPago] =
    useState(false);

  const [nombre, setNombre] =
    useState('');

  const [tarjeta, setTarjeta] =
    useState('');

  const [fecha, setFecha] =
    useState('');

  const [cvv, setCvv] =
    useState('');

  const procesarPago = () => {

    if (
      !nombre ||
      !tarjeta ||
      !fecha ||
      !cvv
    ) {

      Alert.alert(
        'Campos incompletos',
        'Completa toda la información.'
      );

      return;
    }

    setMostrarPago(false);

    finalizarCompra();
  };

  return (

    <>
      {/* MODAL CARRITO */}

      <Modal
        visible={visible}
        transparent
        animationType="slide"
      >

        <View style={styles.modalOverlay}>

          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={cerrar}
          />

          <View style={styles.cartPanel}>

            <View style={styles.cartHeader}>

              <Text style={styles.cartTitle}>
                Tu Carrito
              </Text>

              <TouchableOpacity onPress={cerrar}>

                <Ionicons
                  name="close"
                  size={24}
                  color={DARK}
                />

              </TouchableOpacity>
            </View>

            <ScrollView>

              {carrito.length === 0 ? (

                <View style={styles.emptyCart}>

                  <Ionicons
                    name="bag-outline"
                    size={50}
                    color="#ccc"
                  />

                  <Text style={styles.emptyText}>
                    Tu carrito está vacío
                  </Text>

                </View>

              ) : (

                carrito.map((item: any) => (

                  <View
                    key={item.id}
                    style={styles.cartItem}
                  >

                    <View style={styles.cartImg}>

                      <Ionicons
                        name="shirt-outline"
                        size={24}
                        color={ACCENT}
                      />

                    </View>

                    <View style={{ flex: 1 }}>

                      <Text style={styles.cartName}>
                        {item.nombre}
                      </Text>

                      <Text style={styles.cartPrice}>
                        {formatPrice(item.precio)}
                      </Text>

                      <View style={styles.qtyRow}>

                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() =>
                            cambiarCantidad(
                              item.id,
                              'restar'
                            )
                          }
                        >

                          <Ionicons
                            name="remove"
                            size={14}
                            color={DARK}
                          />

                        </TouchableOpacity>

                        <Text style={styles.qtyText}>
                          {item.cantidad}
                        </Text>

                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() =>
                            cambiarCantidad(
                              item.id,
                              'sumar'
                            )
                          }
                        >

                          <Ionicons
                            name="add"
                            size={14}
                            color={DARK}
                          />

                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        eliminarProducto(item.id)
                      }
                    >

                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#999"
                      />

                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>

            {carrito.length > 0 && (

              <View style={styles.cartFooter}>

                <View style={styles.totalRow}>

                  <Text style={styles.totalLabel}>
                    Total
                  </Text>

                  <Text style={styles.totalValue}>
                    {formatPrice(totalCarrito)}
                  </Text>

                </View>

                <TouchableOpacity
                  style={styles.checkoutBtn}
                  onPress={() =>
                    setMostrarPago(true)
                  }
                >

                  <Text style={styles.checkoutText}>
                    Ir a pagar
                  </Text>

                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL PAGO */}

      <Modal
        visible={mostrarPago}
        transparent
        animationType="slide"
      >

        <View style={styles.paymentOverlay}>

          <View style={styles.paymentContainer}>

            <View style={styles.paymentHeader}>

              <Text style={styles.paymentTitle}>
                Pago Seguro
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setMostrarPago(false)
                }
              >

                <Ionicons
                  name="close"
                  size={24}
                  color={DARK}
                />

              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Nombre del titular"
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
            />

            <TextInput
              placeholder="Número de tarjeta"
              style={styles.input}
              keyboardType="numeric"
              value={tarjeta}
              onChangeText={setTarjeta}
            />

            <View style={styles.rowInputs}>

              <TextInput
                placeholder="MM/AA"
                style={[
                  styles.input,
                  { flex: 1 },
                ]}
                value={fecha}
                onChangeText={setFecha}
              />

              <TextInput
                placeholder="CVV"
                style={[
                  styles.input,
                  { flex: 1 },
                ]}
                keyboardType="numeric"
                secureTextEntry
                value={cvv}
                onChangeText={setCvv}
              />
            </View>

            <View style={styles.totalPago}>

              <Text style={styles.totalPagoText}>
                Total:
              </Text>

              <Text style={styles.totalPagoValor}>
                {formatPrice(totalCarrito)}
              </Text>

            </View>

            <TouchableOpacity
              style={styles.payBtn}
              onPress={procesarPago}
            >

              <Ionicons
                name="card-outline"
                size={20}
                color="#fff"
              />

              <Text style={styles.payBtnText}>
                Pagar Ahora
              </Text>

            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({

  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  cartPanel: {
    width: width * 0.85,
    backgroundColor: '#fff',
  },

  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK,
  },

  emptyCart: {
    alignItems: 'center',
    marginTop: 80,
  },

  emptyText: {
    marginTop: 10,
    color: '#999',
  },

  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },

  cartImg: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: '#fce4ec',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cartName: {
    fontWeight: '600',
    color: DARK,
  },

  cartPrice: {
    color: ACCENT,
    fontWeight: 'bold',
    marginTop: 4,
  },

  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },

  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f3f3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  qtyText: {
    fontWeight: 'bold',
    color: DARK,
  },

  cartFooter: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },

  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK,
  },

  checkoutBtn: {
    backgroundColor: ACCENT,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },

  checkoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  paymentOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },

  paymentContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },

  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  paymentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DARK,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },

  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },

  totalPago: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },

  totalPagoText: {
    fontSize: 18,
    fontWeight: '600',
  },

  totalPagoValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ACCENT,
  },

  payBtn: {
    backgroundColor: ACCENT,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  payBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

});