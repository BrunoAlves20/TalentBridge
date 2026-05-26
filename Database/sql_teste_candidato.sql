-- =============================================================================
-- TalentBridge — Dados de Teste de Candidatos
-- Descrição: Insere 10 candidatos fictícios e todos os seus dados relacionais.
-- Senha para todos os acessos: 123456
-- =============================================================================

-- Desabilitar checagem de FK temporariamente para facilitar os inserts
SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- 1. USUÁRIOS (CANDIDATOS)
-- ==========================================
-- Hash gerado com bcrypt para a senha "123456"
INSERT INTO usuarios (id, nome, email, senha_hash, tipo_usuario) VALUES
(101, 'Ana Silva', 'ana.silva@teste.com', '$2b$12$RxZk0OCKvQDONvlFy49w5uHOAPUqEDJzCcOJj/eiAHYCubrDgKIMG', 'CANDIDATO'),
(102, 'Carlos Santos', 'carlos.santos@teste.com', '$2b$12$RxZk0OCKvQDONvlFy49w5uHOAPUqEDJzCcOJj/eiAHYCubrDgKIMG', 'CANDIDATO'),
(103, 'Beatriz Costa', 'beatriz.costa@teste.com', '$2b$12$RxZk0OCKvQDONvlFy49w5uHOAPUqEDJzCcOJj/eiAHYCubrDgKIMG', 'CANDIDATO'),
(104, 'Diego Oliveira', 'diego.oliveira@teste.com', '$2b$12$RxZk0OCKvQDONvlFy49w5uHOAPUqEDJzCcOJj/eiAHYCubrDgKIMG', 'CANDIDATO'),
(105, 'Elena Souza', 'elena.souza@teste.com', '$2b$12$RxZk0OCKvQDONvlFy49w5uHOAPUqEDJzCcOJj/eiAHYCubrDgKIMG', 'CANDIDATO'),
(106, 'Felipe Rocha', 'felipe.rocha@teste.com', '$2b$12$RxZk0OCKvQDONvlFy49w5uHOAPUqEDJzCcOJj/eiAHYCubrDgKIMG', 'CANDIDATO'),
(107, 'Gabriela Lima', 'gabriela.lima@teste.com', '$2b$12$RxZk0OCKvQDONvlFy49w5uHOAPUqEDJzCcOJj/eiAHYCubrDgKIMG', 'CANDIDATO'),
(108, 'Henrique Mendes', 'henrique.mendes@teste.com', '$2b$12$RxZk0OCKvQDONvlFy49w5uHOAPUqEDJzCcOJj/eiAHYCubrDgKIMG', 'CANDIDATO'),
(109, 'Isabela Castro', 'isabela.castro@teste.com', '$2b$12$RxZk0OCKvQDONvlFy49w5uHOAPUqEDJzCcOJj/eiAHYCubrDgKIMG', 'CANDIDATO'),
(110, 'João Pedro Alves', 'joao.alves@teste.com', '$2b$12$RxZk0OCKvQDONvlFy49w5uHOAPUqEDJzCcOJj/eiAHYCubrDgKIMG', 'CANDIDATO');


-- ==========================================
-- 2. PERFIS DOS CANDIDATOS
-- ==========================================
INSERT INTO perfis_candidatos (usuario_id, telefone, genero, idade, estado, cidade, cep, linkedin, github, portfolio, sobre_mim) VALUES
(101, '11999999991', 'Feminino', '28', 'SP', 'São Paulo', '01000-000', 'linkedin.com/in/anasilva', 'github.com/anasilva', 'anasilva.dev', 'Desenvolvedora Front-end apaixonada por criar interfaces intuitivas e acessíveis com React.'),
(102, '21999999992', 'Masculino', '32', 'RJ', 'Rio de Janeiro', '20000-000', 'linkedin.com/in/carlossantos', 'github.com/csantos', NULL, 'Analista de Dados experiente na criação de dashboards executivos e modelagem de dados usando Python e SQL.'),
(103, '31999999993', 'Feminino', '26', 'MG', 'Belo Horizonte', '30000-000', 'linkedin.com/in/beatrizcosta', NULL, 'behance.net/biacosta', 'UX/UI Designer com foco na jornada do usuário. Amo transformar problemas complexos em telas simples.'),
(104, '41999999994', 'Masculino', '30', 'PR', 'Curitiba', '80000-000', 'linkedin.com/in/diegooliveira', 'github.com/diego-backend', NULL, 'Desenvolvedor Back-end especialista em Java e arquitetura de microserviços. Foco em alta performance.'),
(105, '48999999995', 'Feminino', '35', 'SC', 'Florianópolis', '88000-000', 'linkedin.com/in/elenasouza', 'github.com/elenadevops', NULL, 'Engenheira DevOps com 6 anos de experiência em CI/CD, AWS, Terraform e Kubernetes.'),
(106, '71999999996', 'Masculino', '24', 'BA', 'Salvador', '40000-000', 'linkedin.com/in/feliperocha', 'github.com/feliperochamobile', NULL, 'Desenvolvedor Mobile apaixonado por Flutter e Kotlin. Crio apps de alta performance para Android e iOS.'),
(107, '19999999997', 'Feminino', '31', 'SP', 'Campinas', '13000-000', 'linkedin.com/in/gabrielalima', NULL, 'gabilima.pm', 'Product Manager orientada a dados. Experiência liderando squads ágeis em fintechs e healthtechs.'),
(108, '51999999998', 'Masculino', '29', 'RS', 'Porto Alegre', '90000-000', 'linkedin.com/in/henriquemendes', 'github.com/henriqueqa', NULL, 'Engenheiro de QA focado em automação de testes com Cypress, Selenium e testes de API com Postman.'),
(109, '81999999999', 'Feminino', '27', 'PE', 'Recife', '50000-000', 'linkedin.com/in/isabelacastro', 'github.com/isacastro', 'isacastro.dev', 'Desenvolvedora Full Stack trabalhando primariamente com Node.js no back e Vue.js no front.'),
(110, '61999999900', 'Masculino', '33', 'DF', 'Brasília', '70000-000', 'linkedin.com/in/joaoalves', 'github.com/joao-dados', NULL, 'Cientista de Dados com mestrado em IA. Foco em Machine Learning e PNL (Processamento de Linguagem Natural).');


