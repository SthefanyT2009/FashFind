<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FASH FIND</title>
  <link rel="stylesheet" href="interfaz.css">
</head>
<body>

  <!-- Barra lateral -->
  <div class="barra">
    <h2>Administrador</h2>
    <ul>
      <li><a href="../Perfil/miPerfil.html">Mi Perfil</a></li>
      <li><a href="#pagina_principal">Pagina Principal</a></li>
      <li><a href="#usuario">Gestión de Usuarios</a></li>
      <li><a href="#venta">Gestión de Ventas</a></li>
      <li><a href="#pedido">Gestión de Pedidos</a></li>
      <li><a href="#producto">Gestión de Productos</a></li>
      <li><a href="#inventario">Gestión de Inventario</a></li>
      <li><a href="../Login/login.php">Cerrar sesión</a></li>
    </ul>
  </div>
  <!-- Contenido principal -->
  <div class="contenido-principal" id="contenido-principal">

    <!-- Barra superior -->
    <div class="barra-superior">
      <h1>Bienvenido, Administrador</h1>
      <button class="btn-rosa" onclick="window.location.href='../Login/login.php'">Salir</button>
    </div>

  
    <!-- Buscador  -->
     <div class="buscador">
      <form method="get">
        <input type="text" name="buscador" placeholder="Escribe tu búsqueda">
        <button class="btn-rosa" type="submit">Buscar</button>
      </form>
    </div> 
    

    <!-- Sección de la pagina principal -->
     <section id="pagina_principal">
    <div class="seccion-cajas">
      <div class="cajas">
        <h3>Usuarios Activos</h3>
        <p>Ej: 3</p>
      </div>

      <div class="cajas">
        <h3>Usuarios Inactivos</h3>
        <p>Ej: 4</p>
      </div>

      <div class="cajas">
        <h3>Clientes Registrados</h3>
        <p>Ej:5</p>
      </div>

      <div class="cajas">
        <h3>Clientes Inactivos</h3>
        <p>Ej:8</p>
      </div>

      <div class="cajas">
        <h3>Ventas Quincenales</h3>
        <p>Ej: 500000</p>
      </div>

      <div class="cajas">
        <h3>Pedidos Por Entregar</h3>
        <p>Ej: 5</p>
      </div>

      <div class="cajas">
        <h3>Pedidos Entregados</h3>
        <p>Ej: 20</p>
      </div>

      <div class="cajas">
        <h3>Productos Activos</h3>
        <p>Ej: 20</p>
      </div>
    </section>

    <!-- Tabla de usuarios -->
     <section id="usuario">
    <h2>Gestión de Usuarios</h2>
    <table class="tablas">
      <thead>
        <tr>
          <th>Id Usuario</th>
          <th>CC</th>
          <th>Nombre Usuario</th>
          <th>Contraseña</th>
          <th>Nombres</th>
          <th>Apellidos</th>
          <th>Telefono</th>
          <th>Correo</th>
          <th>Dirección</th>
          <th>Genero</th>
          <th>Fecha Nacimiento</th>
          <th>Fecha Registro</th>
          <th>Cargo</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="14"> No hay usuarios registrados.</td>
          <td>
            <a href="../Actualizaciones/editarUsuarios.html">
              <button class="btn-rosa" >Actualizar</button>
            </a><br>
            <a href="">
              <button class="btn-rosa" >Eliminar</button>
            </a><br>
            <a href="">
              <button class="btn-rosa" >Reactivar</button>
            </a><br>
          </td>
          </tr>
        </tbody>
      </table>
    <a>
      <button onclick="window.location.href='../Registros/registroUsuarios.html'">Crear Nuevo Usuario</button>
    </a>
     </section>


     <!-- Tabla de ventas -->
     <section id="venta">
    <h2>Gestión de Ventas</h2>
    <table class="tablas">
      <thead>
        <tr>
          <th>Id Venta</th>
          <th>Fecha Venta</th>
          <th>Hora</th>
          <th>Metodo Pago</th>
          <th>Costo Total</th>
          <th>Pago Recibido</th>
          <th>Cambio</th>
          <th>Estado</th>
          <th>Id Vendedor Registra</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="9"> No hay usuarios registrados.</td>
          <td>
            <a href="../Actualizaciones/editarVentas.html">
                <button class="btn-rosa" >Actualizar</button>
            </a><br>

            <a href="">
                <button class="btn-rosa" >Eliminar</button>
            </a><br>

            <a href="">
                <button class="btn-rosa" >Reactivar</button>
            </a><br>
        </td>
        </tr>
      </tbody>
    </table>
    <a>
      <button onclick="window.location.href='../Registros/registroVentas.html'">Crear Nueva Venta</button>
      <button onclick="window.location.href=''">Reporte de Ventas</button>
    </a>
     </section>

      <!-- Tabla de pedidos -->
     <section id="pedido">
    <h2>Gestión de Pedidos</h2>
    <table class="tablas">
      <thead>
        <tr>
          <th>Id Pedido</th>
          <th>Fecha Pedido</th>
          <th>Hora Pedido</th>
          <th>Metodo Pago</th>
          <th>Total Pedido</th>
          <th>Costo Envio</th>
          <th>Tipo Entrega</th>
          <th>Dirección Entrega</th>
          <th>Ciudad Entrega</th>
          <th>Telefono Contacto</th>
          <th>Fecha Entrega</th>
          <th>Estado</th>
          <th>Id Domiciliario Entrega</th>
          <th>Id Cliente</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="14"> No hay usuarios registrados.</td>  
          <td>
              <a href="../Actualizaciones/editarPedidos.html">
                  <button class="btn-rosa" >Actualizar</button>
              </a>

              <a href="">
                  <button class="btn-rosa" >Cancelar</button>
              </a><br>

              <a href="">
                  <button class="btn-rosa" >Reactivar</button>
              </a><br>
          </td>
        </tr>
      </tbody>
    </table>
    <a>
      <button onclick="window.location.href='../Registros/registroPedidos.html'">Crear Nuevo Pedido</button>
      <button onclick="window.location.href=''">Reporte de Pedidos</button>
    </a>
     </section>

     <!-- Tabla de productos -->
     <section id="producto">
    <h2>Gestión de Productos</h2>
    <table class="tablas">
      <thead>
        <tr>
          <th>Id Producto</th>
          <th>Imagen</th>
          <th>Nombre Producto</th>
          <th>Descripción</th>
          <th>Categoria</th>
          <th>Talla</th>
          <th>Color</th>
          <th>Precio</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="9"> No hay usuarios registrados.</td>
          <td>
              <a href="../Actualizaciones/editarProductos.html">
                  <button class="btn-rosa" >Actualizar</button>
              </a><br>

              <a href="">
                  <button class="btn-rosa" >Eliminar</button>
              </a><br>

              <a href="">
                  <button class="btn-rosa" >Reactivar</button>
              </a><br>
          </td>
        </tr>
      </tbody>
    </table>
    <a>
      <button onclick="window.location.href='../Registros/registroProductos.html'">Crear Nuevo Producto</button>
    </a>
     </section>

     <!-- Tabla de inventario -->
     <section id="inventario">
    <h2>Gestion de Inventario</h2>
    <table class="tablas">
      <thead>
        <tr>
          <th>Id Inventario</th>
          <th>Stock Disponible</th>
          <th>Stock Minimo</th>
          <th>Id Producto</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="4"> No hay usuarios registrados.</td>
          <td>
              <a href="../Actualizaciones/editarInventario.html">
                  <button class="btn-rosa" >Actualizar</button>
              </a><br>
          </td>
        </tr>
      </tbody>
    </table>
    <a>
      <button onclick="window.location.href='../Registros/registroInventario.html'">Crear Nuevo Inventario</button>
      <button onclick="window.location.href=''">Reporte de Inventario</button>
    </a>
     </section>
  </div>

</body>
</html>