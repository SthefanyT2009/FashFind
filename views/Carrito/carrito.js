(function () {  // Función autoejecutable para evitar contaminar el scope global

  /* ── helpers (funciones auxiliares) ── */
  function load()  { return JSON.parse(localStorage.getItem('fashf_cart') || '[]'); }  // Carga el carrito desde localStorage
  function save(c) { localStorage.setItem('fashf_cart', JSON.stringify(c)); }          // Guarda el carrito en localStorage
  function fmt(n)  { return '$' + Number(n).toLocaleString('es-CO'); }                 // Formatea números como moneda colombiana

  /* ── actualizar badge del header (contador del carrito) ── */
  function updateBadge() {
    var c  = load();  // Obtiene el carrito actual
    var el = document.getElementById('cartCount');  // Elemento que muestra el contador
    if (el) el.textContent = c.reduce(function(s,i){ return s + i.qty; }, 0);  // Suma todas las cantidades
  } 

  /* ── panel lateral del carrito (renderizar contenido) ── */
  function renderPanel() {
    var c   = load();  // Carrito actual
    var box = document.getElementById('cpItems');  // Contenedor de items
    var ft  = document.getElementById('cpFooter'); // Pie del carrito (total y botón)
    if (!box) return;  // Si no existe el contenedor, no hace nada
    
    if (!c.length) {  // Si el carrito está vacío
      box.innerHTML = '<div class="cp-empty"><i class="fa-solid fa-bag-shopping"></i><p>Tu carrito está vacío</p></div>';
      if (ft) ft.style.display = 'none';  // Oculta el pie
      return;
    }
    
    if (ft) {  // Si hay productos, muestra el pie y calcula el total
      ft.style.display = 'block';
      document.getElementById('cpTotal').textContent = fmt(c.reduce(function(s,i){ return s + i.price * i.qty; }, 0));
    }
    
    // Genera el HTML de cada producto en el carrito
    box.innerHTML = c.map(function(item, idx) {
      return '<div class="cp-item">' +
        '<div class="cp-img ' + (item.color || 'c1') + '"><i class="fa-solid fa-shirt"></i></div>' +
        '<div class="cp-info">' +
          '<h5>' + item.name + '</h5>' +
          '<p>Cantidad: ' + item.qty + '</p>' +
          '<p class="cp-price">' + fmt(item.price) + '</p>' +
        '</div>' +
        '<button class="cp-remove" data-idx="' + idx + '"><i class="fa-solid fa-xmark"></i></button>' +
      '</div>';
    }).join('');
    
    /* bind para botones de eliminar dentro del panel */
    box.querySelectorAll('.cp-remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var c2 = load();  // Carga carrito actual
        c2.splice(parseInt(this.dataset.idx), 1);  // Elimina el producto por índice
        save(c2); updateBadge(); renderPanel();  // Guarda, actualiza badge y re-renderiza
      });
    });
  }

  /* ── abrir/cerrar panel lateral ── */
  function openCart() {
    var p = document.getElementById('cartPanel');   // Panel del carrito
    var o = document.getElementById('cartOverlay'); // Overlay oscuro
    if (p) p.classList.add('open');    // Muestra el panel
    if (o) o.classList.add('open');    // Muestra el overlay
    renderPanel();  // Renderiza el contenido actualizado
  }
  
  function closeCart() {
    var p = document.getElementById('cartPanel');
    var o = document.getElementById('cartOverlay');
    if (p) p.classList.remove('open');  // Oculta el panel
    if (o) o.classList.remove('open');  // Oculta el overlay
  }

  /* ── toast (notificación emergente) ── */
  function toast(msg) {
    var t = document.getElementById('toast');
    var s = document.getElementById('toastMsg');
    if (!t || !s) return;
    s.textContent = msg;                      // Mensaje a mostrar
    t.classList.add('show');                  // Muestra el toast
    setTimeout(function(){ t.classList.remove('show'); }, 2600);  // Lo oculta después de 2.6 segundos
  }

  /* ── agregar producto al carrito (función global) ── */
  window.addToCart = function(name, price, color) {
    var c  = load();  // Carga carrito actual
    var ex = null;
    // Busca si el producto ya existe en el carrito
    for (var i = 0; i < c.length; i++) { if (c[i].name === name) { ex = c[i]; break; } }
    
    if (ex) { 
      ex.qty++;  // Si existe, incrementa cantidad
    } else { 
      c.push({ name: name, price: parseInt(price), color: color || 'c1', qty: 1 });  // Si no existe, agrega nuevo
    }
    
    save(c);           // Guarda en localStorage
    updateBadge();     // Actualiza contador del header
    renderPanel();     // Actualiza el panel lateral
    toast('"' + name + '" agregado al carrito');  // Muestra notificación
    openCart();        // Abre el panel del carrito automáticamente
  };

  /* ── exponer API pública para carrito.html (si se necesita) ── */
  window.CartAPI = {
    load: load, save: save, fmt: fmt,
    openCart: openCart, closeCart: closeCart,
    updateBadge: updateBadge, renderPanel: renderPanel
  };

  /* ── inicialización cuando el DOM está listo ── */
  document.addEventListener('DOMContentLoaded', function() {
    // Botones para abrir/cerrar carrito
    var closeBtn = document.getElementById('btnCloseCart');
    var openBtn  = document.getElementById('btnOpenCart');
    var overlay  = document.getElementById('cartOverlay');
    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (openBtn)  openBtn.addEventListener('click',  openCart);
    if (overlay)  overlay.addEventListener('click',  closeCart);

    /* bind del buscador (expande/colapsa campo de búsqueda) */
    var sb = document.getElementById('btnSearch');
    var si = document.getElementById('searchInput');
    if (sb && si) {
      sb.addEventListener('click', function() {
        si.classList.toggle('active');  // Alterna clase para mostrar/ocultar input
        if (si.classList.contains('active')) si.focus();  // Enfoca si se expande
      });
    }

    /* bind de todos los botones "Agregar al Carrito" */
    document.querySelectorAll('.boton-agregar[data-name], .btn-add[data-name]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        window.addToCart(this.dataset.name, this.dataset.price, this.dataset.color);  // Llama a la función global
      });
    });

    // Inicializa badge y panel
    updateBadge();
    renderPanel();
  });

})();  // Fin de la función autoejecutable