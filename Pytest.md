```python
import os

base_path = "TalentBridge/backend/tests"
files = ["test_auth.py", "test_candidato.py", "test_recrutador.py", "test_security.py"]

for f in files:
    p = os.path.join(base_path, f)
    if os.path.exists(p):
        print(f"--- {f} ---")
        with open(p, "r", encoding="utf-8") as file:
            # print first 40 lines or lines with 'def test_'
            lines = file.readlines()
            for line in lines:
                if line.strip().startswith("def test_") or line.strip().startswith('"""'):
                    print(line.strip())
    else:
        print(f"{f} not found")



```

```text
test_auth.py not found
test_candidato.py not found
test_recrutador.py not found
test_security.py not found


```

```python
import os

md_content = """# 🧪 Guia de Testes Funcionais da API (PyTest)

Este documento descreve a suíte de testes funcionais desenvolvida para a API do **TalentBridge**. A suíte bate diretamente na API em execução e realiza interações com o banco de dados (sem mock).

---

## 🚀 Como Executar os Testes

Como o projeto utiliza Docker, a melhor abordagem é executar os testes por dentro do container do backend. Isso garante que não haverá problemas de dependências (como a versão do Python, instalações do `pip` ou caminhos não encontrados no Windows).

Abra o terminal e execute os seguintes comandos:

### 1. Subir a Aplicação
Inicie os containers da aplicação em segundo plano:

```

```text
File generated at: /mnt/data/PyTest.md

```bash
docker compose up -d

```

*(Se os containers já estiverem rodando, você pode pular esta etapa).*

### 2. Rodar os Testes no Container

Em um novo terminal, execute o `pytest` dentro do container chamado `backend`:

```bash
docker compose exec backend pytest tests/ -v

```

*(O parâmetro `-v` ativa o modo verbose, exibindo o nome de cada teste e se ele passou ou falhou).*

---

## 📂 Estrutura e Explicação dos Testes

### ⚙️ `conftest.py` (Configurações e Fixtures)

Este arquivo não contém testes, mas possui as **fixtures** (ferramentas e cenários base) que são injetadas em todos os outros arquivos de teste para facilitar a vida:

* **`client`**: Garante que a API está respondendo via um `httpx.Client` reutilizável.
* **`login_recrutador` / `login_candidato**`: Faz login automático usando contas "seed" padronizadas do banco de dados e retorna os tokens JWT prontos para uso.
* **`criar_candidato_temp`**: Realiza o fluxo completo de cadastro do candidato, verifica o código OTP e limpa (exclui) o usuário do banco assim que os testes terminam, evitando sujeira na base de dados.

### 🧑‍💻 `test_candidato.py` (Fluxos do Candidato)

Testa os fluxos principais de um usuário do tipo Candidato, como visualizar vagas, aplicar e alterar dados.

* **`test_listar_vagas_abertas_publico`**:
* **O que faz:** Verifica se a rota pública (sem exigência de login) de listagem de vagas abertas (`GET /vagas/abertas`) está funcionando e retornando vagas.


* **`test_onboarding_completo`**:
* **O que faz:** Utiliza a fixture `criar_candidato_temp` para gerar um novo candidato, envia todo o payload de currículo/perfil (experiências, formação, etc.) para o banco de dados e verifica se a conta é atualizada corretamente para refletir que o *onboarding* foi concluído.


* **`test_candidatar_se_e_minhas_candidaturas`**:
* **O que faz:** Loga como o candidato padrão e verifica se a rota que puxa as suas próprias candidaturas no banco de dados está retornando a chave esperada corretamente e sem erros.


* **`test_salvar_vaga`**:
* **O que faz:** Puxa a listagem de vagas, pega o ID da primeira vaga disponível, salva-a como "favorita" para o candidato, lista as vagas salvas para garantir a persistência e em seguida limpa o registro. Garante que o usuário consegue favoritar vagas para ver depois.


* **`test_preferencias_get_put`**:
* **O que faz:** Recupera e atualiza as preferências do candidato (ex: receber notificações via email), validando o fluxo de endpoints atrelados a configurações do sistema.


* **`test_atualizar_e_buscar_perfil_pessoal`** (Novo):
* **O que faz:** Usa a rota `PUT /candidatos/perfil-pessoal` para atualizar o nome e outras informações de um candidato temporário e depois utiliza o `GET /candidatos/perfil-completo/{id}` para confirmar que a edição foi de fato salva no banco de dados.


* **`test_seguranca_atualizar_perfil_outro_usuario`** (Novo / Segurança):
* **O que faz:** Pega um candidato autenticado, altera o ID da requisição e tenta modificar o perfil de *outro* candidato. Garante que a API devolve um erro `403 Forbidden`, provando que um candidato não consegue "hackear" os dados do outro.



---

> **Dica:** Lembre-se sempre de conferir as respostas do Pytest (os ✅ verdes para sucesso ou ❌ vermelhos para falhas) e analisar as mensagens de erro nos logs caso alguma mudança quebre as funcionalidades validadas aqui!
> """

file_path = "/mnt/data/PyTest.md"
with open(file_path, "w", encoding="utf-8") as file:
file.write(md_content)

print(f"File generated at: {file_path}")
