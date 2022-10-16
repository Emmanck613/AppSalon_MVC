<h1 class="nombre-pagina">Recuperar Password</h1>
<p class="descripcion-pagina">Coloca tu password a continuacion</p>
<?php
    include_once __DIR__ . "/../templates/alertas.php"
?>
<?php if($error) return; ?> <!--Si retorna null no se muestra nada -->
<form class="formulario" method="POST">
    <div class="campo">
        <label for="password">Password</label>
        <input
            type="password"
            id="password"
            name="password"
            placeholder="Nuevo Password"
            >
    </div>
    <input type="submit" class="boton" value="Guardar Nuevo Password">
</form>
<div class="acciones">
    <a href="/">Ya tienes cuenta? Iniciar Session.</a>
    <a href="/crear-cuenta">Aun no tienes cuenta? Crear una.</a>
</div>
