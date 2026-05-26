
<!DOCTYPE html> 
<html lang="es"> 
<head>
  <meta charset="UTF-8"/> 
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/> 
  <title>FashF — Tienda de Moda</title> 
  <link rel="stylesheet" href="../../index.css"/> 
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
  <style>
    /* Panel perfil — mismo patrón que cart-panel */
    .profile-panel{position:fixed;top:0;right:0;width:380px;height:100vh;background:#fff;box-shadow:-8px 0 40px rgba(0,0,0,.15);z-index:2000;transform:translateX(100%);transition:transform .35s cubic-bezier(.77,0,.18,1);display:flex;flex-direction:column;overflow-y:auto}
    .profile-panel.open{transform:translateX(0)}
    .pp-avatar{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#e1bee7,#ce93d8);border:3px solid var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-size:1.9rem;font-weight:900;color:rgba(255,255,255,.9);margin:0 auto 12px;box-shadow:0 6px 20px rgba(233,30,140,.25)}
    .pp-row{display:flex;align-items:flex-start;gap:14px;padding:13px 24px;border-bottom:1px solid #f5f5f5}
    .pp-row:last-child{border-bottom:none}
    .pp-icon{width:34px;height:34px;border-radius:50%;background:var(--light-bg);display:flex;align-items:center;justify-content:center;color:var(--accent);font-size:.82rem;flex-shrink:0}
    .pp-label{font-size:.68rem;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--gray);margin-bottom:3px}
    .pp-val{font-size:.9rem;color:var(--primary);font-weight:500}
  </style>
</head>
<body>

<!-- PANEL CARRITO LATERAL -->
<div class="cart-panel-overlay" id="cartOverlay"></div>
<aside class="cart-panel" id="cartPanel">
  <div class="cp-header">
    <h3>Tu Carrito</h3>
    <button class="cp-close" id="btnCloseCart"><i class="fa-solid fa-xmark"></i></button>
  </div>
  <div class="cp-items" id="cpItems">
    <div class="cp-empty"><i class="fa-solid fa-bag-shopping"></i><p>Tu carrito está vacío</p></div>
  </div>
  <div class="cp-footer" id="cpFooter" style="display:none">
    <div class="cp-total-row"><span>Total</span><span id="cpTotal">$0</span></div>
    <a href="views/Carrito/carrito.html" class="btn-go-cart">Ver carrito completo</a>
  </div>
</aside>

<!-- PANEL PERFIL LATERAL -->
<div class="cart-panel-overlay" id="profileOverlay"></div>
<aside class="profile-panel" id="profilePanel">

  <!-- Encabezado — igual que cp-header -->
  <div class="cp-header">
    <h3>Mi Perfil</h3>
    <button class="cp-close" id="btnCloseProfile"><i class="fa-solid fa-xmark"></i></button>
  </div>

  <!-- Avatar + nombre -->
  <div style="padding:28px 24px 20px;border-bottom:1px solid var(--border);text-align:center">
    <div class="pp-avatar">MG</div>
    <div style="font-family:var(--fd);font-size:1.15rem;font-weight:700;margin-bottom:4px">María García</div>
    <div style="font-size:.8rem;color:var(--gray);margin-bottom:10px">@maria04</div>
    <span class="badge" style="position:static;display:inline-block">Cliente</span>
  </div>

  <!-- Datos personales -->
  <div style="flex:1">

    <div class="pp-row">
      <div class="pp-icon"><i class="fa-regular fa-envelope"></i></div>
      <div>
        <div class="pp-label">Correo</div>
        <div class="pp-val">maria.garcia@email.com</div>
      </div>
    </div>

    <div class="pp-row">
      <div class="pp-icon"><i class="fa-solid fa-phone"></i></div>
      <div>
        <div class="pp-label">Teléfono</div>
        <div class="pp-val">3001111114</div>
      </div>
    </div>

    <div class="pp-row">
      <div class="pp-icon"><i class="fa-solid fa-location-dot"></i></div>
      <div>
        <div class="pp-label">Dirección</div>
        <div class="pp-val">Carrera 30 #18-65</div>
      </div>
    </div>

    <div class="pp-row">
      <div class="pp-icon"><i class="fa-solid fa-id-card"></i></div>
      <div>
        <div class="pp-label">Cédula</div>
        <div class="pp-val">1004</div>
      </div>
    </div>

    <div class="pp-row">
      <div class="pp-icon"><i class="fa-solid fa-venus-mars"></i></div>
      <div>
        <div class="pp-label">Género</div>
        <div class="pp-val">Femenino</div>
      </div>
    </div>

    <div class="pp-row">
      <div class="pp-icon"><i class="fa-solid fa-cake-candles"></i></div>
      <div>
        <div class="pp-label">Fecha de nacimiento</div>
        <div class="pp-val">20 abr 2000</div>
      </div>
    </div>

    <div class="pp-row">
      <div class="pp-icon"><i class="fa-solid fa-calendar-check"></i></div>
      <div>
        <div class="pp-label">Cliente desde</div>
        <div class="pp-val">04 ene 2024</div>
      </div>
    </div>

  </div>

  <!-- Últimos pedidos — reutiliza cp-item -->
  <div style="border-top:3px solid var(--accent);padding-top:4px">
    <div style="padding:16px 24px 8px;font-family:var(--fd);font-size:.9rem;font-weight:700">
      <i class="fa-solid fa-bag-shopping" style="color:var(--accent);margin-right:7px"></i>Últimos pedidos
    </div>

    <div class="cp-item">
      <div class="cp-img c1"><i class="fa-solid fa-bag-shopping"></i></div>
      <div class="cp-info">
        <h5>#0001 · Bogotá</h5>
        <p>01 jun 2024</p>
        <p class="cp-price" style="color:#1565c0">● Por Entregar</p>
      </div>
      <span style="font-size:.8rem;font-weight:700;color:var(--primary)">$85.000</span>
    </div>

    <div class="cp-item">
      <div class="cp-img c3"><i class="fa-solid fa-bag-shopping"></i></div>
      <div class="cp-info">
        <h5>#0002 · Bogotá</h5>
        <p>15 may 2024</p>
        <p class="cp-price" style="color:#2e7d32">● Entregado</p>
      </div>
      <span style="font-size:.8rem;font-weight:700;color:var(--primary)">$120.000</span>
    </div>

    <div class="cp-item">
      <div class="cp-img c4"><i class="fa-solid fa-bag-shopping"></i></div>
      <div class="cp-info">
        <h5>#0003 · Bogotá</h5>
        <p>02 abr 2024</p>
        <p class="cp-price" style="color:#c62828">● Cancelado</p>
      </div>
      <span style="font-size:.8rem;font-weight:700;color:var(--primary)">$55.000</span>
    </div>

  </div>

  <!-- Footer — igual que cp-footer -->
  <div class="cp-footer" style="display:block">
    <a href="../Login/login.php" class="btn-go-cart"
       style="background:var(--gray);margin-top:10px;display:block;text-align:center">
      <i class="fa-solid fa-arrow-right-from-bracket" style="margin-right:7px"></i>Cerrar sesión
    </a>
  </div>

</aside>

<div class="toast" id="toast"><i class="fa-solid fa-circle-check"></i><span id="toastMsg"></span></div>

<!-- HEADER -->
<header class="main-header">
  <a href="index.php" class="logo">Fash<span>F</span></a>
  <nav class="menu-nav">

    <div class="nav-item">
      <a href="../Catalogo/catalogoDama.html" class="nav-link">Dama</a>
      <div class="mega-menu">
        <div class="mega-col">
          <h4>Ropa</h4>
          <a href="../Catalogo/catalogoDama.html">Blusas</a><a href="../Catalogo/catalogoDama.html">Faldas / Shorts</a>
          <a href="../Catalogo/catalogoDama.html">Pantalones</a><a href="../Catalogo/catalogoDama.html">Chaquetas</a>
          <a href="../Catalogo/catalogoDama.html">Conjuntos</a><a href="../Catalogo/catalogoDama.html">Pijamas</a>
          <a href="../Catalogo/catalogoDama.html">Ropa interior</a>
        </div>
        <div class="mega-col">
          <h4>Accesorios</h4>
          <a href="../Catalogo/catalogoDama.html">Bolsos</a><a href="../Catalogo/catalogoDama.html">Gorras</a>
          <a href="../Catalogo/catalogoDama.html">Medias</a><a href="../Catalogo/catalogoDama.html">Chanclas</a>
          <a href="../Catalogo/catalogoDama.html">Guantes</a>
        </div>
      </div>
    </div>

    <div class="nav-item">
      <a href="../Catalogo/catalogoCaballero.html" class="nav-link">Caballero</a>
      <div class="mega-menu">
        <div class="mega-col">
          <h4>Ropa</h4>
          <a href="../Catalogo/catalogoCaballero.html">Camisas</a><a href="../Catalogo/catalogoCaballero.html">Pantalones</a>
          <a href="../Catalogo/catalogoCaballero.html">Chaquetas</a><a href="../Catalogo/catalogoCaballero.html">Conjuntos</a>
          <a href="../Catalogo/catalogoCaballero.html">Bermudas</a><a href="../Catalogo/catalogoCaballero.html">Ropa interior</a>
        </div>
        <div class="mega-col">
          <h4>Accesorios</h4>
          <a href="../Catalogo/catalogoCaballero.html">Gorras</a><a href="../Catalogo/catalogoCaballero.html">Cinturones</a>
          <a href="../Catalogo/catalogoCaballero.html">Medias</a><a href="../Catalogo/catalogoCaballero.html">Chanclas</a>
        </div>
      </div>
    </div>

    <div class="nav-item">
      <a href="../Catalogo/catalogoNinos.html" class="nav-link">Niños</a>
      <div class="mega-menu">
        <div class="mega-col">
          <h4>Niñas</h4>
          <a href="../Catalogo/catalogoNinos.html">Blusas</a><a href="../Catalogo/catalogoNinos.html">Pantalones</a>
          <a href="../Catalogo/catalogoNinos.html">Shorts</a><a href="../Catalogo/catalogoNinos.html">Conjuntos</a>
          <a href="../Catalogo/catalogoNinos.html">Pijamas</a>
        </div>
        <div class="mega-col">
          <h4>Niños</h4>
          <a href="../Catalogo/catalogoNinos.html">Camisas</a><a href="../Catalogo/catalogoNinos.html">Pantalones</a>
          <a href="../Catalogo/catalogoNinos.html">Bermudas</a><a href="../Catalogo/catalogoNinos.html">Conjuntos</a>
          <a href="../Catalogo/catalogoNinos.html">Pijamas</a>
        </div>
        <div class="mega-col">
          <h4>Accesorios</h4>
          <a href="../Catalogo/catalogoNinos.html">Medias</a><a href="../Catalogo/catalogoNinos.html">Chanclas</a>
          <a href="../Catalogo/catalogoNinos.html">Guantes</a>
        </div>
      </div>
    </div>

  </nav>
  <div class="header-icons">
    <div class="search-wrap">
      <input type="text" id="searchInput" class="search-input" placeholder="Buscar..."/>
      <button class="icon-btn" id="btnSearch"><i class="fa-solid fa-magnifying-glass"></i></button>
    </div>
    <!-- icono usuario → abre panel perfil -->
    <button class="icon-btn" id="btnOpenProfile"><i class="fa-regular fa-user"></i></button>
    <button class="icon-btn cart-btn" id="btnOpenCart">
      <i class="fa-solid fa-bag-shopping"></i>
      <span class="cart-count" id="cartCount">0</span>
    </button>
  </div>
</header>

<!-- CARRUSEL -->
<div class="carousel">
  <div class="carousel-track" id="carTrack">
    <div class="slide" style="background-image:url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=80')">
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <h2>Nueva Colección Primavera</h2>
        <p>Descubre los looks más frescos de la temporada</p>
        <a href="../Catalogo/catalogoDama.html" class="btn-slide">Ver Colección Dama</a>
      </div>
    </div>
    <div class="slide" style="background-image:url('https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1400&q=80')">
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <h2>Elegancia para Caballeros</h2>
        <p>Estilo clásico y contemporáneo en una sola colección</p>
        <a href="../Catalogo/catalogoCaballero.html" class="btn-slide">Explorar Caballero</a>
      </div>
    </div>
    <div class="slide" style="background-image:url('https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400&q=80')">
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <h2>Ofertas de Temporada</h2>
        <p>Hasta 40% de descuento en prendas seleccionadas</p>
        <a href="../Catalogo/catalogoDama.html" class="btn-slide">Ver Ofertas</a>
      </div>
    </div>
  </div>
  <button class="car-btn prev" id="carPrev">&#10094;</button>
  <button class="car-btn next" id="carNext">&#10095;</button>
  <div class="car-dots">
    <button class="dot active" data-slide="0"></button>
    <button class="dot" data-slide="1"></button>
    <button class="dot" data-slide="2"></button>
  </div>
</div>

<!-- CATEGORIAS RAPIDAS -->
<div class="cat-section">
  <a href="../Catalogo/catalogoDama.html" class="cat-card" style="background:linear-gradient(135deg,#e91e8c,#ff6b35)">
    <i class="fa-solid fa-person-dress"></i><span>DAMA</span><small>Ver colección →</small>
  </a>
  <a href="../Catalogo/catalogoCaballero.html" class="cat-card" style="background:linear-gradient(135deg,#1a1a2e,#0f3460)">
    <i class="fa-solid fa-person"></i><span>CABALLERO</span><small>Ver colección →</small>
  </a>
  <a href="../Catalogo/catalogoNinos.html" class="cat-card" style="background:linear-gradient(135deg,#f9a825,#e64a19)">
    <i class="fa-solid fa-children"></i><span>NIÑOS</span><small>Ver colección →</small>
  </a>
</div>

<!-- MAS VENDIDOS -->
<section class="best-sellers">
  <h2 class="section-title">Prendas Más Vendidas</h2>
  <div class="products-grid">

    <div class="product-card">
      <div class="product-img" style="background:url('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80') center/cover">
        <span class="badge">Más Vendida</span>
      </div>
      <div class="product-info">
        <h3>Blusa Floral Primavera</h3>
        <p>Estampado floral, tela fresca. Tallas S–XL.</p>
        <div class="stars">★★★★★</div>
        <span class="price">$49.900</span>
        <button class="btn-add" data-name="Blusa Floral Primavera" data-price="49900" data-color="c1">Agregar al Carrito</button>
      </div>
    </div>

    <div class="product-card">
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

    <div class="product-card">
      <div class="product-img c3"><i class="fa-solid fa-vest product-icon"></i><span class="badge badge-new">Nuevo</span></div>
      <div class="product-info">
        <h3>Vestido Casual Verde</h3>
        <p>Vestido midi con cinturón incluido. Tela suave.</p>
        <div class="stars">★★★★★</div>
        <span class="price">$129.900</span>
        <button class="btn-add" data-name="Vestido Casual Verde" data-price="129900" data-color="c3">Agregar al Carrito</button>
      </div>
    </div>

    <div class="product-card">
      <div class="product-img c4"><i class="fa-solid fa-child product-icon"></i><span class="badge badge-hot">Popular</span></div>
      <div class="product-info">
        <h3>Conjunto Niño Deportivo</h3>
        <p>Camiseta y pantaloneta transpirable.</p>
        <div class="stars">★★★★☆</div>
        <span class="price">$59.900</span>
        <button class="btn-add" data-name="Conjunto Niño Deportivo" data-price="59900" data-color="c4">Agregar al Carrito</button>
      </div>
    </div>

    <div class="product-card">
      <div class="product-img c5"><i class="fa-solid fa-person-dress product-icon"></i><span class="badge">Trending</span></div>
      <div class="product-info">
        <h3>Jean Skinny Mujer</h3>
        <p>Mezclilla stretch, súper cómodo.</p>
        <div class="stars">★★★★★</div>
        <span class="price">$99.900</span>
        <button class="btn-add" data-name="Jean Skinny Mujer" data-price="99900" data-color="c5">Agregar al Carrito</button>
      </div>
    </div>

    <div class="product-card">
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
  <a href="../Catalogo/catalogoDama.html" class="btn-promo">Ver Ofertas</a>
</div>

<footer><p>&copy; 2025 <strong>FashF</strong>. Todos los derechos reservados.</p></footer>

<script src="views/Carrito/carrito.js"></script>
<script>
  /* ── CARRUSEL ── */
  var cur = 0, tot = 3;
  var track = document.getElementById('carTrack');
  function goTo(n){ cur=(n+tot)%tot; track.style.transform='translateX(-'+cur*100+'%)'; document.querySelectorAll('.dot').forEach(function(d,i){d.classList.toggle('active',i===cur);}); }
  document.getElementById('carPrev').addEventListener('click',function(){goTo(cur-1);});
  document.getElementById('carNext').addEventListener('click',function(){goTo(cur+1);});
  document.querySelectorAll('.dot').forEach(function(d){d.addEventListener('click',function(){goTo(parseInt(this.dataset.slide));});});
  setInterval(function(){goTo(cur+1);},5000);

  /* ── BUSCADOR ── */
  document.getElementById('btnSearch').addEventListener('click',function(){
    document.getElementById('searchInput').classList.toggle('active');
  });

  /* ── CARRITO ── */
  var cartOverlay = document.getElementById('cartOverlay');
  var cartPanel   = document.getElementById('cartPanel');
  document.getElementById('btnOpenCart').addEventListener('click',function(){
    cartPanel.classList.add('open'); cartOverlay.classList.add('open');
  });
  document.getElementById('btnCloseCart').addEventListener('click',function(){
    cartPanel.classList.remove('open'); cartOverlay.classList.remove('open');
  });
  cartOverlay.addEventListener('click',function(){
    cartPanel.classList.remove('open'); cartOverlay.classList.remove('open');
  });

  /* ── PANEL PERFIL ── */
  var profilePanel   = document.getElementById('profilePanel');
  var profileOverlay = document.getElementById('profileOverlay');
  document.getElementById('btnOpenProfile').addEventListener('click',function(){
    profilePanel.classList.add('open'); profileOverlay.classList.add('open');
  });
  document.getElementById('btnCloseProfile').addEventListener('click',function(){
    profilePanel.classList.remove('open'); profileOverlay.classList.remove('open');
  });
  profileOverlay.addEventListener('click',function(){
    profilePanel.classList.remove('open'); profileOverlay.classList.remove('open');
  });
</script>
</body>
</html>