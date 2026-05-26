<!DOCTYPE html> 
<html lang="es">
<head>
  <meta charset="UTF-8"/> 
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <!-- Hace la página responsiva en móviles -->
  <title>Registro — FashF</title>

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/> <!-- Importa la librería de íconos Font Awesome -->
  <link rel="stylesheet" href="loginRegistroEstilos.css"/> <!-- Hoja de estilos propia del formulario -->
</head>
<body>

<!-- PANTALLA DE ÉXITO -->
<div class="pantalla-exito" id="pantallaExito"> <!-- Contenedor de confirmación; se hace visible con JS al registrar exitosamente -->
  <div class="icono-exito"><i class="fa-solid fa-check"></i></div>
  <h3 id="exitoTitulo">¡Cuenta creada!</h3> <!-- JS reemplaza este texto con el nombre del usuario -->
  <p  id="exitoMensaje">Redirigiendo…</p> <!-- JS actualiza este mensaje tras el registro -->
</div>

<!-- CAJA DE REGISTRO -->
<div class="caja">
  <h2 class="seccion-titulo">Crear Cuenta</h2>

  <form method="POST"> <!-- Envía los datos por POST al servidor -->

    <div class="separador-seccion">Identificación</div>

    <div class="campo-grupo">
      <label for="cc">Cédula <span class="obligatorio">*</span></label> <!-- "for" enlaza la etiqueta con el input de id="cc" -->
      <div class="campo-caja" id="campo-cc"> <!-- JS añade clases "valido" o "error" a este div para cambiar el borde -->
        <i class="fa-solid fa-id-card"></i>
        <input type="number" id="cc" name="cc" placeholder="Ej: 1012345678" min="1000000" max="99999999999"/> <!-- type="number" solo acepta dígitos; min/max limitan el rango permitido -->
      </div>
      <div class="mensaje-error" id="error-cc"> <!-- JS agrega la clase "visible" para mostrar este mensaje si la validación falla -->
        <i class="fa-solid fa-circle-exclamation"></i>&nbsp;Ingresa una cédula válida
      </div>
    </div>

    <div class="campos-fila"> <!-- Alinea los dos campos siguientes en una fila horizontal -->
      <div class="campo-grupo">
        <label for="nombres">Nombres <span class="obligatorio">*</span></label>
        <div class="campo-caja" id="campo-nombres">
          <i class="fa-solid fa-user"></i>
          <input type="text" id="nombres" name="nombres" placeholder="Ej: María Fernanda"/>
        </div>
        <div class="mensaje-error" id="error-nombres">
          <i class="fa-solid fa-circle-exclamation"></i>&nbsp;Mínimo 2 caracteres
        </div>
      </div>
      <div class="campo-grupo">
        <label for="apellidos">Apellidos <span class="obligatorio">*</span></label>
        <div class="campo-caja" id="campo-apellidos">
          <i class="fa-solid fa-user"></i>
          <input type="text" id="apellidos" name="apellidos" placeholder="Ej: García López"/>
        </div>
        <div class="mensaje-error" id="error-apellidos">
          <i class="fa-solid fa-circle-exclamation"></i>&nbsp;Mínimo 2 caracteres
        </div>
      </div>
    </div>

    <div class="separador-seccion">Datos de Acceso</div>

    <div class="campo-grupo">
      <label for="nombre_usuario">Nombre de usuario <span class="obligatorio">*</span></label>
      <div class="campo-caja" id="campo-nombreusuario">
        <i class="fa-solid fa-circle-user"></i>
        <input type="text" id="nombre_usuario" name="nombre_usuario" placeholder="Ej: mgarcia"/>
      </div>
      <div class="mensaje-error" id="error-nombreusuario">
        <i class="fa-solid fa-circle-exclamation"></i>&nbsp;Entre 3 y 30 caracteres
      </div>
    </div>

    <div class="campo-grupo">
      <label for="contrasena">Contraseña <span class="obligatorio">*</span></label>
      <div class="campo-caja" id="campo-contrasena">
        <i class="fa-solid fa-lock"></i>
        <input type="password" id="contrasena" name="contrasena" placeholder="Mínimo 6 caracteres"/> <!-- type="password" oculta los caracteres mientras el usuario escribe -->
        <button type="button" class="boton-ojo" id="ojoContrasena"> <!-- type="button" evita que dispare el submit -->
          <i class="fa-solid fa-eye"></i>
        </button>
      </div>
      <div class="mensaje-error" id="error-contrasena">
        <i class="fa-solid fa-circle-exclamation"></i>&nbsp;Mínimo 6 caracteres
      </div>
      <!-- Barra de fortaleza -->
      <div style="margin:4px 0 0">
        <div class="barra-fortaleza"><div class="barra-relleno" id="barraRelleno"></div></div> <!-- JS modifica el ancho y color de "barraRelleno" según los requisitos cumplidos -->
        <div class="lista-requisitos">
          <span class="requisito" id="req-longitud"> <i class="fa-solid fa-circle"></i> 6+ car.</span> <!-- JS añade clase "cumplido" cuando se satisface cada requisito -->
          <span class="requisito" id="req-mayuscula"><i class="fa-solid fa-circle"></i> Mayúscula</span>
          <span class="requisito" id="req-numero">   <i class="fa-solid fa-circle"></i> Número</span>
          <span class="requisito" id="req-simbolo">  <i class="fa-solid fa-circle"></i> Símbolo</span>
        </div>
      </div>
    </div>

    <div class="separador-seccion">Contacto</div>

    <div class="campo-grupo">
      <label for="correo">Correo electrónico <span class="obligatorio">*</span></label>
      <div class="campo-caja" id="campo-correo">
        <i class="fa-solid fa-envelope"></i>
        <input type="email" id="correo" name="correo" placeholder="tucorreo@ejemplo.com"/> <!-- type="email" da una validación básica de formato en el navegador -->
      </div>
      <div class="mensaje-error" id="error-correo">
        <i class="fa-solid fa-circle-exclamation"></i>&nbsp;Correo inválido
      </div>
    </div>

    <div class="campos-fila">
      <div class="campo-grupo">
        <label for="telefono">Teléfono <span class="obligatorio">*</span></label>
        <div class="campo-caja" id="campo-telefono">
          <i class="fa-solid fa-mobile-screen"></i>
          <input type="number" id="telefono" name="telefono" placeholder="Ej: 3001234567"/>
        </div>
        <div class="mensaje-error" id="error-telefono">
          <i class="fa-solid fa-circle-exclamation"></i>&nbsp;Número inválido
        </div>
      </div>
      <div class="campo-grupo">
        <label for="genero">Género <span class="obligatorio">*</span></label>
        <div class="campo-caja" id="campo-genero">
          <i class="fa-solid fa-venus-mars"></i>
          <select id="genero" name="genero"> <!-- Lista desplegable; JS valida que no quede en la opción vacía -->
            <option value="">Seleccionar…</option> <!-- Valor vacío: obliga al usuario a elegir una opción real -->
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
          </select>
        </div>
        <div class="mensaje-error" id="error-genero">
          <i class="fa-solid fa-circle-exclamation"></i>&nbsp;Selecciona un género
        </div>
      </div>
    </div>

    <div class="campo-grupo">
      <label for="direccion">Dirección <span class="obligatorio">*</span></label>
      <div class="campo-caja" id="campo-direccion">
        <i class="fa-solid fa-location-dot"></i>
        <input type="text" id="direccion" name="direccion" placeholder="Ej: Calle 45 # 12-30, Apto 301"/>
      </div>
      <div class="mensaje-error" id="error-direccion">
        <i class="fa-solid fa-circle-exclamation"></i>&nbsp;Mínimo 5 caracteres
      </div>
    </div>

    <div class="separador-seccion">Fechas</div>

    <div class="campos-fila">
      <div class="campo-grupo">
        <label for="fecha_nacimiento">Fecha de nacimiento <span class="obligatorio">*</span></label>
        <div class="campo-caja" id="campo-fechanac">
          <i class="fa-solid fa-cake-candles"></i>
          <input type="date" id="fecha_nacimiento" name="fecha_nacimiento"/> <!-- JS le asigna un atributo max="hoy" para bloquear fechas futuras -->
        </div>
        <div class="mensaje-error" id="error-fechanac">
          <i class="fa-solid fa-circle-exclamation"></i>&nbsp;Fecha inválida
        </div>
      </div>
      <div class="campo-grupo">
        <label for="fecha_registro">Fecha de registro</label>
        <div class="campo-caja">
          <i class="fa-solid fa-calendar-check"></i>
          <input type="date" id="fecha_registro" name="fecha_registro" readonly/> <!-- readonly: el usuario lo ve pero no puede editarlo; JS lo llena automáticamente con la fecha actual -->
        </div>
      </div>
    </div>

    <button type="submit" class="boton boton-rosa" id="botonCrearCuenta"> <!-- type="submit" envía el formulario -->
      <i class="fa-solid fa-user-plus"></i> Crear Mi Cuenta
    </button>

  </form>

  <div class="enlace-cambio">
    <button class="boton-cambio" onclick="window.location.href='login.php'">← Iniciar Sesión</button> <!-- onclick redirige directamente a la página de login -->
  </div>
  <br>
  <a href="../../index.php" class="enlace-volver"> <!-- Enlace de regreso a la tienda principal -->
    <i class="fa-solid fa-arrow-left"></i> Volver a la tienda
  </a>

