# AUTORES: 
- Julio Alvia
- Miguel Murillo

# Implementación de proyecto de materia integradora 

# Resumen
- El server.py trabaja directamente con static/jquery.min.js , static/socket.io.min.js y templates/index.html
- Libreria Dronekit utilizada
- Framework para Backend Flask utilizado
- SITL utilizado con MavProxy que posee soporte para MavLink
- Se usa SITL (TCP / UDP) a través Cygwin64 (Windows)
- Para modificar ubicacion de dron en Windows usar estos comandos en Cygwin64 y en locations.txt crear nuevo origen (punto)
    cd ~/ardupilot/Tools/autotest/
    cygstart locations.txt
- Para cargar dron utilizando Cygwin64 usar estos comandos:
    cd ~/ardupilot/ArduCopter
    ../Tools/autotest/sim_vehicle.py --map --console (empezar en punto default)
    ../Tools/autotest/sim_vehicle.py -L <NOMBRE_PUNTO> --map --console (empezar en punto especifico)

# Notas importantes
- Para pruebas en desarrollo local modificar en server.py una linea colocando lo siguiente:
socketio.run(app, host="127.0.0.1", port=8000)

- Es indispensable conectar de la siguiente manera:
vehicle = dronekit.connect(target, wait_ready=True)
wait_ready = True -> Esperará para mostrar los datos del dron una vez que TODOS sus parametros se carguen

# Comandos de ejecucion para el servidor de dron
- .\env\Scripts\activate
- python server.py