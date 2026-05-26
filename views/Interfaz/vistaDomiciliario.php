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
    <h2>Domiciliario</h2>
    <ul>
      <li><a href="../Perfil/miPerfilDomiciliario.html">Mi Perfil</a></li>
      <li><a href="#pagina_principal">Pagina Principal</a></li>
      <li><a href="#pedido">Gestión de Pedidos</a></li>
      <li><a href="../Login/login.php">Cerrar sesión</a></li>
    </ul>
  </div>
  <!-- Contenido principal -->
  <div class="contenido-principal" id="contenido-principal">

    <!-- Barra superior -->
    <div class="barra-superior">
      <h1>Bienvenido, Domiciliario</h1>
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
        <h3>Pedidos Por Entregar</h3>
        <p>Ej: 5</p>
      </div>

      <div class="cajas">
        <h3>Pedidos Entregados</h3>
        <p>Ej: 20</p>
      </div>
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
              <a href="../Actualizaciones/editarEstadoDomiciliario.html">
                  <button class="btn-rosa">Actualizar</button>
              </a><br>
          </td>
        </tr>
      </tbody>
    </table>
     </section>

  </div>
</body>
</html>