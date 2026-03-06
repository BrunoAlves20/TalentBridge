import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

def get_db_connection():
    try:
        # TESTE TEMPORÁRIO: Dados diretos sem usar o os.getenv
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            port=os.getenv("DB_PORT")
        )
        if connection.is_connected():
            print("CONECTOU COM SUCESSO!") # Mensagem de log
            return connection
    except Error as e:
        print(f"Erro ao conectar ao MySQL: {e}")
        return None
    
