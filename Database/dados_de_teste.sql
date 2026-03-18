USE `talentbridge`;

-- =========================================================================
-- 1. USUÁRIOS (2 Recrutadores e 3 Candidatos)
-- =========================================================================
INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha_hash`, `tipo_usuario`) VALUES
(1, 'Ana Clara RH', 'ana.rh@techcorp.com', 'hash_senha_123', 'RECRUTADOR'),
(2, 'Carlos Recrutador', 'carlos@inovagas.com.br', 'hash_senha_123', 'RECRUTADOR'),
(3, 'João Dev', 'joao.dev@email.com', 'hash_senha_123', 'CANDIDATO'),
(4, 'Maria Data', 'maria.dados@email.com', 'hash_senha_123', 'CANDIDATO'),
(5, 'Pedro Design', 'pedro.uiux@email.com', 'hash_senha_123', 'CANDIDATO');

-- =========================================================================
-- 2. PERFIS DOS CANDIDATOS
-- =========================================================================
INSERT INTO `perfis_candidatos` (`usuario_id`, `telefone`, `sobre_voce`, `url_curriculo_s3`, `dados_brutos_ia`, `revisao_concluida`) VALUES
(3, '11999990001', 'Desenvolvedor Full Stack apaixonado por tecnologia e resolução de problemas.', 's3://bucket/cv_joao.pdf', '{"skills": ["React", "Node.js"]}', 1),
(4, '11999990002', 'Cientista de Dados com foco em Machine Learning e análise preditiva.', 's3://bucket/cv_maria.pdf', '{"skills": ["Python", "SQL"]}', 1),
(5, '11999990003', 'UX/UI Designer criando experiências memoráveis para os usuários.', 's3://bucket/cv_pedro.pdf', '{"skills": ["Figma", "Photoshop"]}', 0);

-- =========================================================================
-- 3. EXPERIÊNCIAS DOS CANDIDATOS
-- =========================================================================
INSERT INTO `experiencias` (`usuario_id`, `empresa`, `cargo`, `data_inicio`, `data_fim`, `descricao`) VALUES
(3, 'Tech Solutions', 'Desenvolvedor Web Jr', '2020-03-01', '2022-05-30', 'Desenvolvimento de APIs em Node.js e front-end em React.'),
(3, 'InovaWeb', 'Desenvolvedor Full Stack Pleno', '2022-06-01', NULL, 'Liderança técnica de pequenas equipes e arquitetura de microserviços.'),
(4, 'Fintech X', 'Analista de Dados', '2019-01-15', '2021-12-20', 'Criação de dashboards em Power BI e queries complexas em SQL.'),
(4, 'DataCorp', 'Cientista de Dados', '2022-01-10', NULL, 'Modelagem de dados e criação de algoritmos de recomendação.'),
(5, 'Agência Criativa', 'Web Designer', '2018-05-01', '2021-10-15', 'Criação de interfaces para e-commerces e landing pages.');

-- =========================================================================
-- 4. FORMAÇÕES DOS CANDIDATOS
-- =========================================================================
INSERT INTO `formacoes` (`usuario_id`, `instituicao`, `curso`, `tipo`, `data_inicio`, `data_fim`) VALUES
(3, 'Universidade de São Paulo (USP)', 'Ciência da Computação', 'Bacharelado', '2016-02-01', '2019-12-20'),
(4, 'Universidade Estadual de Campinas (UNICAMP)', 'Estatística', 'Bacharelado', '2015-03-01', '2018-12-15'),
(5, 'Faculdade de Belas Artes', 'Design Gráfico', 'Bacharelado', '2017-02-01', '2020-12-10');

-- =========================================================================
-- 5. CURSOS E CERTIFICAÇÕES
-- =========================================================================
INSERT INTO `cursos_certificacoes` (`usuario_id`, `nome`, `instituicao`) VALUES
(3, 'AWS Certified Cloud Practitioner', 'Amazon Web Services'),
(4, 'Data Science Bootcamp', 'Alura'),
(5, 'UI/UX Masterclass', 'Udemy');

-- =========================================================================
-- 6. IDIOMAS DOS CANDIDATOS
-- =========================================================================
INSERT INTO `idiomas` (`usuario_id`, `idioma`, `nivel`) VALUES
(3, 'Inglês', 'Avançado'),
(3, 'Espanhol', 'Intermediário'),
(4, 'Inglês', 'Fluente'),
(5, 'Inglês', 'Básico');

-- =========================================================================
-- 7. DICIONÁRIO DE HABILIDADES
-- =========================================================================
INSERT INTO `habilidades` (`id`, `nome`) VALUES
(1, 'React'),
(2, 'Node.js'),
(3, 'Python'),
(4, 'SQL'),
(5, 'Figma'),
(6, 'Machine Learning'),
(7, 'AWS'),
(8, 'Docker'),
(9, 'UI/UX'),
(10, 'TypeScript');

-- =========================================================================
-- 8. VÍNCULO CANDIDATO <-> HABILIDADE
-- =========================================================================
INSERT INTO `candidato_habilidades` (`usuario_id`, `habilidade_id`) VALUES
(3, 1), (3, 2), (3, 7), (3, 8), (3, 10), -- João Dev: React, Node, AWS, Docker, TS
(4, 3), (4, 4), (4, 6), (4, 7),          -- Maria Data: Python, SQL, ML, AWS
(5, 5), (5, 9);                          -- Pedro Design: Figma, UI/UX

-- =========================================================================
-- 9. VAGAS (Criadas pelos Recrutadores)
-- =========================================================================
INSERT INTO `vagas` (`id`, `recrutador_id`, `titulo`, `descricao`, `status`) VALUES
(1, 1, 'Desenvolvedor Front-end', 'Buscamos um dev experiente em React e TypeScript para compor nosso time.', 'ABERTA'),
(2, 1, 'Cientista de Dados Sênior', 'Vaga para atuar em projetos de Machine Learning.', 'ABERTA'),
(3, 2, 'Product Designer', 'Projetar interfaces web e mobile utilizando Figma.', 'ABERTA');

-- =========================================================================
-- 10. HABILIDADES EXIGIDAS PARA AS VAGAS
-- =========================================================================
INSERT INTO `vaga_habilidades` (`vaga_id`, `habilidade_id`, `peso`) VALUES
(1, 1, 5),  -- Vaga Front: React (peso 5)
(1, 10, 4), -- Vaga Front: TypeScript (peso 4)
(2, 3, 5),  -- Vaga Dados: Python (peso 5)
(2, 4, 3),  -- Vaga Dados: SQL (peso 3)
(2, 6, 5),  -- Vaga Dados: ML (peso 5)
(3, 5, 5),  -- Vaga Design: Figma (peso 5)
(3, 9, 4);  -- Vaga Design: UI/UX (peso 4)

-- =========================================================================
-- 11. CANDIDATURAS, PIPELINE E TRIAGEM
-- =========================================================================
INSERT INTO `candidaturas` (`id`, `usuario_id`, `vaga_id`, `status_pipeline`, `score_match`) VALUES
(1, 3, 1, 'ENTREVISTA', 92.50),  -- João se candidatou para Dev Front
(2, 4, 1, 'REJEITADO', 15.00),   -- Maria se candidatou errado para Front-end
(3, 4, 2, 'TRIAGEM', 95.00),     -- Maria se candidatou para Cientista de Dados
(4, 5, 3, 'OFERTA', 88.00);      -- Pedro se candidatou para UI/UX

-- =========================================================================
-- 12. SIMULADOR DE ENTREVISTA (IA)
-- =========================================================================
INSERT INTO `entrevistas_ia` (`candidatura_id`, `status`, `transcricao_chat`, `feedback_geral`, `pontuacao_final`) VALUES
(1, 'CONCLUIDA', 'IA: Como você gerencia estado no React? Candidato: Uso Context API e Redux...', 'Iniciativa excelente, boa clareza nas respostas técnicas.', 8.5),
(4, 'CONCLUIDA', 'IA: Qual processo de discovery você utiliza? Candidato: Geralmente começo por pesquisas de usuário...', 'Ótima base teórica de design thinking.', 9.0);
