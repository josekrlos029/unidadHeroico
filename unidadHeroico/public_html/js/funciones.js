/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var lat, lng, mapa;
var markersArray = [];
function cargarMapa(){
    $("#mapa").height($(document).height() / 2.5);
    navigator.geolocation.getCurrentPosition(function(position) {
        
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        
        var mapOptions = {
            center: new google.maps.LatLng(lat, lng),
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        mapa = new google.maps.Map(document.getElementById("mapa"), mapOptions);
    
    }, function() {
        alert("Error al Obtener la Posición de su dispositivo, intente activar el GPS !");
        return null;
    }, {enableHighAccuracy: true});


    
}

function removeMarkers() {
    if (markersArray) {
        for (var i in markersArray) {
            markersArray[i].setMap(null);
        }
    }
}

function ubicar( latU, lngU) {
    
    removeMarkers();
    var myLatlng = new google.maps.LatLng(lat, lng);
    var marker = new google.maps.Marker({
        position: myLatlng,
        animation: google.maps.Animation.DROP,
        map: mapa,
        title: "Tu ubicacion"
    });
    
    markersArray.push(marker);
    
    var myLatlng2 = new google.maps.LatLng(latU, lngU);
    var marker = new google.maps.Marker({
        position: myLatlng2,
        animation: google.maps.Animation.DROP,
        map: mapa,
        title: "Tu ubicacion"
    });
    
    markersArray.push(marker);
    
    var flightPlanCoordinates = [
        myLatlng,
        myLatlng2
    ];
  var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  flightPath.setMap(mapa);
            }

            
function aceptar(idPanico){
    var data = {
        idPanico: idPanico
    };
    
    var url = "http://heroico.tudomicilio.net/administrador/cambiarEstadoPanico";
    
    $.ajax({
        type: "POST",
        url: url,
        data: data
    }).done(function(msg) {
        
        var json = eval("(" + msg + ")");
        if (json.msj == "exito") {
            alert("Solicitud Aceptada Correctamente");
            cargarPanicos();
        } else if (json.msj == "no") {
            alert("No se pudo realizar tu solicitud, intenta mas tarde");
        } else {
            alert("No se pudo realizar tu solicitud, intenta mas tarde");
        }

    });
}

function cargarPanicos(){
    
    var url = "http://heroico.tudomicilio.net/administrador/leerPanico";
    
    $.ajax({
        type: "POST",
        url: url,
        data: {}
    }).done(function(msg) {
        
        var json = eval("(" + msg + ")");
        
        var msj = "<ul>Pendientes";
        for(var i = 0 ; i<json.pendientes.length; i++){
            var lat =json.pendientes[i].lat;
            var lng  = json.pendientes[i].lng;
            msj += "<li>"
                + '<p><button class="btn" onclick="ubicar('+lat+', '+lng+')">Ubicar</button></p>'
                +"<h2>"+json.pendientes[i].usuario+"</h2>"
                    + "<p>Tel: "+json.pendientes[i].telefono+"</p>"
                    +' <p><button class="btn-azul" onclick=aceptar("'+json.pendientes[i].idPanico+'")>Aceptar</button></p></li>';
            
        }
        msj += "</ul><ul>Aceptados";
         
        for(var j = 0 ; j<json.aceptadas.length; j++){
            var lat =json.aceptadas[j].lat;
           
            var lng  = json.aceptadas[j].lng;
            msj += "<li>"
            + '<p><button class="btn" onclick="ubicar('+lat+', '+lng+')">Ubicar</button></p>'
                    +"<h2>"+json.aceptadas[j].usuario+"</h2>"
                    + "<p>Tel: "+json.aceptadas[j].telefono+"</p>";
                   
            
        }
        msj += "</ul>";
        $("#contenido").html(msj);
    });
    
}


function update() {

    var regid = localStorage.getItem("regId");
    
    var data = {
        regId: regid
    };

    var url = "http://heroico.tudomicilio.net/administrador/actualizarUnidad";
    
    $.ajax({
        type: "POST",
        url: url,
        data: data
    }).done(function(msg) {
        
        var json = eval("(" + msg + ")");
        if (json.msj == "exito") {
            //alert("ok");

        } else if (json.msj == "no") {
            alert("No puedes recibir pedidos, intenta ingresando nuevamente.");
        } else {
            alert("Error en el servidor, contactate con la empresa TuDomicilio ");
        }

    });

}

var server = "heroico.tudomicilio.net";

function initPush(){
    var pushNotification = window.plugins.pushNotification;

    if (device.platform == 'android' || device.platform == 'Android')
    {
        //PARA ANDROID
        pushNotification.register(
                successHandler,
                errorHandler, {
                    "senderID": "825868744821", //ID del proyecto  (Debes crear un proyecto en google developers -> https://console.developers.google.com/project )
                    "ecb": "onNotificationGCM"  //Metodo cuando llega una notificación
                });
    }
    else
    {
        //Para IOS
        pushNotification.register(
                tokenHandler,
                errorHandler, {
                    "badge": "true",
                    "sound": "true",
                    "alert": "true",
                    "ecb": "onNotificationAPN"
                });
    }
   
}


function onNotificationGCM(e) {

    switch (e.event)
    {
        case 'registered':
            if (e.regid.length > 0)
            {
                localStorage.setItem("regId", e.regid);
                
                update();
            }
            break;

        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if (e.foreground)
            {
                //$("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');
                
                navigator.notification.vibrate(500);
                alert(e.payload.message);
                               // if the notification contains a soundname, play it.
                //var my_media = new Media("/android_asset/www/" + e.soundname);
                //my_media.play();
            }
            else
            {  // otherwise we were launched because the user touched a notification in the notification tray.
                if (e.coldstart)
                {
                    //$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
                    
                        navigator.notification.vibrate(500);
                        alert(e.payload.message);
                }
                else
                {
                    //$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
                    if (e.payload.confirmacion) {
                        
                        alert(e.payload.message);
                    }
                }
            }

            //$("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
            //$("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
            break;

        case 'error':
            alert('Error: ' + e.msg);
            break;

        default:
            //$("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
            break;
    }
}

function onNotificationAPN(event) {
    
        navigator.notification.vibrate(500);
        alert(event.alert);
    
    if (event.sound)
    {
        var snd = new Media(event.sound);
        snd.play();
    }

    if (event.badge)
    {
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
}

function successHandler(result) {
    //alert('result = ' + result);
}

function errorHandler(error) {
    alert('error = ' + error);
}

function tokenHandler(result) {
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
    localStorage.setItem("token", result);
}
