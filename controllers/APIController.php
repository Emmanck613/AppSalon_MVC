<?php
namespace Controllers;

use Model\Cita;
use Model\CitaServicio;
use Model\Servicio;

class APIController {

    public static function index(){
        $servicios = Servicio::all();

        //convertir arreglo a json
        echo json_encode($servicios); 
    }

    public static function guardar( ){
        //almacena la cita y devuelve ID
        $cita = new Cita($_POST);
        $resultado = $cita->guardar();

        $id = $resultado['id'];

        //almacena la cita y el Servicio
        //vamos a separar el arreglo por ,
        $idServicios = explode(",", $_POST['servicios']);
        //almacena los servicios con el id de la cita
        foreach($idServicios as $idServicio) {
            $args = [
                'citaId' => $id,
                'servicioId' => $idServicio
            ];
            $citaServicio = new CitaServicio($args);
            $citaServicio->guardar();
        }
       //retornar respuesta
        // $respuesta = [
        //     'resultado' => $resultado
        // ];

        echo json_encode(['resultado' => $resultado]);
    }

    
    public static function eliminar() {
        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $id = $_POST['id']; //nos trai el valor id del admin/index
            $cita = Cita::find($id);
            $cita->eliminar();
            //nos va dirigir hacia la misma pagina donde estabamos
            header('Location:' . $_SERVER['HTTP_REFERER']);
        }
    }
}