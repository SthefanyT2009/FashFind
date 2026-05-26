<?php
define('BASE_PATH', __DIR__);

// Punto de entrada
require BASE_PATH . '/routes.php';
?>

<!DOCTYPE html> 
<html lang="es"> 
<head>
  <meta charset="UTF-8"/> 
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/> 
  <title>FashF — Tienda de Moda</title> 
  <link rel="stylesheet" href="index.css"/> 
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/> <!-- Iconos Font Awesome -->
</head>
<body>

<!-- PANEL CARRITO LATERAL -->
<div class="cart-panel-overlay" id="cartOverlay"></div> <!-- Fondo oscuro detras del panel -->
<aside class="cart-panel" id="cartPanel"> <!-- Panel deslizable desde la derecha -->
  <div class="cp-header">
    <h3>Tu Carrito</h3> <!-- Titulo del panel -->
    <button class="cp-close" id="btnCloseCart"><i class="fa-solid fa-xmark"></i></button> <!-- Boton cerrar -->
  </div>
  <div class="cp-items" id="cpItems"> <!-- Zona donde se insertan los items por JS -->
    <div class="cp-empty"><i class="fa-solid fa-bag-shopping"></i><p>Tu carrito está vacío</p></div> <!-- Mensaje si no hay items -->
  </div>
  <div class="cp-footer" id="cpFooter" style="display:none"> <!-- Pie del panel, oculto si el carrito esta vacio -->
    <div class="cp-total-row"><span>Total</span><span id="cpTotal">$0</span></div> <!-- Fila del total -->
    <a href="views/Carrito/carrito.html" class="btn-go-cart">Ver carrito completo</a> <!-- Boton ir al carrito -->
  </div>
</aside>

<div class="toast" id="toast"><i class="fa-solid fa-circle-check"></i><span id="toastMsg"></span></div> <!-- Notificacion flotante al agregar producto -->

<!-- HEADER -->
<header class="main-header">
  <a href="index.php" class="logo">Fash<span>F</span></a> <!-- Logo que lleva al inicio -->
  <nav class="menu-nav">

    <div class="nav-item"> <!-- Item Dama con mega menu -->
      <a href="views/Catalogo/catalogoDama.html" class="nav-link">Dama</a>
      <div class="mega-menu">
        <div class="mega-col">
          <h4>Ropa</h4> <!-- Columna de ropa dama -->
          <a href="views/Catalogo/catalogoDama.html">Blusas</a><a href="views/Catalogo/catalogoDama.html">Faldas / Shorts</a>
          <a href="views/Catalogo/catalogoDama.html">Pantalones</a><a href="views/Catalogo/catalogoDama.html">Chaquetas</a>
          <a href="views/Catalogo/catalogoDama.html">Conjuntos</a><a href="views/Catalogo/catalogoDama.html">Pijamas</a>
          <a href="views/Catalogo/catalogoDama.html">Ropa interior</a>
        </div>
        <div class="mega-col">
          <h4>Accesorios</h4> <!-- Columna de accesorios dama -->
          <a href="views/Catalogo/catalogoDama.html">Bolsos</a><a href="views/Catalogo/catalogoDama.html">Gorras</a>
          <a href="views/Catalogo/catalogoDama.html">Medias</a><a href="views/Catalogo/catalogoDama.html">Chanclas</a>
          <a href="views/Catalogo/catalogoDama.html">Guantes</a>
        </div>
      </div>
    </div>

    <div class="nav-item"> <!-- Item Caballero con mega menu -->
      <a href="views/Catalogo/catalogoCaballero.html" class="nav-link">Caballero</a>
      <div class="mega-menu">
        <div class="mega-col">
          <h4>Ropa</h4>
          <a href="views/Catalogo/catalogoCaballero.html">Camisas</a><a href="views/Catalogo/catalogoCaballero.html">Pantalones</a>
          <a href="views/Catalogo/catalogoCaballero.html">Chaquetas</a><a href="views/Catalogo/catalogoCaballero.html">Conjuntos</a>
          <a href="views/Catalogo/catalogoCaballero.html">Bermudas</a><a href="views/Catalogo/catalogoCaballero.html">Ropa interior</a>
        </div>
        <div class="mega-col">
          <h4>Accesorios</h4>
          <a href="views/Catalogo/catalogoCaballero.html">Gorras</a><a href="views/Catalogo/catalogoCaballero.html">Cinturones</a>
          <a href="views/Catalogo/catalogoCaballero.html">Medias</a><a href="views/Catalogo/catalogoCaballero.html">Chanclas</a>
        </div>
      </div>
    </div>

    <div class="nav-item"> <!-- Item Ninos con mega menu de 3 columnas -->
      <a href="views/Catalogo/catalogoNinos.html" class="nav-link">Niños</a>
      <div class="mega-menu">
        <div class="mega-col">
          <h4>Niñas</h4>
          <a href="views/Catalogo/catalogoNinos.html">Blusas</a><a href="views/Catalogo/catalogoNinos.html">Pantalones</a>
          <a href="views/Catalogo/catalogoNinos.html">Shorts</a><a href="views/Catalogo/catalogoNinos.html">Conjuntos</a>
          <a href="views/Catalogo/catalogoNinos.html">Pijamas</a>
        </div>
        <div class="mega-col">
          <h4>Niños</h4>
          <a href="views/Catalogo/catalogoNinos.html">Camisas</a><a href="views/Catalogo/catalogoNinos.html">Pantalones</a>
          <a href="views/Catalogo/catalogoNinos.html">Bermudas</a><a href="views/Catalogo/catalogoNinos.html">Conjuntos</a>
          <a href="views/Catalogo/catalogoNinos.html">Pijamas</a>
        </div>
        <div class="mega-col">
          <h4>Accesorios</h4>
          <a href="views/Catalogo/catalogoNinos.html">Medias</a><a href="views/Catalogo/catalogoNinos.html">Chanclas</a>
          <a href="views/Catalogo/catalogoNinos.html">Guantes</a>
        </div>
      </div>
    </div>

  </nav>
  <div class="header-icons">
    <div class="search-wrap">
      <input type="text" id="searchInput" class="search-input" placeholder="Buscar..."/> <!-- Campo de busqueda -->
      <button class="icon-btn" id="btnSearch"><i class="fa-solid fa-magnifying-glass"></i></button> <!-- Boton buscar -->
    </div>
    <a href="views/Login/login.php" class="icon-btn"><i class="fa-regular fa-user"></i></a> <!-- Boton ir al login -->
    <button class="icon-btn cart-btn" id="btnOpenCart"> <!-- Boton abrir panel carrito -->
      <i class="fa-solid fa-bag-shopping"></i>
      <span class="cart-count" id="cartCount">0</span> <!-- Contador de items actualizado por JS -->
    </button>
  </div>
