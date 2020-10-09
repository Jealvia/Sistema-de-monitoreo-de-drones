from flask import Flask, jsonify, request, render_template, Response
from flask_socketio import SocketIO
from flask_pymongo import PyMongo
import json
from bson.objectid import ObjectId
from bson import json_util
import dronekit
import socket
import threading
import time
from pymavlink import mavutil  # Necesaria para las rutas modo AUTO
import math
import requests
from flask_cors import CORS

#Definicion de url de la nube (Servidor principal en la nube)
URL_NUBE="http://10.0.2.2:5000/"
#Definicion de url de la nube (Servidor principal en localhost)
#URL_NUBE="http://127.0.0.1:5000/"

#SECCION DE CREACION DE SOCKET DE ESCUCHA
socket.socket._bind = socket.socket.bind
def my_socket_bind(self, *args, **kwargs):
    self.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    return socket.socket._bind(self, *args, **kwargs)
socket.socket.bind = my_socket_bind

#SECCION DE CONFIGURACION DE FLASK
app = Flask(__name__)
CORS(app, support_credentials=True)
app.config["MONGO_URI"] = "mongodb://localhost:27017/prueba_arduino"
mongo = PyMongo(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

#SECCION DE ENDPOINTS
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/conf')
def conf():
    return render_template('config.html')

@app.route('/edita')
def edita():
    return render_template('edita.html')

@app.route('/carga_datos', methods=['GET'])
def carga():
    if request.method == 'GET':
        data = mongo.db.Dron.find({})
        return Response(
            json_util.dumps({'dron':data}),
            mimetype='application/json'
        )

@app.route("/conectar", methods=['POST'])
def conectar():
    if request.method == 'POST':
        data = request.get_json() 
        protocol = data.get('protocolo', None)
        if(protocol == "tcp"):
            # Conexion con el SITL ejecutado con Cygwin64 usando TCP
            target = "tcp:127.0.0.1:5762"
            respuesta = {"ESTADO": "Conexion exitosa con TCP"}
        elif(protocol == "udp"):
            target = "127.0.0.1:14550"  # Conexion con el SITL ejecutado con Cygwin64 usando UDP
            respuesta = {"ESTADO": "Conexion exitosa con UDP"}
        #Conexion con el vehiculo  
        dron = dronekit.connect(target, wait_ready=True) # wait_ready = True es necesario
        vehiculo.append(dron)
        resp = []
        resp.append(respuesta)
        ubicacionInicial = {"latitud":dron.location.global_frame.lat, "longitud":dron.location.global_frame.lon,"altitud":dron.location.global_frame.alt}
        resp.append(ubicacionInicial)
        response = jsonify(resp)
        #Guardado de conexion
        data = mongo.db.Dron.find({})
        tmp = list(data)
        dron_base = tmp[0]
        numero_serie = dron_base['numero_serie']
        data_send={
            'dron_id':numero_serie
        }
        requests.post(URL_NUBE+'data',json = data_send)
        #Crear Hilo
        vehiclethread2 = threading.Thread(target=pyr)
        vehiclethread2.start() #Iniciar Hilo
        return response

@app.route("/config", methods=['GET',"POST","PATCH"])
def config():
    if request.method == 'GET':
        data = mongo.db.Dron.find({})
        tmp = list(data)
        if(len(tmp)>0):
            dron_base = tmp[0]
            return "EXITO"
        else:
            return "ERROR"
    #Guardar datos en MongoDB
    if request.method == 'POST':
        data = request.get_json()
        if data.get('descripcion', None) is not None and data.get('modelo', None) is not None and data.get('numero_serie', None) is not None and data.get('marca', None) is not None and data.get('capacidad', None) is not None:
            mongo.db.Dron.insert_one(data)
            return jsonify({'status': 'success', 'message': 'Dron creado exitosamente'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parametros erroneos'}), 400
    #Actualizar datos en MongoDB
    if request.method == 'PATCH':
        data = request.get_json()
        datos = dict(data)
        num_viejo = datos["num_viejo"]
        print(num_viejo)
        mongo.db.Dron.update_one({'numero_serie': str(num_viejo)}, {
                                         '$set': data})
        return jsonify({'status': 'success', 'message': 'Dron actualizado exitosamente'}), 200

#***USADA PARA PROBAR CLIENTE REST (SEGURAMENTE SE ELIMINA EN FUTURO)***
@app.route("/mision", methods=['GET', 'POST'])
def mission():
    if request.method == 'POST':
        response = request.get_json() 
        #Si el dron se ha desconectado, cancela la mision. Deberia volver a conectarse antes
        if len(vehiculo) > 0: 
            mision.append(response) #Guardo la lista de rutas en esta lista auxiliar
            return jsonify({"EXITO": "Solicitud procesada"}) 
        else:
            return jsonify({"ERROR": "No hay ningun dron conectado"})


#SECCION DE FUNCIONES

#Funcion llamada en distancia_actual_waypoint
def obtener_distancia_metros(aUbicacion1, aUbicacion2):
    #Devuelve la distancia de tierra en metros entre ambos objetos LocationGlobal
    dlat = aUbicacion2.lat - aUbicacion1.lat
    dlon = aUbicacion2.lon - aUbicacion1.lon
    return math.sqrt((dlat*dlat) + (dlon*dlon)) * 1.113195e5


#Primera funcion llamada en pyr
def agregar_mision(vehicle,lista_rutas):
    #Borrando rutas viejas del dron
    cmds = vehicle.commands
    print("Borrando viejas misiones")
    cmds.clear()

    #Agregar MAV_CMD_NAV_TAKEOFF command (ignorado si el vehiculo esta en el aire)
    cmds.add(dronekit.Command( 0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT, mavutil.mavlink.MAV_CMD_NAV_TAKEOFF, 0, 0, 0, 0, 0, 0, 0, 0, 10))

    #Definiendo los MAV_CMD_NAV_WAYPOINT y agregandolos al comando
    print("Agregar nueva mision")
    for ruta in lista_rutas:
        print(ruta)
        cmds.add(dronekit.Command( 0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT, mavutil.mavlink.MAV_CMD_NAV_WAYPOINT, 0, 0, 0, 0, 0, 0, ruta["latitud"], ruta["longitud"], ruta["altitud"]))
    #Waypoint dummy coincide con el ultimo punto (permite saber cuando se ha llegado al destino)
    print("Agregando waypoint dummy")
    cmds.add(dronekit.Command( 0, 0, 0, mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT, mavutil.mavlink.MAV_CMD_NAV_WAYPOINT, 0, 0, 0, 0, 0, 0, lista_rutas[len(lista_rutas)-1]["latitud"], lista_rutas[len(lista_rutas)-1]["longitud"], lista_rutas[len(lista_rutas)-1]["altitud"]))

    print("Cargar nuevas misiones")
    cmds.upload()
    print("Misiones agregadas al vehiculo")


#Segunda funcion llamada en pyr
def armar_y_takeoff(vehicle, aAltitudObjetivo):
    print("Verificacion previa")
    #Usuario no puede armar hasta que autopiloto este listo
    while not vehicle.is_armable:
        print("Esperando inicializacion de vehiculo...")
        time.sleep(.5)

    print("Armando motores")
    #Debemos armarlo en modo guiado
    vehicle.mode = dronekit.VehicleMode("GUIDED")
    vehicle.armed = True

    while not vehicle.armed:
        print("Esperando a que el vehiculo se arme...")
        time.sleep(.5)

    print("Taking off!")
    vehicle.simple_takeoff(aAltitudObjetivo)  # Aplicar takeoff

    #Esperamos que el dron llegue a la altitud deseada
    while True:
        print("Altitud: ", vehicle.location.global_relative_frame.alt)
        if vehicle.location.global_relative_frame.alt >= aAltitudObjetivo*0.95:
            print("Altura alcanzada")
            break
        time.sleep(.5)


#Tercera funcion llamada en pyr
def distancia_actual_waypoint(vehicle):
    siguiente_waypoint = vehicle.commands.next
    if siguiente_waypoint == 0:
        return None
    missionitem = vehicle.commands[siguiente_waypoint-1]
    lat = missionitem.x
    lon = missionitem.y
    alt = missionitem.z
    ubicacionWaypointObjetivo = dronekit.LocationGlobalRelative(lat, lon, alt)
    distancia_a_punto = obtener_distancia_metros(
        vehicle.location.global_frame, ubicacionWaypointObjetivo)
    return distancia_a_punto


#Funcion que realiza la mision y emite los mensajes a traves del socket
def pyr():
    print(vehiculo)
    #Si ya se hizo la conexion con el dron, espero nueva mision
    data = mongo.db.Dron.find({})
    tmp = list(data)
    dron_base = tmp[0]
    numero_serie = dron_base['numero_serie']
    mision_id=''
    while True:
        time.sleep(2)
        # Get de mision
        response=requests.get(URL_NUBE+'arduinomision?_id='+numero_serie) #Dron prueba
        resp=response.json()
        print(resp)
        if(resp):
            mision.append(resp['ruta']['puntos_ruta'])
            mision_id=resp['_id']
            data_fin_conexion = {
                'dron_id':numero_serie,
            }
            requests.patch(URL_NUBE+'conexion/finalizar',json = data_fin_conexion)
        if len(mision) == 0:
            print("Esperando mision")
        else:
            break
    vehicle = vehiculo[0]
    lista_rutas = mision[0]
    if vehicle.battery.level > 0:
        print('Crear una nueva mision')
        agregar_mision(vehicle,lista_rutas)  # Creamos la mision
        print('Aplicando Takeoff')
        armar_y_takeoff(vehicle,10)  # Aplicamos el take off inicial estandar

        print("Iniciando mision")
        #Reiniciamos en 0
        vehicle.commands.next = 0  # Indice posicion

        vehicle.mode = dronekit.VehicleMode("AUTO")  # Cambiar a modo auto
        data_fin={
            'mision_id':mision_id,
        }
        #Realizar la mision
        while True:
            if vehicle.attitude:

                socketio.emit('pyr_status', {
                    "ESTADO DE LA MISION": "Mision activa",
                    "ROTACIONES":{
                        "Eje Y": str(vehicle.attitude.pitch) + " rad",
                        "Eye Z": str(vehicle.attitude.yaw) + " rad",
                        "Eje X": str(vehicle.attitude.roll) + " rad",
                    },
                    "VELOCIDAD": vehicle.velocity,
                    "VOLTAJE": str(vehicle.battery.voltage) + " mV",
                    "Corriente": str(vehicle.battery.current) + " 10*mA",
                    "Bateria residua": str(vehicle.battery.level) + "%",
                    "Siguiente Waypoint": vehicle.commands.next,
                    "UBICACION ACTUAL": {
                        "Latitud": vehicle.location.global_frame.lat,
                        "Longitud": vehicle.location.global_frame.lon,
                        "Altitud": vehicle.location.global_frame.alt,
                    }
                })

                data_send={
                    'dron_id':numero_serie,
                    'mision_id':mision_id,
                    'rotaciones':{
                        'x':str(vehicle.attitude.pitch),
                        'y':str(vehicle.attitude.yaw),
                        'z':str(vehicle.attitude.roll)
                    },
                    'velocidad':vehicle.velocity,
                    'voltaje':str(vehicle.battery.voltage),
                    "corriente": str(vehicle.battery.current),
                    "bateria_residua": str(vehicle.battery.level),
                    "siguiente_waypoint": vehicle.commands.next,
                    "ubicacion_actual": {
                        "latitud": vehicle.location.global_frame.lat,
                        "longitud": vehicle.location.global_frame.lon,
                        "altitud": vehicle.location.global_frame.alt,
                    }
                }

                siguiente_waypoint = vehicle.commands.next
                print('Distancia a waypoint (%s): %s' % (siguiente_waypoint, distancia_actual_waypoint(vehicle)))
                
                #Envio de datos a servidor principal
                requests.post(URL_NUBE+'guardarposicion',json = data_send)

                if siguiente_waypoint==(len(lista_rutas)+1): #El siguiente waypoint es el final (dummy) y la mision acaba
                    print("Mision acabada")
                    requests.patch(URL_NUBE+'mision/finalizar',json = data_fin)
                    break #Se sale del lazo

                time.sleep(1)

            else:
                socketio.emit('pyr_status', {
                    "ERROR DE DISPOSITIVO": "Hubo un error en los ejes de rotacion del dron",
                })
                requests.patch(URL_NUBE+'mision/finalizar',json = data_fin)
                #Vaciar la lista misiones del backend
                mision.pop()
                #Vaciar lista drones
                vehiculo.pop()
                return

        #Aterriza al salir del lazo
        print('Aterrizando') 
        vehicle.mode = dronekit.VehicleMode("LAND")

        #Mision acabada PERO EL DRON DEBE ATERRIZAR antes de hacer otra
        socketio.emit('pyr_status', {
            "SITUACION DRON": "EL DRON ESTA ATERRIZANDO, POR FAVOR ESPERE...",
            "ESTADO DE LA MISION": "Mision terminada, PERO DRON ATERRIZANDO",
            "ADVERTENCIA": "NO PUEDE INICIAR UNA NUEVA MISION HASTA QUE EL DRON HAYA ATERRIZADO",
            "BATERIA RESTANTE": str(vehicle.battery.level) + "%",
            "UBICACION ACTUAL (DESTINO)": {
                "Latitud": vehicle.location.global_frame.lat,
                "Longitud": vehicle.location.global_frame.lon,
            }
        })

        while True:
            if vehicle.armed:
                print("Esperando a que el vehiculo aterrize y se desarme...")
                time.sleep(2)
            else:
                print("Vehiculo ha aterrizado")
                break

        #Se cierra el vehiculo
        print("Cerrando vehiculo")
        vehicle.close()

        #Mision acabada y dron aterrizado
        socketio.emit('pyr_status', {
                    "SITUACION DRON": "El dron ya ha aterrizado y esta desarmado",
                    "ESTADO DE LA MISION": "Mision terminada",
                    "STATUS": "El dron esta listo para iniciar una nueva mision (si aun tiene bateria)",
                    "BATERIA RESTANTE": str(vehicle.battery.level) + "%",
                    "UBICACION ACTUAL (DESTINO)": {
                        "Latitud": vehicle.location.global_frame.lat,
                        "Longitud": vehicle.location.global_frame.lon,
                        "Altitud": 0,
                    }
        })

        #Vaciar la lista misiones del backend
        mision.pop()

        #Vaciar lista drones
        vehiculo.pop()

        return

    else:
        print("Dispositivo descargado")
        #Vaciar la lista misiones del backend
        mision.pop()
        #Vaciar lista drones
        vehiculo.pop()

        data_fin={
            'mision_id':mision_id,
        }
        requests.patch(URL_NUBE+'mision/finalizar',json = data_fin)

        socketio.emit('pyr_status', {
                    "ESTADO DE LA MISION": "Mision terminada (abortada)",
                    "ERROR DE DISPOSITIVO": "Este dron esta totalmente descargado",
                    "BATERIA RESTANTE": str(vehicle.battery.level) + "%",
                })
        return

#ACTIVAR SERVIDOR
if __name__ == '__main__':
    vehiculo = []  # En esta lista se guarda el vehiculo creado, la referencia no se pierde
    mision = [] #Para guardar la lista de rutas recibida
    socketio.run(app, host="127.0.0.1", port=8000)
