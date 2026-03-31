import os
import logging
from mysql.connector import connect, Error
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


def get_db_connection():
    """
    Abre e retorna uma nova conexão com o banco de dados MySQL.
    Retorna None se a conexão falhar.
    """
    try:
        connection = connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "talentbridge"),
            port=int(os.getenv("DB_PORT", 3306)),
        )
        if connection.is_connected():
            logger.info("Conexão com o banco de dados estabelecida com sucesso.")
            return connection
    except Error as e:
        logger.error(f"Erro ao conectar ao MySQL: {e}")
        return None