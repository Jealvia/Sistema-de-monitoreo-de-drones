var socket;
function myFunction() {
  const elemento = document.getElementById("navbarMenuHeroC");
  if (elemento.classList.contains("navbar-menu")) {
    elemento.classList.remove("navbar-menu");
  } else {
    elemento.classList.add("navbar-menu");
  }
}

//Funcion inhabilitar F5
function disableF5(e) {
  if ((e.which || e.keyCode) == 116 || (e.which || e.keyCode) == 82)
    e.preventDefault();
}

//Al ir a configuracion
$("button#configura").click(function () {
  $.ajax({
    type: "GET",
    url: "/config",
    success: function (data) {
      //success es una funcion que se utiliza si el servidor retorna informacion
      if (data == "ERROR") {
        console.log(data);
        var target = document.querySelector("#myModal5");
        target.classList.add("is-active");

        //Cerrar ventana modal
        target
          .querySelector(".modal-close")
          .addEventListener("click", function () {
            target.classList.remove("is-active");
            location.href = "/conf";
          });

        //Boton cancelar del modal
        target.querySelector(".ok").addEventListener("click", function () {
          target.classList.remove("is-active");
          location.href = "/conf";
        });
      } else {
        console.log(data);
        var target = document.querySelector("#myModal5");
        target.classList.add("is-active");

        //Cerrar ventana modal
        target
          .querySelector(".modal-close")
          .addEventListener("click", function () {
            target.classList.remove("is-active");
            location.href = "/edita";
          });

        //Boton cancelar del modal
        target.querySelector(".ok").addEventListener("click", function () {
          target.classList.remove("is-active");
          location.href = "/edita";
        });
      }
    },
    error: function () {
      console.log("Error");
    },
  });
});

//Funcion de conexion
function conectar(protocol) {
  $.ajax({
    url: "/conectar",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ protocolo: protocol }),
    success: function (data) {
      console.log(data);
      var target = document.querySelector("#myModal3");
      target.classList.add("is-active");

      //Cerrar ventana modal
      target
        .querySelector(".modal-close")
        .addEventListener("click", function () {
          target.classList.remove("is-active");
        });

      //Boton ok del modal
      target.querySelector(".ok").addEventListener("click", function () {
        target.classList.remove("is-active");
      });

      //Funcion del socket
      socket = io.connect("//" + document.domain + ":" + location.port);
      socket.on("connect", function () {
        socket.on("pyr_status", function (arg) {
          $("pre").text(JSON.stringify(arg, null, "  "));
        });
      });
    },
    error: function () {
      var target = document.querySelector("#myModal4");
      target.classList.add("is-active");

      //Cerrar ventana modal
      target
        .querySelector(".modal-close")
        .addEventListener("click", function () {
          target.classList.remove("is-active");
        });

      //Boton cancelar del modal
      target.querySelector(".ok").addEventListener("click", function () {
        target.classList.remove("is-active");
      });
    },
  });
}

//Carga completa del DOM
$(document).ready(function () {
  $("#titulo").hide();
  $("#protocolo").hide();
  $("#protocolo1").hide();
  $("#protocolo2").hide();
  $("h1").hide();
  $("pre").hide();
  $("#nuevos").hide();
  //Desactivar recarga de pagina
  $(document).on("keydown", disableF5);
});

//Ocultar secciones
$("#iniciar").click(function () {
  $.ajax({
    type: "GET",
    url: "/config",
    success: function (data) {
      //success es una funcion que se utiliza si el servidor retorna informacion
      if (data == "ERROR") {
        console.log(data);
        $("#cajita").text("DEBE REGISTRAR EL DRON ANTES DE INICIAR UNA CONEXIÓN");
        var target = document.querySelector("#myModal7");
        target.classList.add("is-active");

        //Cerrar ventana modal
        target
          .querySelector(".modal-close")
          .addEventListener("click", function () {
            target.classList.remove("is-active");
          });

        //Boton cancelar del modal
        target.querySelector(".ok").addEventListener("click", function () {
          target.classList.remove("is-active");
        });
      } else {
        console.log(data);
        $("#titulo").show();
        $("#protocolo").show();
        $("#protocolo1").show();
        $("#protocolo2").show();
        $("#nuevos").show();
        $("#iniciar").attr("disabled", true);
        $("#iniciar").html("¡Iniciado!");
        $("#cajita").text("RECUERDE QUE PUEDE REALIZAR MÁXIMO DOS CONEXIONES, UNA OCUPANDO EL PUERTO TCP Y OTRA OCUPANDO EL PUERTO UDP, ¡SI DESEA LIBERAR AMBOS PUERTOS Y VOLVER A TENERLOS DISPONIBLES PARA EFECTUAR NUEVAS CONEXIONES A ESTE DRON, PUEDE USAR EL BOTÓN ROJO!");
        console.log(data);
        var target = document.querySelector("#myModal7");
        target.classList.add("is-active");

        //Cerrar ventana modal
        target
          .querySelector(".modal-close")
          .addEventListener("click", function () {
            target.classList.remove("is-active");
          });

        //Boton cancelar del modal
        target.querySelector(".ok").addEventListener("click", function () {
          target.classList.remove("is-active");
        });
      }
    },
    error: function () {
      console.log("Error");
    },
  });
});

//Manejo de modales y conexiones al dron con TCP (Los eventos se agregan en la carga del DOM)
document.querySelectorAll(".modal-button1").forEach(function (el) {
  let protocol = el.id;
  el.addEventListener("click", function () {
    var target = document.querySelector(el.getAttribute("data-target"));

    target.classList.add("is-active");

    //Cerrar ventana modal
    target.querySelector(".modal-close").addEventListener("click", function () {
      target.classList.remove("is-active");
    });

    //Boton conectar a dron del modal
    target.querySelector(".conectar").addEventListener("click", function () {
      target.classList.remove("is-active");
      conectar(protocol);
      $("#tcp").attr("disabled", true);
      $("h1").show();
      $("pre").show();
    });

    //Boton cancelar del modal
    target.querySelector(".cancelar").addEventListener("click", function () {
      target.classList.remove("is-active");
    });
  });
});

//Manejo de modales y conexiones al dron con UDP (Los eventos se agregan en la carga del DOM)
document.querySelectorAll(".modal-button2").forEach(function (el) {
  let protocol = el.id;
  el.addEventListener("click", function () {
    var target = document.querySelector(el.getAttribute("data-target"));

    target.classList.add("is-active");

    //Cerrar ventana modal
    target.querySelector(".modal-close").addEventListener("click", function () {
      target.classList.remove("is-active");
    });

    //Boton conectar a dron del modal
    target.querySelector(".conectar").addEventListener("click", function () {
      target.classList.remove("is-active");
      conectar(protocol);
      $("#udp").attr("disabled", true);
      $("h1").show();
      $("pre").show();
    });

    //Boton cancelar del modal
    target.querySelector(".cancelar").addEventListener("click", function () {
      target.classList.remove("is-active");
    });
  });
});

//Modal auxiliar
document.querySelectorAll(".modal-button8").forEach(function (el) {
  let protocol = el.id;
  el.addEventListener("click", function () {
    var target = document.querySelector(el.getAttribute("data-target"));

    target.classList.add("is-active");

    //Boton OK del modal
    target.querySelector(".okis").addEventListener("click", function () {
      target.classList.remove("is-active");
      location.href = "/";
    });

    //Boton cancelar del modal
    target.querySelector(".ya_no").addEventListener("click", function () {
      target.classList.remove("is-active");
    });

  });
});
