-- ======================================================================
-- SCRIPT DE SEEDS (DADOS DE TESTE) - TALENTBRIDGE
-- Execute este script apenas DEPOIS de ter criado as tabelas.
-- ======================================================================

USE `talentbridge`; 

-- 1. Inserindo as Habilidades Base (Dicionário)
-- Isso vai alimentar os filtros na tela do Kauã
INSERT INTO habilidades (nome) VALUES 
('Python'), ('Next.js'), ('React'), ('PostgreSQL'), 
('Java'), ('Linux'), ('Git'), ('Web Scraping');

-- 2. Inserindo Usuários (1 Recrutador e 1 Candidato)
-- Usando IDs fictícios no formato texto para facilitar os testes
INSERT INTO usuarios (id, nome, email, senha_hash, tipo_usuario) VALUES 
('recrutador-001', 'Tech Corp RH', 'vagas@techcorp.com', 'hash_qualquer_123', 'RECRUTADOR'),
('candidato-001', 'Bruno Nogueira', 'bruno@email.com', 'hash_qualquer_123', 'CANDIDATO');

-- 3. Inserindo o Perfil do Candidato (RF02 / RF04)
-- Simulando que a IA já extraiu os dados e a revisão foi concluída
INSERT INTO perfis_candidatos (id, usuario_id, telefone, resumo_profissional, url_curriculo_s3, revisao_concluida) VALUES 
('perfil-001', 'candidato-001', '(11) 99999-9999', 'Desenvolvedor focado em soluções backend e automação. Tenho experiência prática na construção de bots para coleta de dados e manutenção de interfaces web. Atualmente aprofundando conhecimentos em infraestrutura e arquitetura de software.', 'https://s3.aws.com/talentbridge/bruno_cv.pdf', TRUE);

-- 4. Inserindo Experiências e Formações do Candidato
INSERT INTO formacoes (usuario_id, instituicao, curso, tipo, data_conclusao) VALUES 
('candidato-001', 'Faculdade de Tecnologia', 'Análise de Sistemas', 'Graduação', '2027-12-01');

INSERT INTO experiencias (usuario_id, empresa, cargo, data_inicio, data_fim, descricao) VALUES 
('candidato-001', 'Tistto', 'Desenvolvedor Júnior', '2025-06-01', NULL, 'Atuação focada no desenvolvimento e manutenção de sistemas web, além de construção de scripts de web scraping e bots em Python para coleta de dados essenciais para o negócio.'),
('candidato-001', 'Tistto', 'Estagiário de Desenvolvimento', '2024-01-15', '2025-05-30', 'Apoio à equipe de desenvolvimento, atuando em tarefas de front-end, automação de processos internos e estruturação de projetos.');

-- 5. Vinculando Habilidades ao Candidato (RF: N:N)
-- Assumindo que os IDs das habilidades inseridas no passo 1 vão de 1 a 8
INSERT INTO candidato_habilidades (usuario_id, habilidade_id) VALUES 
('candidato-001', 1), -- Python
('candidato-001', 5), -- Java
('candidato-001', 6), -- Linux
('candidato-001', 7), -- Git
('candidato-001', 8); -- Web Scraping

-- 6. Criando Vagas pelo Recrutador (RF05)
INSERT INTO vagas (id, recrutador_id, titulo, descricao, status) VALUES 
('vaga-001', 'recrutador-001', 'Desenvolvedor Backend Python', 'Buscamos um desenvolvedor para criar e manter rotinas de extração de dados e automação.', 'Aberta'),
('vaga-002', 'recrutador-001', 'Desenvolvedor Fullstack Júnior', 'Oportunidade para atuar com Next.js no front-end e Python no back-end.', 'Aberta');

-- 7. Vinculando Habilidades Exigidas nas Vagas (RF06 - Motor de Ranking)
-- Vaga 1 exige Python (peso 5) e Web Scraping (peso 4)
INSERT INTO vaga_habilidades (vaga_id, habilidade_id, peso) VALUES 
('vaga-001', 1, 5), 
('vaga-001', 8, 4);

-- Vaga 2 exige Next.js (peso 5) e Python (peso 3)
INSERT INTO vaga_habilidades (vaga_id, habilidade_id, peso) VALUES 
('vaga-002', 2, 5), 
('vaga-002', 1, 3);

-- 8. Simulando uma Candidatura (RF05 / RF06)
-- O Candidato se inscreveu na Vaga 1 e o algoritmo já calculou um match alto
INSERT INTO candidaturas (id, usuario_id, vaga_id, status_pipeline, score_match) VALUES 
('cand-001', 'candidato-001', 'vaga-001', 'Entrevista', 92.50);

-- 9. Simulando a Entrevista com IA (RF07)
-- Isso vai ajudar o Leonardo a testar a tela do simulador
INSERT INTO entrevistas_ia (id, candidatura_id, status, transcricao_chat, feedback_geral, pontuacao_final) VALUES 
('entrevista-001', 'cand-001', 'Concluída', 'IA: Como você lidaria com um site que bloqueia requisições de raspagem de dados?\nCandidato: Eu implementaria rotação de IPs, headers dinâmicos e, se necessário, usaria bibliotecas como Selenium para simular navegação humana.', 'O candidato demonstrou excelente conhecimento prático em resolução de problemas técnicos e automação. Comunicação clara e objetiva.', 88.00);




-- Fazer Uma consulta depois que roda o teste acima 
SELECT 
    v.titulo AS 'Vaga', 
    u.nome AS 'Candidato', 
    c.score_match AS 'Match (%)', 
    c.status_pipeline AS 'Fase'
FROM candidaturas c
JOIN vagas v ON c.vaga_id = v.id
JOIN usuarios u ON c.usuario_id = u.id;