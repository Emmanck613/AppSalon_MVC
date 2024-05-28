<?php 

namespace Controllers;

use Classes\Email;
use Model\Usuario;
use MVC\Router;

class LoginController {
    public static function login(Router $router){
        $alertas = [];

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $auth = new Usuario($_POST);

            $alertas = $auth->validarLogin();

           if(empty($alertas)){
            //comprobar si existe usuario
            $usuario = Usuario::where('email', $auth->email);

            if($usuario){
                //verificar password cuando existe usuario
                if ($usuario->comprobarPasswordAndVerificado($auth->password) ){
                    //Authenticar usuario
                    session_start();

                    $_SESSION['id'] = $usuario->id;
                    $_SESSION['nombre'] = $usuario->nombre . " " . $usuario->apellido;
                    $_SESSION['email'] = $usuario->email;
                    $_SESSION['login'] = true;

                    //redireccionamiento
                    if($usuario->admin === "1") {
                        //Agregar admin a la sesion
                        $_SESSION['admin'] = $usuario->admin ?? null;
                        header('Location: /admin');

                    } else {
                        header('Location: /cita');
                    }

                }
            } else {
                Usuario::setAlerta('error', 'Usuario no encontrado');
            }
        }
    }

        $alertas = Usuario::getAlertas();

        $router->render('auth/login', [
            'alertas' => $alertas
        ]);
    }

    public static function logout(){
        session_start();

        $_SESSION = [];

        header('Location: /');
    }

    public static function olvide(Router $router){
        $alertas = [];

        if($_SERVER['REQUEST_METHOD'] === "POST") {
            $auth = new Usuario($_POST);
            $alertas = $auth->validarEmail();

            if(empty($alertas)){
                $usuario = Usuario::where('email', $auth->email);
                
                if($usuario && $usuario->confirmado === "1"){
                    //genera token de solo uso
                    $usuario->crearToken();
                    $usuario->guardar();

                    //Enviar Email
                    $email = new Email($usuario->email, $usuario->nombre, $usuario->token);
                    $email->enviarInstrucciones();

                    //Alerta exito
                    Usuario::setAlerta('exito', 'Revisa tu email');
                } else{
                    Usuario::setAlerta('error', 'El usuario no existe o no esta confirmado');
                }
            }
        }
        $alertas = Usuario::getAlertas();

        $router ->render('auth/olvide-password', [
            'alertas' => $alertas
        ]);    
    }

    public static function recuperar(Router $router){
        $alertas = [];
        $error = false; //nos servira para ocultar el formulario

        $token = s($_GET['token']);

        //Buscar usuario por token
        $usuario = Usuario::where('token', $token);

        if(empty($usuario)){
            Usuario::setAlerta('error', "Token no valido");
            $error = true;
        }

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            //Leer el nuevo password y guardarlo

            $password = new Usuario($_POST); //leemos desde password porque $usuario contiene la info de la bd
            $alertas = $password->validarPassword();

            if(empty($alertas)){
                $usuario->password = null;

                $usuario->password = $password->password;
                $usuario->hashPassword();
                $usuario->token = null;

                $resultado = $usuario->guardar();
                if($resultado) {
                    header('Location /');
                }
            }
        }

        $alertas = Usuario::getAlertas();
        $router ->render('auth/recuperar-password', [
            'alertas' => $alertas,
            'error' => $error
        ]);
    }

    public static function crear(Router $router){
        $usuario = new Usuario; //vamos a instanciar usuario

        //Alertas vacias
        $alertas = [];
        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $usuario->sincronizar($_POST); 
            //metodo sincronizar va sincronizar cada dato dentro de post con el objeto vacio con los nuevos datos de post
            $alertas = $usuario->validarNuevaCuenta();

            //revisar si la alerta esta vacio
            if(empty($alertas)){
                //verificar que el usuario no este registrado
                $resultado = $usuario->existeUsuario();
                
                if($resultado -> num_rows){
                    //si existe resultados, lo manda a vista
                    $alertas = Usuario::getAlertas();
                } else {
                    //No esta registrado
                    //hashear pass
                    $usuario->hashPassword();

                    //GENERAR UN TOKEN UNICO
                    $usuario->crearToken();

                    //Enviar email
                    $email = new Email($usuario->nombre, $usuario->email, 
                    $usuario->token);

                    $email->enviarConfirmacion();

                    //crear usuario
                    $resultado = $usuario->guardar();

                    if($resultado){
                        header('Location: /mensaje');
                    }
                }
            }
        }

        $router ->render('auth/crear-cuenta', [
            'usuario' => $usuario,
            'alertas' => $alertas
        ]);
    }

    public static function mensaje(Router $router){

        $router->render('auth/mensaje');
    }

    public static function confirmar(Router $router){
        $alertas = [];

        $token = s($_GET['token']);

        $usuario = Usuario::where('token', $token);

        if(empty($usuario)){
            //Mostrar mensaje de error
            Usuario::setAlerta('error', 'Token no valido'); //al ser un meth. estatico no es necesario instanciar
        } else {
            //Modificar a usuario confirmado
            $usuario->confirmado = "1";
            $usuario->token = null; //despues de confirmar borrar token
            $usuario->guardar();
            Usuario::setAlerta('exito', 'Cuenta Comprobada Correctamente');
        }
        //Obtener Alertas
        $alertas = Usuario::getAlertas();
        //Renderizar vista
        $router->render('auth/confirmar-cuenta', [
            'alertas' => $alertas
        ]);
    }
}