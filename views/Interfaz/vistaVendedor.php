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
    <h2>Vendedor</h2>
    <ul>
      <li><a href="../Perfil/miPerfilVendedor.html">Mi Perfil</a></li>
      <li><a href="#pagina_principal">Pagina Principal</a></li>
      <li><a href="#venta">Gestión de Ventas</a></li>
      <li><a href="#inventario">Gestión de Inventario</a></li>
      <li><a href="../Login/login.php">Cerrar sesión</a></li>
    </ul>
  </div>
  <!-- Contenido principal -->
  <div class="contenido-principal" id="contenido-principal">

    <!-- Barra superior -->
    <div class="barra-superior">
      <h1>Bienvenido, Vendedor</h1>
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
        <h3>Ventas Quincenales</h3>
        <p>Ej: 500000</p>
      </div>
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
          <th>Cambio</th>
          <th>Estado</th>
          <th>Id Vendedor Registra</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="8"> No hay usuarios registrados.</td>
        </tr>
      </tbody>
    </table>
    <a>
      <button onclick="window.location.href='../Registros/registroVentasVendedor.html'">Crear Nueva Venta</button>
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
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="4"> No hay usuarios registrados.</td>
        </tr>
      </tbody>
    </table>
     </section>
  </div>

</body>
</html>