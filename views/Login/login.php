<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Iniciar Sesión — FashF</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
  <link rel="stylesheet" href="loginRegistroEstilos.css"/>
</head>
<body>

<div class="pantalla-exito" id="pantallaExito">
  <div class="icono-exito"><i class="fa-solid fa-check"></i></div>
  <h3 id="exitoTitulo">¡Bienvenido!</h3>
  <p id="exitoMensaje">Redirigiendo…</p>
</div>

<div class="caja">
  <h2 class="seccion-titulo">Iniciar Sesión</h2>

  <form method="POST">

    <div class="campo-grupo">
      <label>Nombre de usuario <span class="obligatorio">*</span></label>
      <div class="campo-caja" id="campo-nombre_usuario">
        <i class="fa-solid fa-user"></i>
        <input type="text" id="nombre_usuario" name="nombre_usuario" placeholder="Tu nombre de usuario"/>
      </div>
      <div class="mensaje-error" id="error-nombre_usuario">
        <i class="fa-solid fa-circle-exclamation"></i>&nbsp;Nombre de usuario inválido
      </div>
    </div>

    <div class="campo-grupo">
      <label>Contraseña <span class="obligatorio">*</span></label>
      <div class="campo-caja" id="campo-contraseña">
        <i class="fa-solid fa-lock"></i>
        <input type="password" id="contrasena" name="contrasena" placeholder="Contraseña"/>
        <button type="button" class="boton-ojo" id="ojoContrasena">
          <i class="fa-solid fa-eye"></i>
        </button>
      </div>
      <div class="mensaje-error" id="error-contraseña">
        <i class="fa-solid fa-circle-exclamation"></i>&nbsp;Mínimo 6 caracteres
      </div>
    </div>

    <div class="fila-olvide"><a href="#">¿Olvidaste tu contraseña?</a></div>

    <button type="submit" class="boton boton-oscuro" id="botonIngresar">
      <i class="fa-solid fa-right-to-bracket"></i> Ingresar
    </button>

  </form>

  <div class="enlace-cambio">
    ¿No tienes cuenta?
    <button class="boton-cambio" onclick="window.location.href='registro.php'">Regístrate gratis →</button>
  </div>

  <a href="../../index.php" class="enlace-volver">
    <i class="fa-solid fa-arrow-left"></i> Volver a la tienda
  </a>

</div>

<script>
/* ── Botón ojo ── */
document.getElementById('ojoContrasena').addEventListener('click', function () {
  var input = document.getElementById('contrasena');
  input.type = input.type === 'password' ? 'text' : 'password'; // Alterna entre ocultar y mostrar la contraseña
  this.querySelector('i').className = input.type === 'text'
    ? 'fa-solid fa-eye-slash' // Ícono cuando la contraseña es visible
    : 'fa-solid fa-eye';      // Ícono cuando la contraseña está oculta
});

/* ── Validar y entrar ── */
document.getElementById('botonIngresar').addEventListener('click', function (e) {
  var usuario   = document.getElementById('nombre_usuario').value.trim(); // Obtiene el nombre de usuario y elimina espacios al inicio y al final
  var pass      = document.getElementById('contrasena').value;
  var usuarioOk = usuario.length >= 3; // Valida que el nombre de usuario tenga al menos 3 caracteres
  var passOk    = pass.length >= 6;    // Valida que la contraseña tenga al menos 6 caracteres

  document.getElementById('campo-nombre_usuario').classList.toggle('error',  !usuarioOk); // Borde rojo si el nombre de usuario es inválido
  document.getElementById('campo-nombre_usuario').classList.toggle('valido',  usuarioOk); // Borde verde si el nombre de usuario es válido
  document.getElementById('error-nombre_usuario').classList.toggle('visible', !usuarioOk); // Muestra el mensaje de error si el nombre de usuario es inválido

  document.getElementById('campo-contraseña').classList.toggle('error',  !passOk); // Borde rojo si la contraseña es inválida
  document.getElementById('campo-contraseña').classList.toggle('valido',  passOk); // Borde verde si la contraseña es válida
  document.getElementById('error-contraseña').classList.toggle('visible', !passOk); // Muestra el mensaje de error si la contraseña es inválida

  if (usuarioOk && passOk) { // Solo procede si ambos campos son válidos
    document.getElementById('exitoTitulo').textContent  = '¡Bienvenido de vuelta!'; // Personaliza el título de la pantalla de éxito
    document.getElementById('exitoMensaje').textContent = 'Accediendo a tu cuenta…';
    document.getElementById('pantallaExito').classList.add('visible'); // Muestra la pantalla de confirmación
    setTimeout(function () { window.location.href = '../index.php'; }, 2400); // Redirige a la tienda después de 2.4 segundos
  } else {
    e.preventDefault(); // Bloquea el envío si hay errores
  }
});

/* ── Enter ── */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') document.getElementById('botonIngresar').click(); // Permite iniciar sesión presionando la tecla Enter
});
</script>
</body>
</html>