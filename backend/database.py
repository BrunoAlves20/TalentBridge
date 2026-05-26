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
        return

    # Etapa 3 — popula dados de exemplo (idempotente: usa INSERT IGNORE).
    # Só roda se o banco estiver "vazio o suficiente" — ou seja, sem nenhum
    # usuário ainda cadastrado. Isso evita rodar o seed em produção.
    try:
        seed_path = os.path.join(os.path.dirname(__file__), "Database", "seed.sql")
        if not os.path.exists(seed_path):
            logger.info("seed.sql não encontrado — pulando seed.")
            return

        conn = connect(host=host, user=user, password=password, port=port, database=db_name)
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM usuarios")
        (total_usuarios,) = cursor.fetchone()

        if total_usuarios > 0:
            logger.info(
                f"Seed pulado — já existem {total_usuarios} usuário(s) no banco."
            )
            cursor.close()
            conn.close()
            return

        with open(seed_path, "r", encoding="utf-8") as f:
            seed_sql = f.read()

        # O seed usa muitos UNION ALL / subqueries, então preciso executar
        # statement-a-statement, ignorando linhas em branco e comentários.
        statements = []
        buffer = []
        for line in seed_sql.splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("--"):
                continue
            buffer.append(line)
            if stripped.endswith(";"):
                statements.append("\n".join(buffer))
                buffer = []

        for stmt in statements:
            try:
                cursor.execute(stmt)
            except Error as e:
                logger.warning(f"Falha ao executar statement do seed (ignorando): {e}")

        conn.commit()
        logger.info(f"Seed aplicado com sucesso ({len(statements)} statements).")
        cursor.close()
        conn.close()

    except Error as e:
        logger.error(f"Erro ao aplicar seed: {e}")