
const API_URL = 'http://172.30.3.163/FashFind/api';
export type Cargo = 'Administrador' | 'Vendedor' | 'Domiciliario' | 'Cliente';

export interface Usuario {
  id: number;
  nombre_usuario: string;
  cargo: Cargo;
  nombres: string;
  apellidos: string;
}

export interface LoginResponse {
  success: boolean;
  usuario?: Usuario;
  mensaje?: string;
}

export interface RegistroResponse {
  success: boolean;
  usuario?: any;
  mensaje?: string;
}

// Login
export const login = async (
  nombre_usuario: string,
  contrasena: string
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre_usuario: nombre_usuario.trim(),
        contrasena,
      }),
    });

    const data: LoginResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, mensaje: 'Error de conexión' };
  }
};

// Registro
export const registro = async (datos: any): Promise<RegistroResponse> => {
  try {
    const response = await fetch(`${API_URL}/registro.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...datos,
        cargo: 'Cliente',
      }),
    });

    const data: RegistroResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error en registro:', error);
    return { success: false, mensaje: 'Error de conexión' };
  }
};
// ============================
// PEDIDOS
// ============================

export const listarPedidos = async () => {
  try {
    const response = await fetch(`${API_URL}/pedidos.php`, {
      method: 'GET',
    });

    return await response.json();
  } catch (error) {
    console.error('Error al listar pedidos:', error);
    return {
      success: false,
      mensaje: 'Error de conexión',
    };
  }
};

export const cancelarPedido = async (id_pedido: number) => {
  try {
    const response = await fetch(
      `${API_URL}/pedidos.php?id=${id_pedido}&action=cancelar`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    return {
      success: false,
      mensaje: 'Error de conexión',
    };
  }
};

export const reactivarPedido = async (id_pedido: number) => {
  try {
    const response = await fetch(
      `${API_URL}/pedidos.php?id=${id_pedido}&action=reactivar`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Error al reactivar pedido:', error);
    return {
      success: false,
      mensaje: 'Error de conexión',
    };
  }
};

export const entregarPedido = async (id_pedido: number) => {
  try {
    const response = await fetch(
      `${API_URL}/pedidos.php?id=${id_pedido}&action=entregar`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Error al entregar pedido:', error);
    return {
      success: false,
      mensaje: 'Error de conexión',
    };
  }
};