</div>

<script>
/* ── Fecha de registro automática (readonly) ── */
document.addEventListener('DOMContentLoaded', function () { // Espera a que todo el HTML esté cargado antes de ejecutar el código
  var hoyLocal = new Date(); // Obtiene la fecha y hora actuales del sistema
  hoyLocal.setMinutes(hoyLocal.getMinutes() - hoyLocal.getTimezoneOffset()); // Corrige el desfase de zona horaria para obtener la fecha local real
  var hoy = hoyLocal.toISOString().split('T')[0]; // Convierte la fecha a formato YYYY-MM-DD
  var fReg = document.getElementById('fecha_registro');
  var fNac = document.getElementById('fecha_nacimiento');
  if (fReg) { fReg.value = hoy; fReg.max = hoy; } // Llena el campo de registro con hoy y bloquea fechas futuras
  if (fNac) { fNac.max = hoy; } // Impide seleccionar una fecha de nacimiento futura
});

/* ── Botón ojo ── */
document.getElementById('ojoContrasena').addEventListener('click', function () {
  var input = document.getElementById('contrasena');
  input.type = input.type === 'password' ? 'text' : 'password'; // Alterna entre ocultar y mostrar la contraseña
  this.querySelector('i').className = input.type === 'text'
    ? 'fa-solid fa-eye-slash' // Ícono cuando la contraseña es visible
    : 'fa-solid fa-eye';      // Ícono cuando la contraseña está oculta
});