-- ==========================================
-- 3. FORMAÇÕES ACADÊMICAS
-- ==========================================
INSERT INTO formacoes (usuario_id, curso, instituicao, grau, ano_inicio, ano_fim, horas) VALUES
(101, 'Sistemas de Informação', 'FIAP', 'Bacharelado', '2015', '2019', '3200'),
(102, 'Estatística', 'UFRJ', 'Bacharelado', '2010', '2014', '3000'),
(102, 'Data Science e Big Data', 'FGV', 'Pós-graduação', '2016', '2018', '360'),
(103, 'Design Gráfico', 'UEMG', 'Bacharelado', '2017', '2021', '2800'),
(104, 'Engenharia de Software', 'PUC-PR', 'Bacharelado', '2014', '2018', '3600'),
(105, 'Redes de Computadores', 'Senai SC', 'Tecnólogo', '2012', '2015', '2400'),
(106, 'Análise e Desenv. de Sistemas', 'Estácio', 'Tecnólogo', '2019', '2021', '2000'),
(107, 'Administração', 'Unicamp', 'Bacharelado', '2013', '2017', '3000'),
(108, 'Ciência da Computação', 'UFRGS', 'Bacharelado', '2015', '2019', '3400'),
(109, 'Engenharia da Computação', 'UFPE', 'Bacharelado', '2016', '2021', '3800'),
(110, 'Matemática Aplicada', 'UnB', 'Bacharelado', '2011', '2015', '3200'),
(110, 'Inteligência Artificial', 'UnB', 'Mestrado', '2017', '2019', '800');


-- ==========================================
-- 4. EXPERIÊNCIAS PROFISSIONAIS
-- ==========================================
INSERT INTO experiencias (usuario_id, empresa, cargo, mes_inicio, ano_inicio, mes_fim, ano_fim, atual, descricao) VALUES
-- Ana Silva (Front)
(101, 'Tech Solutions', 'Desenvolvedora Front-end Junior', '01', '2020', '12', '2022', FALSE, 'Desenvolvimento de landing pages e manutenção de sistemas legados usando HTML, CSS e JavaScript Vanilla.'),
(101, 'Inova Web', 'Desenvolvedora Front-end Pleno', '01', '2023', NULL, NULL, TRUE, 'Liderança técnica no front-end, migração de plataforma para React e Next.js, melhoria de SEO e performance.'),
-- Carlos Santos (Dados)
(102, 'Banco Nacional', 'Analista de Dados', '06', '2018', NULL, NULL, TRUE, 'Criação de dashboards gerenciais no Power BI. Manutenção de pipelines de dados com Python (Pandas) e SQL.'),
-- Beatriz Costa (UX)
(103, 'Agência Creative', 'Web Designer', '03', '2019', '11', '2021', FALSE, 'Criação de identidade visual e protótipos de alta fidelidade para clientes de e-commerce.'),
(103, 'Fintech Fácil', 'Product Designer Pleno', '12', '2021', NULL, NULL, TRUE, 'Desenho de interfaces para o app financeiro, condução de testes de usabilidade e criação do Design System no Figma.'),
-- Diego Oliveira (Java)
(104, 'Consultoria TI BR', 'Desenvolvedor Back-end Pleno', '02', '2019', NULL, NULL, TRUE, 'Desenvolvimento de APIs RESTFul em Java e Spring Boot. Integração com mensageria (Kafka/RabbitMQ).'),
-- Elena Souza (DevOps)
(105, 'Cloud Services SA', 'Analista de Infraestrutura', '04', '2016', '12', '2019', FALSE, 'Administração de servidores Linux e suporte a redes.'),
(105, 'Tech Global', 'Engenheira DevOps Sênior', '01', '2020', NULL, NULL, TRUE, 'Automatização de esteiras CI/CD com GitLab, provisionamento de infra na AWS usando Terraform e Docker.'),
-- Felipe Rocha (Mobile)
(106, 'StartUp Mobile', 'Desenvolvedor Flutter Junior', '08', '2021', NULL, NULL, TRUE, 'Criação de aplicativo cross-platform para delivery de comida usando Flutter e Firebase.'),
-- Gabriela Lima (PM)
(107, 'HealthTech Saúde+', 'Product Manager', '05', '2020', NULL, NULL, TRUE, 'Gestão do backlog de produto, acompanhamento de OKRs, discovery com usuários e alinhamento com stakeholders.'),
-- Henrique Mendes (QA)
(108, 'E-commerce Center', 'Analista de Qualidade Pleno', '07', '2019', NULL, NULL, TRUE, 'Implementação de cultura de testes automatizados E2E utilizando Cypress. Criação de cenários de teste em BDD.'),
-- Isabela Castro (Full Stack)
(109, 'SoftHouse PE', 'Desenvolvedora Full Stack', '02', '2021', NULL, NULL, TRUE, 'Desenvolvimento de sistemas ERP web utilizando Node.js (Express), PostgreSQL e Vue.js.'),
-- João Pedro Alves (Data Science)
(110, 'GovTech Analytics', 'Cientista de Dados', '03', '2019', NULL, NULL, TRUE, 'Desenvolvimento de modelos preditivos para prevenção de fraudes. Processamento de grandes volumes de texto com NLP.');