</header>

<!-- CARRUSEL -->
<div class="carousel">
  <div class="carousel-track" id="carTrack"> <!-- Pista que se desplaza horizontalmente -->

    <div class="slide" style="background-image:url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=80')"> <!-- Diapositiva 1 -->
      <div class="slide-overlay"></div> <!-- Capa oscura sobre la imagen -->
      <div class="slide-content">
        <h2>Nueva Colección Primavera</h2>
        <p>Descubre los looks más frescos de la temporada</p>
        <a href="views/Catalogo/catalogoDama.html" class="btn-slide">Ver Colección Dama</a>
      </div>
    </div>

    <div class="slide" style="background-image:url('https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1400&q=80')"> <!-- Diapositiva 2 -->
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <h2>Elegancia para Caballeros</h2>
        <p>Estilo clásico y contemporáneo en una sola colección</p>
        <a href="views/Catalogo/catalogoCaballero.html" class="btn-slide">Explorar Caballero</a>
      </div>
    </div>

    <div class="slide" style="background-image:url('https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400&q=80')"> <!-- Diapositiva 3 -->
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <h2>Ofertas de Temporada</h2>
        <p>Hasta 40% de descuento en prendas seleccionadas</p>
        <a href="views/Catalogo/catalogoDama.html" class="btn-slide">Ver Ofertas</a>
      </div>
    </div>

  </div>
  <button class="car-btn prev" id="carPrev">&#10094;</button> <!-- Flecha anterior -->
  <button class="car-btn next" id="carNext">&#10095;</button> <!-- Flecha siguiente -->
  <div class="car-dots">
    <button class="dot active" data-slide="0"></button> <!-- Punto diapositiva 1 (activo) -->
    <button class="dot" data-slide="1"></button> <!-- Punto diapositiva 2 -->
    <button class="dot" data-slide="2"></button> <!-- Punto diapositiva 3 -->
  </div>
</div>

<!-- CATEGORIAS RAPIDAS -->
<div class="cat-section">
  <a href="views/Catalogo/catalogoDama.html" class="cat-card" style="background:linear-gradient(135deg,#e91e8c,#ff6b35)"> <!-- Tarjeta Dama -->
    <i class="fa-solid fa-person-dress"></i>
    <span>DAMA</span>
    <small>Ver colección →</small>
  </a>
  <a href="views/Catalogo/catalogoCaballero.html" class="cat-card" style="background:linear-gradient(135deg,#1a1a2e,#0f3460)"> <!-- Tarjeta Caballero -->
    <i class="fa-solid fa-person"></i>
    <span>CABALLERO</span>
    <small>Ver colección →</small>
  </a>
  <a href="views/Catalogo/catalogoNinos.html" class="cat-card" style="background:linear-gradient(135deg,#f9a825,#e64a19)"> <!-- Tarjeta Ninos -->
    <i class="fa-solid fa-children"></i>
    <span>NIÑOS</span>
    <small>Ver colección →</small>
  </a>
</div>