/* ── Barra de fortaleza ── */
document.getElementById('contrasena').addEventListener('input', function () {
  var v = this.value;
  var cumple = { // Evalúa cada requisito de seguridad con expresiones regulares
    'req-longitud':  v.length >= 6,          // Mínimo 6 caracteres
    'req-mayuscula': /[A-Z]/.test(v),         // Al menos una mayúscula
    'req-numero':    /[0-9]/.test(v),         // Al menos un número
    'req-simbolo':   /[^A-Za-z0-9]/.test(v)  // Al menos un símbolo especial
  };
  var puntaje = 0;
  var ids = Object.keys(cumple);
  for (var i = 0; i < ids.length; i++) {
    document.getElementById(ids[i]).classList.toggle('cumplido', cumple[ids[i]]); // Marca visualmente el requisito si se cumple
    if (cumple[ids[i]]) puntaje++; // Suma un punto por cada requisito cumplido
  }
  var colores = ['transparent', '#e53935', '#ff9800', '#f9a825', '#66bb6a']; // Colores según nivel: vacío, rojo, naranja, amarillo, verde
  var barra   = document.getElementById('barraRelleno');
  barra.style.width      = puntaje === 0 ? '0' : (puntaje * 25) + '%'; // 25% de ancho por cada requisito cumplido
  barra.style.background = colores[puntaje] || '#2e7d32';
});

/* ── Reglas de validación ── */
var REGLAS = { // Cada propiedad es una función que retorna true si el valor del campo es válido
  cc:               function (v) { return /^\d{7,11}$/.test(String(v).trim()); }, // Cédula: solo dígitos, entre 7 y 11 caracteres
  nombres:          function (v) { return v.trim().length >= 2; },
  apellidos:        function (v) { return v.trim().length >= 2; },
  nombre_usuario:   function (v) { return v.trim().length >= 3; },
  contrasena:       function (v) { return v.length >= 6; },
  correo:           function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }, // Formato: texto@dominio.ext
  telefono:         function (v) { return /^\d{7,10}$/.test(String(v).trim()); }, // Teléfono: solo dígitos, entre 7 y 10
  genero:           function (v) { return v !== ''; }, // No debe quedar en la opción vacía del select
  direccion:        function (v) { return v.trim().length >= 5; },
  fecha_nacimiento: function (v) { return v !== ''; }
};