-- ==========================================
-- 5. HARD SKILLS
-- ==========================================
INSERT INTO hard_skills (usuario_id, nome) VALUES
-- Ana
(101, 'React'), (101, 'Next.js'), (101, 'TypeScript'), (101, 'Tailwind CSS'), (101, 'Git'),
-- Carlos
(102, 'Python'), (102, 'SQL'), (102, 'Power BI'), (102, 'Pandas'), (102, 'ETL'),
-- Beatriz
(103, 'Figma'), (103, 'Adobe XD'), (103, 'Prototipagem'), (103, 'Pesquisa de Usuário'), (103, 'Design System'),
-- Diego
(104, 'Java'), (104, 'Spring Boot'), (104, 'PostgreSQL'), (104, 'Docker'), (104, 'Microserviços'),
-- Elena
(105, 'AWS'), (105, 'Terraform'), (105, 'Kubernetes'), (105, 'Linux'), (105, 'GitLab CI/CD'),
-- Felipe
(106, 'Flutter'), (106, 'Dart'), (106, 'Firebase'), (106, 'Kotlin'), (106, 'Android SDK'),
-- Gabriela
(107, 'Scrum'), (107, 'Kanban'), (107, 'Product Discovery'), (107, 'Google Analytics'), (107, 'Jira'),
-- Henrique
(108, 'Cypress'), (108, 'Selenium'), (108, 'Postman'), (108, 'Cucumber (BDD)'), (108, 'Testes de API'),
-- Isabela
(109, 'Node.js'), (109, 'Vue.js'), (109, 'JavaScript'), (109, 'Express.js'), (109, 'MySQL'),
-- João Pedro
(110, 'Machine Learning'), (110, 'Python'), (110, 'Scikit-Learn'), (110, 'TensorFlow'), (110, 'NLP');


-- ==========================================
-- 6. SOFT SKILLS
-- ==========================================
INSERT INTO soft_skills (usuario_id, nome) VALUES
-- Ana
(101, 'Comunicação'), (101, 'Trabalho em Equipe'), (101, 'Proatividade'),
-- Carlos
(102, 'Pensamento Analítico'), (102, 'Atenção aos Detalhes'), (102, 'Resolução de Problemas'),
-- Beatriz
(103, 'Empatia'), (103, 'Criatividade'), (103, 'Colaboração'),
-- Diego
(104, 'Foco em Qualidade'), (104, 'Raciocínio Lógico'), (104, 'Gestão de Tempo'),
-- Elena
(105, 'Liderança Técnica'), (105, 'Resiliência'), (105, 'Trabalho sob Pressão'),
-- Felipe
(106, 'Curiosidade'), (106, 'Aprendizado Rápido'), (106, 'Trabalho em Equipe'),
-- Gabriela
(107, 'Liderança'), (107, 'Negociação'), (107, 'Visão Estratégica'),
-- Henrique
(108, 'Atenção aos Detalhes'), (108, 'Comunicação Clara'), (108, 'Pensamento Crítico'),
-- Isabela
(109, 'Adaptabilidade'), (109, 'Trabalho em Equipe'), (109, 'Proatividade'),
-- João Pedro
(110, 'Pensamento Analítico'), (110, 'Resolução de Problemas Complexos'), (110, 'Didática');

-- Reativar checagem de FK
SET FOREIGN_KEY_CHECKS = 1;