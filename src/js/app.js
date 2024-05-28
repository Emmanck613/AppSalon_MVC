let paso =1;
let pasoInicial = 1;
let pasoFinal = 3;

//objetos en js funcionan como un let
const cita = {
    id: '',
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', function(){
    iniciarApp();
});

function iniciarApp(){
    mostrarSeccion(); //mostrar y ocultar secciones
    tabs(); //cambia la seccion cuando se presiona los tab
    botonesPaginador(); //agregar o quita los botnes paginador
    paginaSiguiente();
    paginaAnterior();

    consultarAPI(); //consulta API en backend

    idCliente();
    nombreCliente(); //agregar nombre del cliente al obj cita
    seleccionarFecha(); //add fecha al obj cita
    seleccionarHora(); //add hora al obj cita

    mostrarResumen(); //resumen de cita

}

function mostrarSeccion(){

    //ocultar seccion que tenga clase mostrar
    const seccionAnterior = document.querySelector('.mostrar');
   
    if(seccionAnterior){
        seccionAnterior.classList.remove('mostrar');//si tiene clase mostrar, la quita    
    }

    //selecionar la seccion con el paso
    const pasoSelector = `#paso-${paso}`;
    const seccion = document.querySelector(pasoSelector);
    
    seccion.classList.add('mostrar');
    //quitar la clase actual al tab anterior
    const tabAnterior = document.querySelector('.actual');
    if(tabAnterior){
        tabAnterior.classList.remove('actual');
    }

    //resaltar el actual
    const tab = document.querySelector(`[data-paso= "${paso}"]`);
    tab.classList.add('actual');
}

function tabs(){
    const botones = document.querySelectorAll('.tabs button');
    
    botones.forEach( boton => {
        boton.addEventListener('click', function(e) {
            paso = parseInt( e.target.dataset.paso );
            mostrarSeccion();
            
            botonesPaginador();

            if(paso ===3 ){
                mostrarResumen();
            }
        });
    });
}

function botonesPaginador(){
    const paginaAnterior = document.querySelector('#anterior');
    const paginaSiguiente = document.querySelector('#siguiente');
    
    if(paso === 1){
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    } else if (paso === 3){
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.add('ocultar');
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }

    mostrarSeccion();
}

function paginaAnterior(){
    const paginaAnterior = document.querySelector('#anterior');
    
    paginaAnterior.addEventListener('click', function() {
        
        if(paso <= pasoInicial ) return;
        paso--;

        botonesPaginador();
    })

}

function paginaSiguiente(){
    const paginaSiguiente = document.querySelector('#siguiente');
    
    paginaSiguiente.addEventListener('click', function() {
        if(paso >= pasoFinal ) return;
        paso++;

        botonesPaginador();
    })

}

async function consultarAPI(){
    //con la funcion async podemos arrancar dos funciones a la vez.
    try {
        const url = 'http://localhost:3000/api/servicios';
        const resultado = await fetch(url); //fetch nos permitie consumir el servicio(url)
        //await. Lo que hace es esperar que se descargue todos los recursos y no permite la ejecucion de mas codigo
        const servicios = await resultado.json();
        mostrarServicios(servicios);

    } catch (error) {
        console.log(error);

    }
}

function mostrarServicios(servicios) {
    servicios.forEach( servicio => {
        const {id, nombre, precio } = servicio;

        const nombreServicio = document.createElement('P');
        nombreServicio.classList.add('nombre-servicio');
        nombreServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.classList.add('precio-servicio');
        precioServicio.textContent = `$${precio}`;

        const servicioDiv = document.createElement('DIV');
        servicioDiv.classList.add('servicio');
        servicioDiv.dataset.idServicio = id;
        servicioDiv.onclick = function() {
            seleccionarServicio(servicio); //con un callback podemos escoger un solo servicio
        };

        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);

        document.querySelector('#servicios').appendChild(servicioDiv);
        
    });

}
//servicio sera el objeto completo que estamos selecionando
//servicios es el objeto que tiene info de la citas
function seleccionarServicio(servicio){
    const { id } = servicio; //extramer id //usamos destructuring, igual a servicio.id
    const { servicios }  = cita; //extraer el arreglo de servicio
    
    //identificar elemento que se le da click
    const divServicio = document.querySelector(`[data-id-servicio="${id}"]`);

    //some va iterar sobre el arreglo y retorna t o f si existe un elemento en el arreglo
    //en este caso es un arreglo de objetos con arrow functions
    if( servicios.some( agregado => agregado.id === id)){
        //Eliminarlo. //filter nos permite sacar un elemento basado en cierta cond
        cita.servicios = servicios.filter( agregado => agregado.id !== id); 
        divServicio.classList.remove('selecionado'); //agregar clase selecionado

    } else {
        //Agregarlo
        //tomo una copia del arreglo de servicio y le paso el nuevo servicio
        cita.servicios = [...servicios, servicio];
        divServicio.classList.add('selecionado'); //agregar clase selecionado

    }
}

function idCliente() {
    cita.id = document.querySelector('#id').value;
}

