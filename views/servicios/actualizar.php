<h1 class="nombre-pagina">Actualizar Servicio</h1>
<p class="descripcion-pagina">Modificar valores del formulario</p>

<?php 
    include_once __DIR__ . "/../templates/barra.php";
    include_once __DIR__ . "/../templates/alertas.php";

?>

<form method="POST" class="formulario"> <!--necesario quitar accion para no perder el id de get -->
    <?php include_once __DIR__ . "/formulario.php"; ?>

    <input type="submit" class="boton" value="Actualizar Servicio">
</form>