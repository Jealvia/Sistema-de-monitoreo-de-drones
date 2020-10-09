var num_viejo;

function myFunction() {
  const elemento = document.getElementById("navbarMenuHeroC");
  if (elemento.classList.contains("navbar-menu")) {
    elemento.classList.remove("navbar-menu");
  } else {
    elemento.classList.add("navbar-menu");
  }
}

//Al cargar la pagina trae los datos del dron guardado
$(document).ready(function(){
  $.ajax({
    type: 'GET',
    url: "/carga_datos", 
    success: function(result){
      dron = result.dron;
      numero_serie = dron[0].numero_serie;
      num_viejo = numero_serie;
      modelo = dron[0].modelo; 
      marca = dron[0].marca;
      capacidad = dron[0].capacidad;
      descripcion = dron[0].descripcion;
      $('#numero_serie').val(numero_serie);
      $('#modelo').val(modelo);
      $('#marca').val(marca);
      $('#capacidad').val(capacidad);
      $('#descripcion').val(descripcion);
    },
    error: function(){
      console.log("ERROR");
    }
  });
});

//Pasar datos de formulario a formato diccionario
function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}

//Tomar ID y enviarlo al servidor de dron
$("#conf").submit(function (e) {
  e.preventDefault(); // Avoid to execute the actual submit of the form.

  var form = $(this);
  var url = form.attr("action");
  datos = getFormData(form);
  datos["num_viejo"] = num_viejo;


  $.ajax({
    type: "PATCH",
    url: url,
    contentType: "application/json",
    data: JSON.stringify(datos), //Pasar a JSON para enviar
    success: function (data) {
      //success es una funcion que se utiliza si el servidor retorna informacion
      console.log(data);
      var target = document.querySelector("#myModal3");
      target.classList.add("is-active");

      //Cerrar ventana modal
      target
        .querySelector(".modal-background")
        .addEventListener("click", function () {
          target.classList.remove("is-active");
          location.href = "/";
        });

    },
    error: function () {
      console.log("Error");

      var target = document.querySelector("#myModal4");
      target.classList.add("is-active");

      //Cerrar ventana modal
      target
        .querySelector(".modal-background")
        .addEventListener("click", function () {
          target.classList.remove("is-active");
        });

    },
  });
});

$("#panel").click(function(){
    location.href = "/";
});