<!-- MAS VENDIDOS -->
<section class="best-sellers">
  <h2 class="section-title">Prendas Más Vendidas</h2>
  <div class="products-grid"> <!-- Cuadricula de productos -->

    <div class="product-card"> <!-- Tarjeta producto 1 -->
      <div class="product-img" style="background:url('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80') center/cover">
        <span class="badge">Más Vendida</span> <!-- Etiqueta -->
      </div>
      <div class="product-info">
        <h3>Blusa Floral Primavera</h3>
        <p>Estampado floral, tela fresca. Tallas S–XL.</p>
        <div class="stars">★★★★★</div> <!-- Calificacion -->
        <span class="price">$49.900</span>
        <button class="btn-add" data-name="Blusa Floral Primavera" data-price="49900" data-color="c1">Agregar al Carrito</button> <!-- data-* leidos por JS para agregar al carrito -->
      </div>
    </div>

    <div class="product-card"> <!-- Tarjeta producto 2 -->
      <div class="product-img" style="background:url('https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&q=80') center/cover">
        <span class="badge badge-off">Oferta</span>
      </div>
      <div class="product-info">
        <h3>Camisa Oxford Clásica</h3>
        <p>Algodón premium. Blanco, azul y gris.</p>
        <div class="stars">★★★★☆</div>
        <span class="price">$89.900</span>
        <button class="btn-add" data-name="Camisa Oxford Clásica" data-price="89900" data-color="c2">Agregar al Carrito</button>
      </div>
    </div>

    <div class="product-card"> <!-- Tarjeta producto 3 (fondo de color, sin foto) -->
      <div class="product-img c3"><i class="fa-solid fa-vest product-icon"></i><span class="badge badge-new">Nuevo</span></div>
      <div class="product-info">
        <h3>Vestido Casual Verde</h3>
        <p>Vestido midi con cinturón incluido. Tela suave.</p>
        <div class="stars">★★★★★</div>
        <span class="price">$129.900</span>
        <button class="btn-add" data-name="Vestido Casual Verde" data-price="129900" data-color="c3">Agregar al Carrito</button>
      </div>
    </div>

    <div class="product-card"> <!-- Tarjeta producto 4 -->
      <div class="product-img c4"><i class="fa-solid fa-child product-icon"></i><span class="badge badge-hot">Popular</span></div>
      <div class="product-info">
        <h3>Conjunto Niño Deportivo</h3>
        <p>Camiseta y pantaloneta transpirable.</p>
        <div class="stars">★★★★☆</div>
        <span class="price">$59.900</span>
        <button class="btn-add" data-name="Conjunto Niño Deportivo" data-price="59900" data-color="c4">Agregar al Carrito</button>
      </div>
    </div>

    <div class="product-card"> <!-- Tarjeta producto 5 -->
      <div class="product-img c5"><i class="fa-solid fa-person-dress product-icon"></i><span class="badge">Trending</span></div>
      <div class="product-info">
        <h3>Jean Skinny Mujer</h3>
        <p>Mezclilla stretch, súper cómodo.</p>
        <div class="stars">★★★★★</div>
        <span class="price">$99.900</span>
        <button class="btn-add" data-name="Jean Skinny Mujer" data-price="99900" data-color="c5">Agregar al Carrito</button>
      </div>
    </div>

    <div class="product-card"> <!-- Tarjeta producto 6 -->
      <div class="product-img c6"><i class="fa-solid fa-vest-patches product-icon"></i><span class="badge">Más Vendida</span></div>
      <div class="product-info">
        <h3>Chaqueta Hombre Classic</h3>
        <p>Cuero sintético, estilo moderno. Tallas S–XXL.</p>
        <div class="stars">★★★★★</div>
        <span class="price">$199.900</span>
        <button class="btn-add" data-name="Chaqueta Hombre Classic" data-price="199900" data-color="c6">Agregar al Carrito</button>
      </div>
    </div>

  </div>
</section>

<!-- BANNER PROMO -->
<div class="promo-banner">
  <div>
    <small>Exclusivo Online</small>
    <h2>Hasta 40% OFF<br>en temporada</h2>
    <p>Descuentos especiales en toda la colección. Tiempo limitado.</p>
  </div>
  <a href="views/Catalogo/catalogoDama.html" class="btn-promo">Ver Ofertas</a> <!-- Boton de oferta -->
</div>

<footer><p>&copy; 2025 <strong>FashF</strong>. Todos los derechos reservados.</p></footer>

<script src="views/Carrito/carrito.js"></script> <!-- JS del carrito -->
<script>
  var cur = 0, tot = 3; /* Diapositiva actual y total */
  var track = document.getElementById('carTrack');
  function goTo(n) {
    cur = (n + tot) % tot; /* Calcula el indice con ciclo */
    track.style.transform = 'translateX(-' + cur * 100 + '%)'; /* Desplaza la pista */
    document.querySelectorAll('.dot').forEach(function(d,i){ d.classList.toggle('active', i === cur); }); /* Actualiza el punto activo */
  }
  document.getElementById('carPrev').addEventListener('click', function(){ goTo(cur - 1); }); /* Flecha anterior */
  document.getElementById('carNext').addEventListener('click', function(){ goTo(cur + 1); }); /* Flecha siguiente */
  document.querySelectorAll('.dot').forEach(function(d) {
    d.addEventListener('click', function(){ goTo(parseInt(this.dataset.slide)); }); /* Click en punto */
  });
  setInterval(function(){ goTo(cur + 1); }, 5000); /* Avance automatico cada 5 segundos */
</script>
</body>
</html>