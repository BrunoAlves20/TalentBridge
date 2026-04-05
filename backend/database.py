import os
import time
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


def init_db():
    """
    Cria o banco e as tabelas automaticamente ao subir o backend.
    Não apaga dados existentes.
    """
    db_name = os.getenv("DB_NAME", "talentbridge")
    host = os.getenv("DB_HOST", "localhost")
    user = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASSWORD", "")
    port = int(os.getenv("DB_PORT", 3306))

    tentativas = 10
    for i in range(tentativas):
        try:
            # Etapa 1 — cria o banco se não existir
            conn = connect(host=host, user=user, password=password, port=port)
            cursor = conn.cursor()
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}`")
            conn.commit()
            cursor.close()
            conn.close()
            logger.info(f"Banco '{db_name}' verificado/criado com sucesso.")
            break

        except Error as e:
            logger.warning(f"Tentativa {i+1}/{tentativas} falhou ao criar banco: {e}")
            time.sleep(3)
            if i == tentativas - 1:
                logger.error("Não foi possível criar o banco de dados.")
                return

    # Etapa 2 — cria as tabelas
    try:
        conn = connect(host=host, user=user, password=password, port=port, database=db_name)
        cursor = conn.cursor()

        sql_path = os.path.join(os.path.dirname(__file__), "Database", "db.sql")
        with open(sql_path, "r") as f:
            sql = f.read()

        for statement in sql.split(";"):
            statement = statement.strip()
            if (
                statement
                and not statement.upper().startswith("DROP")
                and not statement.upper().startswith("CREATE DATABASE")
                and not statement.upper().startswith("USE")
            ):
                cursor.execute(statement)

        conn.commit()
        logger.info("Tabelas criadas/verificadas com sucesso!")
        cursor.close()
        conn.close()

    except Error as e:
        logger.error(f"Erro ao criar tabelas: {e}")