function nombreCliente() {
    cita.nombre = document.querySelector('#nombre').value;
}

function seleccionarFecha() {
    const inputFecha = document.querySelector('#fecha');    
    inputFecha.addEventListener('input', function(e) {

        //pasar el evento al function
        const dia = new Date(e.target.value).getUTCDay();
       
        if( [6, 0].includes(dia) ){
            e.target.value = '';
            mostrarAlerta('Fines de semana no permitidos', 'error', '.formulario');
        } else{
            cita.fecha = e.target.value;
        }

    });
}

function seleccionarHora() {
    const inputHora = document.querySelector('#hora');    

    inputHora.addEventListener('input', function(e) {

        const horaCita = e.target.value;
        const hora = horaCita.split(":")[0];

        if( hora < 10 || hora > 18 ){
            e.target.value = '';
            mostrarAlerta('Hora no valida', 'error', '.formulario');

        } else{
            cita.hora = e.target.value;
        }

    });
}

function mostrarAlerta(mensaje, tipo, elemento, desaparece = true) {
   //Prevenir generar mas alertas
   const alertaPrevia = document.querySelector('.alerta');
   if(alertaPrevia){
    alertaPrevia.remove();
   }

    //scripting para crear alerta
    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');
    alerta.classList.add(tipo);

    const referencia = document.querySelector(elemento);
    referencia.appendChild(alerta);

    if(desaparece) {
         //eliminar alerta
        setTimeout( () => {
        alerta.remove();
            }, 3000 );
    }
}

function mostrarResumen() {
    const resumen = document.querySelector('.contenido-resumen');
    //Limpiar el contenido resumen
    while(resumen.firstChild){
        resumen.removeChild(resumen.firstChild);
    }

    //iteramos sobre el objeto cita y buscamos que no sea vacio
    if(Object.values(cita).includes('') || cita.servicios.length === 0 ){
        mostrarAlerta('Faltan datos de Servicios, Fecha U Hora', 'error', '.contenido-resumen',
        false);

        return;
    } 

    //Formatear el div de resumen
    //aplicar destructuring ya que las variables tendran valores
    const { nombre, fecha, hora, servicios } = cita;
    
    //headin para servicios en resumen
    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';
    resumen.appendChild(headingServicios);

    //vamos ir accediendo a los servicios uno por uno
    //iteramos y mostramos los servicios
    servicios.forEach(servicio => {
        const { id, precio, nombre } = servicio;

        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.innerHTML = `<span>Precio:</span> $${precio}`;

        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);
    
        resumen.appendChild(contenedorServicio);
    })

     //headin para cita en resumen
     const headingCita = document.createElement('H3');
     headingCita.textContent = 'Resumen de Cita';
     resumen.appendChild(headingCita);

      const nombreCliente = document.createElement('P');
      nombreCliente.innerHTML = `<span>Nombre:</span> ${cita.nombre}`;
      
      //Formatear la fecha en esp
    const fechObj = new Date(fecha);
    const mes = fechObj.getMonth();
    const dia = fechObj.getDate() + 2;
    const year = fechObj.getFullYear();

    const fechaUTC = new Date( Date.UTC(year, mes, dia) ); 

    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const fechaFormateada = fechaUTC.toLocaleDateString('es-MX', opciones);


      const fechaCita = document.createElement('P');
      fechaCita.innerHTML = `<span>Fecha:</span> ${fechaFormateada}`;
      
      const horaCita = document.createElement('P');
      horaCita.innerHTML = `<span>Hora:</span> ${hora} Horas`;

    //Boton para crear una cita
    const botonReservar = document.createElement('BUTTON');
    botonReservar.classList.add('boton');
    botonReservar.textContent = 'Reservar Cita';
    botonReservar.onclick = reservarCita; //si pasaramos un valor a la funcion, tendriamos q usar un callback

    resumen.appendChild(nombreCliente)
    resumen.appendChild(fechaCita)
    resumen.appendChild(horaCita)

    resumen.appendChild(botonReservar);
}

async function reservarCita() {
    const { nombre, fecha, hora, servicios, id } = cita;

    const idServicio = servicios.map( servicio => servicio.id );

    const datos = new FormData();
    datos.append('fecha', fecha);
    datos.append('hora', hora);
    datos.append('usuarioId', id);
    datos.append('servicios', idServicio);

    //console.log([...datos]) //permite crear una copia y ver sus valores

    try {
          //peticion hacia la api
    const url = 'http://localhost:3000/api/citas'
    const respuesta = await fetch( url, {
        method: 'POST',
        body: datos //enviamos los datos de formData para ser enviado como parte de la petic. post
    });
    
    const resultado = await respuesta.json();

    if(resultado.resultado){
        Swal.fire({
            icon: 'success',
            title: 'Cita creada',
            text: 'Cita creada correctamente!',
            button: 'OK!'
          }).then ( () => {
             setTimeout(() => {
                window.location.reload();

             }, 3000);
          })
    }
    
    } catch (error){
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al guardar la cita!'
          })
    }

  
}
