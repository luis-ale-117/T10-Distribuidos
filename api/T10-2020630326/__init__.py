import logging

import azure.functions as func
import os
import mysql.connector
import json


def main(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse("OKOK", status_code=200)
    logging.info('Python HTTP trigger function processed a request.')
    return func.HttpResponse(resp, status_code=status_code)
    DB_DATABASE = os.getenv("DB_DATABASE")
    DB_USER = os.getenv("DB_USER")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = int(os.getenv("DB_PORT"))
    DB_PASSWORD = os.getenv("DB_PASSWORD")

    if None in [DB_DATABASE,DB_USER,DB_HOST,DB_PORT,DB_PASSWORD]:
        return func.HttpResponse("Undefined environment variables", status_code=500)
    resp = None
    status_code = 200
    try:
        cnx = mysql.connector.connect(
            user = DB_USER,
            host = DB_HOST,
            port = DB_PORT,
            password = DB_PASSWORD,
            database = DB_DATABASE
        )
        resp = "json.dumps(resp_body)"
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            resp = "Something is wrong with your user name or password"
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            resp = "Database does not exist"
        else:
            resp = "Un error "+ str(err)
        logging.error(resp)
        status_code = 500
    else:
        cnx.close()

    return func.HttpResponse(resp, status_code=status_code)
