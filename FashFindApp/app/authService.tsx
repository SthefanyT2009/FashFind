const API_URL = 'http://192.168.0.7/FashFind/api';

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