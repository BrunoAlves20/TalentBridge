-- ATENÇÃO: Antes de executar este script, verifique se os IDs 1 e 2 para usuários recrutadores já existem na sua tabela 'usuarios'.
-- Se existirem, por favor, altere os IDs nos INSERTs abaixo para IDs que não estejam em uso.

USE talentbridge;

-- Inserts para usuários recrutadores (IDs 1 e 2)
INSERT INTO usuarios (id, nome, email, senha, tipo_usuario) VALUES
(1, 'Recrutador Alpha', 'recrutador1@example.com', '$2b$12$RxZk0OCKvQDONvlFy49w5uHOAPUqEDJzCcOJj/eiAHYCubrDgKIMG', 'RECRUTADOR'),
(2, 'Recrutador Beta', 'recrutador2@example.com', '$2b$12$RxZk0OCKvQDONvlFy49w5uHOAPUqEDJzCcOJj/eiAHYCubrDgKIMG', 'RECRUTADOR');

-- Inserts para vagas (10 vagas, distribuídas entre os recrutadores)
INSERT INTO vagas (recrutador_id, titulo, departamento, descricao, requisitos, modalidade, localizacao, faixa_salarial, status) VALUES
(1, 'Desenvolvedor Frontend Sênior', 'Engenharia', 'Buscamos um desenvolvedor Frontend experiente para liderar projetos.', 'React, Next.js, TypeScript, GraphQL', 'REMOTO', 'São Paulo, SP', '8000-15000', 'ABERTA'),
(1, 'Analista de Dados Pleno', 'Dados', 'Analisar grandes volumes de dados para extrair insights.', 'SQL, Python, Power BI, Excel', 'HIBRIDO', 'Belo Horizonte, MG', '4000-7000', 'ABERTA'),
(1, 'UX/UI Designer', 'Produto', 'Criar interfaces intuitivas e experiências de usuário incríveis.', 'Figma, Sketch, Prototipagem, Pesquisa de Usuário', 'REMOTO', 'Qualquer lugar', '6000-10000', 'ABERTA'),
(1, 'Engenheiro de Software Backend', 'Engenharia', 'Desenvolver e manter APIs robustas e escaláveis.', 'Python, Node.js, Java, Microsserviços', 'PRESENCIAL', 'Rio de Janeiro, RJ', '7000-14000', 'ABERTA'),
(1, 'Gerente de Projetos de TI', 'Gestão', 'Liderar equipes e garantir a entrega de projetos de software.', 'Scrum, Kanban, Liderança, Comunicação', 'HIBRIDO', 'São Paulo, SP', '10000-18000', 'ABERTA'),
(2, 'Especialista em QA', 'Qualidade', 'Garantir a qualidade de software através de testes automatizados e manuais.', 'Testes automatizados, Selenium, Cypress, Metodologias Ágeis', 'REMOTO', 'Qualquer lugar', '5000-9000', 'ABERTA'),
(2, 'Cientista de Dados', 'Dados', 'Construir modelos preditivos e soluções de Machine Learning.', 'Machine Learning, R, Python, Estatística', 'HIBRIDO', 'São Paulo, SP', '9000-17000', 'ABERTA'),
(2, 'Desenvolvedor Mobile (iOS/Android)', 'Engenharia', 'Desenvolver aplicativos nativos para plataformas móveis.', 'Swift, Kotlin, React Native, Flutter', 'REMOTO', 'Curitiba, PR', '7500-14500', 'ABERTA'),
(2, 'Analista de Segurança da Informação', 'Segurança', 'Proteger sistemas e dados contra ameaças cibernéticas.', 'Pentest, SIEM, ISO 27001, LGPD', 'PRESENCIAL', 'Brasília, DF', '6000-12000', 'ABERTA'),
(2, 'Product Owner', 'Produto', 'Definir a visão do produto e priorizar o backlog.', 'Gestão de Produto, Scrum, UX, Análise de Mercado', 'HIBRIDO', 'Porto Alegre, RS', '8500-16000', 'ABERTA');
