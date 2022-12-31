import logging

import azure.functions as func
import os
import mysql.connector
import json


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    DB_DATABASE = os.getenv("DB_DATABASE")
    DB_USER = os.getenv("DB_USER")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = int(os.getenv("DB_PORT"))
    DB_PASSWORD = os.getenv("DB_PASSWORD")

    if None in [DB_DATABASE,DB_USER,DB_HOST,DB_PORT,DB_PASSWORD]:
        return func.HttpResponse('{"message":"Undefined environment variables"}', status_code=500,mimetype="application/json")
    response = None
    status_code = 200
    try:
        cnx = mysql.connector.connect(
            user = DB_USER,
            host = DB_HOST,
            port = DB_PORT,
            password = DB_PASSWORD,
            database = DB_DATABASE,
            ssl_disabled=False
        )
        
        req_json = req.get_json()
        action = req_json.get("action")
        if req.method == "POST":
            if action=="captura-articulo":
                articulo = req_json.get("articulo")
                response,status_code = captura_articulo(cnx, articulo)
            elif action=="compra-articulo":
                id = int(req_json.get("id"))
                cantidad = int(req_json.get("cantidad"))
                response,status_code = compra_articulo(cnx, id, cantidad)
            elif action=="buscar-articulo":
                patron = req_json.get("patron")
                response,status_code = buscar_articulo(cnx, patron)
            elif action=="ver-carrito":
                response,status_code = ver_carrito(cnx)
            elif raction=="elimina-articulo":
                id = int(req_json.get("id"))
                response,status_code = elimina_articulo(cnx, id)
            elif action=="elimina-carrito":
                response,status_code = elimina_carrito(cnx)
            else:
                response = {}
                response["status"] = "Accion no especificada"
                status_code = 400
        else:
            response = {}
            response["status"] = "Metodo no soportado"
            status_code = 400

        response = json.dumps(response)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            response = '{"message":"Something is wrong with your user name or password"}'
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            response = '{"message":"Database does not exist"}'
        else:
            response = f'{{"message":"{err}"}}'
        logging.error(response)
        status_code = 500
    else:
        cnx.close()

    return func.HttpResponse(response, status_code=status_code, mimetype="application/json")

def captura_articulo(cnx, articulo):
    status_code = 200
    result = {}
    cursor = cnx.cursor()
    try:
        cursor.execute("START TRANSACTION")
        query = ("INSERT INTO articulos (nombre, descripcion, precio, cantidad, foto) VALUES (%s, %s, %s, %s, %s)")
        if articulo.get("nombre") is None or articulo.get("nombre") == "":
            raise Exception("Nombre no especificado")
        elif articulo.get("descripcion") is None or articulo.get("descripcion") == "":
            raise Exception("Descripcion no especificada")
        elif articulo.get("precio") is None or float(articulo.get("precio")) <= 0:
            raise Exception("Precio no especificado")
        elif articulo.get("cantidad") is None or int(articulo.get("cantidad")) <= 0:
            raise Exception("Cantidad no especificada")
        data = (articulo.get("nombre"), articulo.get("descripcion"), articulo.get("precio"), articulo.get("cantidad"), articulo.get("foto"))
        cursor.execute(query, data)
        cursor.execute("COMMIT")
        result["status"] = "Articulo capturado"
    except mysql.connector.Error as err:
        logging.error(err)
        cursor.execute("ROLLBACK")
        result["status"] = "Error al capturar articulo"
        status_code = 500
    except Exception as err:
        logging.error(err)
        cursor.execute("ROLLBACK")
        result["status"] = str(err)
        status_code = 400
    finally:
        cursor.close()
    return result, status_code

def compra_articulo(cnx, id, cantidad):
    status_code = 200
    result = {}
    cursor = cnx.cursor()
    query = None
    try:
        cursor.execute("START TRANSACTION")
        query = ("SELECT cantidad FROM articulos WHERE id = %s")
        data = (id,)
        cursor.execute(query, data)
        cantidad_articulo = cursor.fetchone()
        if cantidad_articulo is None:
            raise Exception("Articulo no encontrado")
        elif cantidad_articulo[0] < cantidad:
            raise Exception("No hay suficiente cantidad en inventario")
        query = ("UPDATE articulos SET cantidad = cantidad - %s WHERE id = %s")
        data = (cantidad, id)
        cursor.execute(query, data)
        query = ("INSERT INTO carrito_compra (id, cantidad) VALUES (%s, %s)")
        data = (id, cantidad)
        cursor.execute(query, data)
        cursor.execute("COMMIT")
        result["status"] = "Articulo agregado al carrito"
    except mysql.connector.Error as err:
        logging.error(err)
        cursor.execute("ROLLBACK")
        result["status"] = f"Error al agregar articulo al carrito. Error: {err}"
        status_code = 500
    except Exception as err:
        logging.error(err)
        cursor.execute("ROLLBACK")
        result["status"] = f"Error al agregar articulo al carrito. Error: {err}"
        status_code = 400
    finally:
        cursor.close()
    return result, status_code