var MAPA = { // Relaciona cada campo con su contenedor visual y su div de error
  cc:               { caja: 'campo-cc',           error: 'error-cc'           },
  nombres:          { caja: 'campo-nombres',       error: 'error-nombres'      },
  apellidos:        { caja: 'campo-apellidos',     error: 'error-apellidos'    },
  nombre_usuario:   { caja: 'campo-nombreusuario', error: 'error-nombreusuario'},
  contrasena:       { caja: 'campo-contrasena',    error: 'error-contrasena'   },
  correo:           { caja: 'campo-correo',        error: 'error-correo'       },
  telefono:         { caja: 'campo-telefono',      error: 'error-telefono'     },
  genero:           { caja: 'campo-genero',        error: 'error-genero'       },
  direccion:        { caja: 'campo-direccion',     error: 'error-direccion'    },
  fecha_nacimiento: { caja: 'campo-fechanac',      error: 'error-fechanac'     }
};

/* Validación en tiempo real */
var ids = Object.keys(MAPA);
for (var i = 0; i < ids.length; i++) {
  (function (id) { // IIFE: captura el valor correcto de "id" en cada iteración del bucle
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () { // SELECT escucha "change"; los demás inputs escuchan "input"
      validarCampo(id);
    });
  })(ids[i]);
}

function validarCampo(id) {
  var el = document.getElementById(id); if (!el) return;
  var valor    = el.value;
  var esValido = REGLAS[id] ? REGLAS[id](valor) : true; // Ejecuta la regla del campo; si no tiene regla, se considera válido
  var caja  = document.getElementById(MAPA[id].caja);
  var error = document.getElementById(MAPA[id].error);
  if (caja) {
    caja.classList.toggle('valido', esValido && valor !== '');  // Borde verde: valor correcto y no vacío
    caja.classList.toggle('error',  !esValido && valor !== ''); // Borde rojo: valor incorrecto y no vacío
  }
  if (error) error.classList.toggle('visible', !esValido && valor !== ''); // Muestra el mensaje de error si el valor es inválido
}

/* ── Botón crear cuenta ── */
document.getElementById('botonCrearCuenta').addEventListener('click', function (e) {
  var todoValido = true; // Bandera: se vuelve false si algún campo no pasa la validación

  ids.forEach(function (id) { // Valida todos los campos al momento de intentar enviar el formulario
    var valor    = document.getElementById(id).value;
    var esValido = REGLAS[id] ? REGLAS[id](valor) : true;
    var caja  = document.getElementById(MAPA[id].caja);
    var error = document.getElementById(MAPA[id].error);
    if (caja)  { caja.classList.toggle('error',  !esValido); caja.classList.toggle('valido', esValido); }
    if (error) error.classList.toggle('visible', !esValido);
    if (!esValido) todoValido = false;
  });

  var acepto = document.getElementById('aceptaTerminos').checked; // Verifica si el checkbox de términos fue marcado
  document.getElementById('cajaTerminos').classList.toggle('error',    !acepto);
  document.getElementById('error-terminos').classList.toggle('visible', !acepto);
  if (!acepto) todoValido = false;

  if (!todoValido) {
    var primerError = document.querySelector('.campo-caja.error, .caja-terminos.error');
    if (primerError) primerError.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Desplaza la vista hasta el primer campo con error
    e.preventDefault(); // Bloquea el envío si hay errores
    return;
  }

  document.getElementById('exitoTitulo').textContent  = '¡Hola, ' + document.getElementById('nombres').value + '!'; // Personaliza el saludo con el nombre ingresado
  document.getElementById('exitoMensaje').textContent = 'Cuenta creada exitosamente.';
  document.getElementById('pantallaExito').classList.add('visible'); // Muestra la pantalla de confirmación
  setTimeout(function () { window.location.href = '../index.php'; }, 2400); // Redirige a la tienda después de 2.4 segundos
});

/* ── Enter ── */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') document.getElementById('botonCrearCuenta').click(); // Permite enviar el formulario presionando la tecla Enter
});
</script>
</body>
</html>