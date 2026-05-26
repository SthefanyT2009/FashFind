<?php
$route = $_GET['route'] ?? 'login';

switch($route){

case 'registro':
    require BASE_PATH . '/controllers/AuthController.php';
    (new AuthController())->registro();
break;

case 'dashboard_administrador':
    require BASE_PATH . '/views/Interfaz/vistaAdministrador.php';
break;

case 'dashboard_vendedor':
    require BASE_PATH . '/views/Interfaz/vistaVendedor.php';
break;

case 'dashboard_domiciliario':
    require BASE_PATH . '/views/Interfaz/vistaDomiciliario.php';
break;

case 'dashboard_cliente':
    require BASE_PATH . '/views/Interfaz/vistaCliente.php';
break;
 
case 'logout':
    require BASE_PATH . '/controllers/AuthController.php';
    (new AuthController())->logout();
break;
}
?>