def buscar_articulo(cnx, patron):
    status_code = 200
    result = []
    cursor = cnx.cursor()
    try:
        query = ("SELECT id,nombre,descripcion,precio,cantidad,foto FROM articulos WHERE nombre LIKE %s OR descripcion LIKE %s")
        data = (f"%{patron}%", f"%{patron}%")
        cursor.execute(query, data)
        for (id, nombre, descripcion, precio, cantidad, foto) in cursor:
            result.append({
                "id": id,
                "nombre": nombre,
                "descripcion": descripcion,
                "precio": precio,
                "cantidad": cantidad,
                "foto": foto
            })
    except mysql.connector.Error as err:
        logging.error(err)
        result = {}
        result["status"] = "Error al buscar articulo"
        status_code = 500
    finally:
        cursor.close()
    return result, status_code

def ver_carrito(cnx):
    status_code = 200
    result = []
    cursor = cnx.cursor()
    try:
        query = ("SELECT articulos.id,articulos.nombre,carrito_compra.cantidad,articulos.precio,articulos.foto FROM articulos INNER JOIN carrito_compra ON articulos.id = carrito_compra.id")
        cursor.execute(query)
        for (id, nombre, descripcion, precio, cantidad, foto) in cursor:
            result.append({
                "id": id,
                "nombre": nombre,
                "descripcion": descripcion,
                "precio": precio,
                "cantidad": cantidad,
                "foto": foto
            })
    except mysql.connector.Error as err:
        logging.error(err)
        result = {}
        result["status"] = f"Error al obtener carrito. Error: {err}"
        status_code = 500
    finally:
        cursor.close()
    return result, status_code

def elimina_articulo(cnx, id):
    status_code = 200
    result = {}
    cursor = cnx.cursor()
    try:
        cursor.execute("START TRANSACTION")
        # Revisa si el articulo existe en la tabla articulos
        query = ("SELECT id FROM articulos WHERE id = %s")
        data = (id,)
        cursor.execute(query, data)
        if cursor.fetchone() is None:
            raise Exception("Articulo no encontrado")
        # Revisa si el articulo existe en el carrito y obtiene la cantidad
        query = ("SELECT id,cantidad FROM carrito_compra WHERE id = %s")
        data = (id,)
        cursor.execute(query, data)
        r = cursor.fetchone()
        if r is None:
            raise Exception("Articulo no encontrado en carrito")
        _, cantidad_carrito = r
        # Actualiza la cantidad del articulo en la tabla articulos
        query = ("UPDATE articulos SET cantidad = cantidad + %s WHERE id = %s")
        data = (cantidad_carrito, id)
        cursor.execute(query, data)
        # Elimina el articulo del carrito
        query = ("DELETE FROM carrito_compra WHERE id = %s")
        data = (id,)
        cursor.execute(query, data)
        cursor.execute("COMMIT")
        result["status"] = "Articulo eliminado"
    except mysql.connector.Error as err:
        logging.error(err)
        cursor.execute("ROLLBACK")
        result["status"] = f"Error al eliminar articulo del carrito. Error: {err}"
        status_code = 500
    except Exception as err:
        logging.error(err)
        cursor.execute("ROLLBACK")
        result["status"] = f"Error al eliminar articulo del carrito. Error: {err}"
        status_code = 400
    finally:
        cursor.close()
    return result, status_code

def elimina_carrito(cnx):
    status_code = 200
    result = {}
    cursor = cnx.cursor()
    try:
        cursor.execute("START TRANSACTION")
        # update cantidades en articulos
        query = ("SELECT id, cantidad FROM carrito_compra")
        cursor.execute(query)
        for (id, cantidad) in cursor:
            query = ("UPDATE articulos SET cantidad = cantidad + %s WHERE id = %s")
            data = (cantidad, id)
            cursor.execute(query, data)
        # elimina articulos del carrito
        query = ("DELETE FROM carrito_compra")
        cursor.execute(query)
        cursor.execute("COMMIT")
        result["status"] = "Carrito vaciado"
    except mysql.connector.Error as err:
        logging.error(err)
        cursor.execute("ROLLBACK")
        result["status"] = f"Error al vaciar carrito. Error: {err}"
        status_code = 500
    finally:
        cursor.close()
    return result, status_code