from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
import json
import datetime
from datetime import date
from bson.objectid import ObjectId
from bson import json_util
from flask_cors import CORS
from werkzeug.datastructures import FileStorage
from pytz import timezone
from utils import get_today, get_today_hour

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/prueba"
mongo = PyMongo(app)
CORS(app)


class JSONEncoder(json.JSONEncoder):
    ''' extend json-encoder class'''

    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime.datetime):
            return str(o)
        return json.JSONEncoder.default(self, o)


app.json_encoder = JSONEncoder


@app.route("/dron", methods=['GET', 'POST', 'DELETE', 'PATCH'])
def dron():
    if request.method == 'GET':
        query = request.args
        data = mongo.db.Dron.find({})
        return jsonify(list(data)), 200

    data = request.get_json()
    if request.method == 'POST':
        if data.get('descripcion', None) is not None and data.get('modelo', None) is not None and data.get('numero_serie', None) is not None and data.get('tipo_dron', None) is not None and data.get('marca', None) is not None and data.get('capacidad', None) is not None:
            mongo.db.Dron.insert_one(data)
            return jsonify({'status': 'success', 'message': 'Dron creado exitosamente'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400

    if request.method == 'DELETE':
        if data.get('_id', None) is not None:
            id = data['_id']
            db_response = mongo.db.Dron.delete_one({'_id': ObjectId(str(id))})
            if db_response.deleted_count == 1:
                response = {'status': 'success',
                            'message': 'Dron eliminado exitosamente'}
            else:
                response = {'status': 'success', 'message': 'Dron no existe'}
            return jsonify(response), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400

    if request.method == 'PATCH':
        if data.get('query', {}) != {}:
            if '_id' in data['query']:
                id = data['query']['_id']
                mongo.db.Dron.update_one({'_id': ObjectId(str(id))}, {
                                         '$set': data.get('payload', {})})
                return jsonify({'status': 'success', 'message': 'Dron actualizado exitosamente'}), 200
            else:
                return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400


@app.route("/dron/conexion", methods=['GET', 'POST', 'DELETE', 'PATCH'])
def dron_conexion():
    if request.method == 'GET':
        query = request.args
        if '_id' in query:
            id = query['_id']
        data = mongo.db.DronConexion.find_one({'_id': ObjectId(str(id))})
        return jsonify(data), 200

    data = request.get_json()
    if request.method == 'POST':
        if data.get('dron_id', None) is not None and data.get('fecha_inicio', None) is not None and data.get('fecha_fin', None) is not None and data.get('estado', None) is not None:
            mongo.db.DronConexion.insert_one(data)
            return jsonify({'status': 'success', 'message': 'Dron creado exitosamente'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400

    if request.method == 'DELETE':
        if data.get('_id', None) is not None:
            id = data['_id']
            db_response = mongo.db.DronConexion.delete_one(
                {'_id': ObjectId(str(id))})
            if db_response.deleted_count == 1:
                response = {'status': 'success',
                            'message': 'Dron eliminado exitosamente'}
            else:
                response = {'status': 'success', 'message': 'Dron no existe'}
            return jsonify(response), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400

    if request.method == 'PATCH':
        if data.get('query', {}) != {}:
            if '_id' in data['query']:
                id = data['query']['_id']
                mongo.db.DronConexion.update_one({'_id': ObjectId(str(id))}, {
                                                 '$set': data.get('payload', {})})
            return jsonify({'status': 'success', 'message': 'Dron actualizado exitosamente'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400


@app.route("/ruta", methods=['GET', 'POST', 'DELETE', 'PATCH'])
def ruta():
    if request.method == 'GET':
        query = request.args
        data = mongo.db.Ruta.find({})
        return jsonify(list(data)), 200

    data = request.get_json()

    if request.method == 'POST':
        if data.get('puntos_ruta', None) is not None and data.get('nombre', None) is not None and data.get('alias', None) is not None:
            mongo.db.Ruta.insert_one(data)
            return jsonify({'status': 'success', 'message': 'Ruta creada exitosamente'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400

    if request.method == 'DELETE':
        if data.get('_id', None) is not None:
            id = data['_id']
            db_response = mongo.db.Ruta.delete_one({'_id': ObjectId(str(id))})
            if db_response.deleted_count == 1:
                response = {'status': 'success',
                            'message': 'Ruta eliminada exitosamente'}
            else:
                response = {'status': 'success', 'message': 'Ruta no existe'}
            return jsonify(response), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400

    if request.method == 'PATCH':
        if data.get('query', {}) != {}:
            if '_id' in data['query']:
                id = data['query']['_id']
                mongo.db.Ruta.update_one({'_id': ObjectId(str(id))}, {
                                         '$set': data.get('payload', {})})
            return jsonify({'status': 'success', 'message': 'Ruta actualizada exitosamente'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400


@app.route("/ruta/file", methods=['POST'])
def load_document():
    data = request
    if request.method == 'POST':
        archivo = request.files['file']
        bytes_file = archivo.read()
        data_file = bytes_file.decode('utf-8')
        valores = data_file.split("\n")
        # Parseo de contenido a rutas
        i = 1  # Primer elemento
        rutas = []
        for valor in valores:
            # Primer elemento no sirve es encabezado, segundo elemento es el punto de partida
            # El ultimo elemento no sirve, es un string vacio inservible
            if((i > 2) and (i < len(valores))):
                linea = valor.split("\t")
                latitud = linea[8].strip()
                longitud = linea[9].strip()
                altitud = linea[10].strip()
                rutas.append({"latitud": float(latitud), "longitud": float(
                    longitud), "altitud": float(altitud)})
            i += 1
        return jsonify(rutas), 200


@app.route("/ruta/vuelo", methods=['GET', 'POST', 'DELETE', 'PATCH'])
def ruta_vuelo():
    if request.method == 'GET':
        query = request.args
        if '_id' in query:
            id = query['_id']
        data = mongo.db.RutaVuelo.find_one({'_id': ObjectId(str(id))})
        return jsonify(data), 200

    data = request.get_json()
    if request.method == 'POST':
        if data.get('dron_id', None) is not None and data.get('vuelo', None) is not None and data.get('datos_vuelo', None) is not None and data.get('estado', None) is not None:
            mongo.db.RutaVuelo.insert_one(data)
            return jsonify({'status': 'success', 'message': 'Ruta del vuelo creada exitosamente'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400

    if request.method == 'DELETE':
        if data.get('_id', None) is not None:
            id = data['_id']
            db_response = mongo.db.RutaVuelo.delete_one(
                {'_id': ObjectId(str(id))})
            if db_response.deleted_count == 1:
                response = {'status': 'success',
                            'message': 'Ruta del vuelo eliminada exitosamente'}
            else:
                response = {'status': 'success',
                            'message': 'Ruta del vuelo no existe'}
            return jsonify(response), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400

    if request.method == 'PATCH':
        if data.get('query', {}) != {}:
            if '_id' in data['query']:
                id = data['query']['_id']
                mongo.db.RutaVuelo.update_one({'_id': ObjectId(str(id))}, {
                                              '$set': data.get('payload', {})})
            return jsonify({'status': 'success', 'message': 'Ruta del vuelo actualizada exitosamente'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400


@app.route("/mision", methods=['GET', 'POST', 'DELETE', 'PATCH'])
def mision():
    if request.method == 'GET':
        query = request.args
        data = mongo.db.Mision.find(
            {}, {'_id': 1, 'fecha_inicio': 1, 'nombre': 1, 'hora_inicio': 1, 'hora_fin': 1, 'dron': 1})
        return jsonify(list(data)), 200

    data = request.get_json()
    if request.method == 'POST':
        if data.get('dron_id', None) is not None and data.get('ruta_id', None) is not None and data.get('nombre', None) is not None:
            dron_id = data['dron_id']
            ruta_id = data['ruta_id']
            dron = mongo.db.Dron.find_one({'_id': ObjectId(str(dron_id))})
            ruta = mongo.db.Ruta.find_one({'_id': ObjectId(str(ruta_id))})
            today = get_today()
            horas = get_today_hour()
            save_data = {
                'fecha_inicio': today,
                'nombre': data['nombre'],
                'dron': {
                    'id': dron['_id'],
                    'modelo': dron['modelo'],
                    'numero_serie': dron['numero_serie'],
                    'tipo_dron': dron['tipo_dron'],
                    'marca': dron['marca'],
                    'capacidad': dron['capacidad'],
                    'descripcion': dron['descripcion'],
                },
                'ruta': {
                    'id': ruta['_id'],
                    'nombre': ruta['nombre'],
                    'puntos_ruta': ruta['puntos_ruta']
                },
                'hora_inicio': horas,
                'hora_fin': '-',
                'datos_list': [],
                'active': True
            }
            mongo.db.Mision.insert_one(save_data)
            return jsonify({'status': 'success', 'message': 'Misión creada exitosamente'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400

    if request.method == 'DELETE':
        if data.get('_id', None) is not None:
            id = data['_id']
            db_response = mongo.db.Vuelo.delete_one({'_id': ObjectId(str(id))})
            if db_response.deleted_count == 1:
                response = {'status': 'success',
                            'message': 'Vuelo eliminado exitosamente'}
            else:
                response = {'status': 'success', 'message': 'Vuelo no existe'}
            return jsonify(response), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400

    if request.method == 'PATCH':
        if data.get('query', {}) != {}:
            if '_id' in data['query']:
                id = data['query']['_id']
                mongo.db.Vuelo.update_one({'_id': ObjectId(str(id))}, {
                                          '$set': data.get('payload', {})})
            return jsonify({'status': 'success', 'message': 'Vuelo actualizado exitosamente'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400


@app.route("/mision/finalizar", methods=['PATCH'])
def finalizar_mision():
    data = request.get_json()
    if request.method == 'PATCH':
        if data.get('mision_id', None) is not None:
            mision_id = data['mision_id']
            hora_fin = get_today_hour()
            mongo.db.Mision.update_one({'_id': ObjectId(str(mision_id))}, {
                '$set': {'active': False, 'hora_fin': hora_fin}})
            return jsonify({'status': 'success', 'message': 'Mision actualizado exitosamente'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400
    else:
        return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400


@app.route("/conexion/finalizar", methods=['PATCH'])
def finalizar_conexion():
    data = request.get_json()
    if request.method == 'PATCH':
        if data.get('dron_id', None) is not None:
            dron_id = data['dron_id']
            mongo.db.DronConexion.update_one({'estado': True, 'dron.numero_serie': dron_id}, {
                '$set': {'estado': False}})
            return jsonify({'status': 'success', 'message': 'Conexion actualizado exitosamente'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400
    else:
        return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400


@app.route("/misiones/activas", methods=['GET'])
def misiones_activas():
    if request.method == 'GET':
        today = get_today()
        data = mongo.db.Mision.find({
            'active': True,
            'fecha_inicio': today
        })
        return jsonify(list(data)), 200


@app.route("/data", methods=['GET', 'POST'])
def data():
    if request.method == 'GET':
        query = request.args
        today = get_today()
        data = mongo.db.DronConexion.find({
            'estado': True,
            'fecha_inicio': today
        })
        return jsonify(list(data)), 200

    # Funciones para crear las conexiones
    data = request.get_json()
    if request.method == 'POST':
        if data.get('dron_id', None) is not None:
            dron = mongo.db.Dron.find_one({'numero_serie': data['dron_id']})
            if(dron):
                today = get_today()
                save_data = {
                    'dron': {
                        'id': dron['_id'],
                        'modelo': dron['modelo'],
                        'numero_serie': dron['numero_serie'],
                        'tipo_dron': dron['tipo_dron'],
                        'marca': dron['marca'],
                        'capacidad': dron['capacidad'],
                        'descripcion': dron['descripcion'],
                    },
                    'fecha_inicio': today,
                    'fecha_fin': '',
                    'estado': True
                }
                mongo.db.DronConexion.insert_one(save_data)
                return jsonify(
                    {
                        'status': 'success',
                        'message': 'Dron en espera exitosamente',
                        'data': save_data
                    }), 200
            else:
                return jsonify({'status': 'id_error', 'message': 'Id no existe'}), 400
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400


@app.route("/guardarposicion", methods=['GET', 'POST'])
def guardarposicion():
    data = request.get_json()
    if request.method == 'POST':
        if data.get('dron_id', None) is not None and data.get('mision_id', None) is not None:
            dron = mongo.db.Dron.find_one({'numero_serie': data['dron_id']})
            if(dron):
                save_data = {
                    'dron': {
                        'id': dron['id'],
                        'modelo': dron['modelo'],
                        'numero_serie': dron['numero_serie'],
                        'tipo_dron': dron['tipo_dron'],
                        'marca': dron['marca'],
                        'capacidad': dron['capacidad'],
                        'descripcion': dron['descripcion'],
                    },
                    'position': data
                }
                mongo.db.Mision.update_one({'_id': ObjectId(str(data['mision_id']))}, {
                                           '$push': {'datos_list': save_data}})
                return {}, 200
            else:
                return jsonify({'status': 'id_error', 'message': 'Id no existe'}), 400
        else:
            return jsonify({'status': 'error', 'message': 'Parámetros erroneos'}), 400


@app.route("/configuracion", methods=['GET', 'POST'])
def configuracion():

    data = request.get_json()
    if request.method == 'POST':
        return jsonify({'resultado': 'datos recibidos'})


@app.route("/arduinomision", methods=['GET'])
def arduinomision():
    if request.method == 'GET':
        query = request.args
        if '_id' in query:
            id = query['_id']
            data = mongo.db.Mision.find_one({
                'active': True,
                'dron.numero_serie': id
            })
            return jsonify(data), 200
        else:
            return jsonify({'status': 'id_error', 'message': 'Id no existe'}), 400


if __name__ == '__main__':
    app.run(debug='success')
