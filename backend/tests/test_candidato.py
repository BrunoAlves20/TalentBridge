def test_atualizar_e_buscar_perfil_pessoal(client, criar_candidato_temp):
    """
    Teste funcional que atualiza os dados pessoais do candidato e em seguida 
    busca o perfil completo para garantir que a alteração persistiu no banco.
    """
    # 1. Setup: Pegamos o candidato temporário gerado pela fixture
    user = criar_candidato_temp

    # 2. Ação (Update): Enviamos o PUT para atualizar os dados pessoais
    payload_update = {
        "usuario_id": user["id"],
        "fullName": "Lucas Silva Atualizado",
        "email": user["email"],  # Mantemos o email original para não acionar a verificação do Hunter.io
        "phone": "11988888888",
        "gender": "Masculino",
        "age": "28",
        "state": "RJ",
        "city": "Rio de Janeiro",
        "zipCode": "20000-000",
        "linkedin": "https://linkedin.com/in/lucas",
        "github": "https://github.com/lucas",
        "portfolio": "https://meuportfolio.com",
        "about": "Desenvolvedor focado em testes funcionais.",
        "profilePicture": ""
    }

    r_put = client.put(
        "/candidatos/perfil-pessoal",
        headers=user["headers"],
        json=payload_update
    )
    
    # Valida se a requisição de atualização foi bem-sucedida
    assert r_put.status_code == 200, f"Falha no PUT: {r_put.text}"
    assert r_put.json() == {"mensagem": "Dados pessoais atualizados com sucesso!"}

    # 3. Ação (Leitura): Buscamos o perfil via GET para validar a persistência
    r_get = client.get(
        f"/candidatos/perfil-completo/{user['id']}",
        headers=user["headers"]
    )
    
    # Valida se a busca funcionou
    assert r_get.status_code == 200, f"Falha no GET: {r_get.text}"
    
    # 4. Asserção: Garantir que os dados foram realmente modificados
    dados_retornados = r_get.json()
    assert dados_retornados["personal"]["fullName"] == "Lucas Silva Atualizado"
    assert dados_retornados["personal"]["city"] == "Rio de Janeiro"
    assert dados_retornados["personal"]["about"] == "Desenvolvedor focado em testes funcionais."


def test_seguranca_atualizar_perfil_outro_usuario(client, criar_candidato_temp):
    """
    Teste de segurança para garantir que um candidato não pode alterar o perfil de outro.
    """
    user = criar_candidato_temp
    
    # Tentamos atualizar o perfil passando um 'usuario_id' diferente do token JWT logado
    payload_invalido = {
        "usuario_id": user["id"] + 9999, # Forçando um ID diferente
        "fullName": "Invasor",
        "email": "hacker@exemplo.com",
        "phone": "", "gender": "", "age": "", "state": "", "city": "",
        "zipCode": "", "linkedin": "", "github": "", "portfolio": "", 
        "about": "", "profilePicture": ""
    }

    r_put = client.put(
        "/candidatos/perfil-pessoal",
        headers=user["headers"],
        json=payload_invalido
    )
    
    # O router define que se dados.usuario_id != current_user["user_id"], retorna 403 Forbidden
    assert r_put.status_code == 403
    assert r_put.json()["detail"] == "Você só pode editar seu próprio perfil."