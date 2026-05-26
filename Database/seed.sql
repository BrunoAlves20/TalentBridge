-- =============================================================================
-- TalentBridge — Seed de Dados Iniciais
-- =============================================================================
-- Carregado automaticamente pelo backend (database.py -> init_db) na primeira
-- subida do banco. É idempotente: usa INSERT IGNORE / UNIQUE keys, então rodar
-- várias vezes não cria duplicatas.
--
-- Senha padrão de todas as contas de teste: "senha123"
-- (hash bcrypt gerado por services.auth_service.hash_password)
-- =============================================================================

-- ── 1. RECRUTADORES ──────────────────────────────────────────────────────────
INSERT IGNORE INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES
  ('Ana Carolina Souza', 'ana.recrutadora@techsolutions.com',  '$2b$12$jaDJv3BSZ7POXRARNkPycOnJydVjt2OI/XsfZqPvR7iicbe9jVBFG', 'RECRUTADOR'),
  ('Bruno Ferreira',     'bruno.rh@finovapay.com',             '$2b$12$jaDJv3BSZ7POXRARNkPycOnJydVjt2OI/XsfZqPvR7iicbe9jVBFG', 'RECRUTADOR'),
  ('Camila Nogueira',    'camila.talent@healthlab.com',        '$2b$12$jaDJv3BSZ7POXRARNkPycOnJydVjt2OI/XsfZqPvR7iicbe9jVBFG', 'RECRUTADOR');

INSERT IGNORE INTO perfis_recrutadores (usuario_id, empresa, cargo, telefone, site_empresa)
SELECT id, 'Tech Solutions',  'Head de Tecnologia',  '(11) 98000-0001', 'https://techsolutions.com'   FROM usuarios WHERE email='ana.recrutadora@techsolutions.com'
UNION ALL
SELECT id, 'FinovaPay',       'Recrutadora Sênior',  '(11) 98000-0002', 'https://finovapay.com'       FROM usuarios WHERE email='bruno.rh@finovapay.com'
UNION ALL
SELECT id, 'HealthLab',       'Talent Acquisition',  '(11) 98000-0003', 'https://healthlab.com'       FROM usuarios WHERE email='camila.talent@healthlab.com';


-- ── 2. VAGAS ─────────────────────────────────────────────────────────────────
-- Tech Solutions: 2 vagas
INSERT IGNORE INTO vagas (recrutador_id, titulo, departamento, descricao, requisitos, modalidade, localizacao, faixa_salarial, status)
SELECT id,
       'Desenvolvedor(a) Front-end Sênior',
       'Engenharia',
       'Vaga para liderar o desenvolvimento da interface da nova plataforma SaaS. Você trabalhará em time multidisciplinar com produto, design e backend, definindo padrões de componentização e qualidade.',
       'React, TypeScript, Next.js, testes (Jest/RTL), boas práticas de acessibilidade. Diferencial: experiência com Tailwind e Storybook.',
       'REMOTO', 'São Paulo, SP', 'R$ 12.000 – R$ 16.000', 'ABERTA'
FROM usuarios WHERE email='ana.recrutadora@techsolutions.com';

INSERT IGNORE INTO vagas (recrutador_id, titulo, departamento, descricao, requisitos, modalidade, localizacao, faixa_salarial, status)
SELECT id,
       'Engenheiro(a) de Dados',
       'Dados & IA',
       'Construir e manter pipelines de dados para a plataforma de analytics, integrando múltiplas fontes (Postgres, Kafka, S3).',
       'Python, SQL avançado, Airflow, Spark. Conhecimento em modelagem dimensional e data lake.',
       'HIBRIDO', 'São Paulo, SP', 'R$ 14.000 – R$ 18.000', 'ABERTA'
FROM usuarios WHERE email='ana.recrutadora@techsolutions.com';

-- FinovaPay: 2 vagas
INSERT IGNORE INTO vagas (recrutador_id, titulo, departamento, descricao, requisitos, modalidade, localizacao, faixa_salarial, status)
SELECT id,
       'Desenvolvedor(a) Back-end Pleno',
       'Pagamentos',
       'Atuar no core de pagamentos da FinovaPay, escrevendo APIs de alta disponibilidade e participando das discussões de arquitetura.',
       'Node.js ou Python, PostgreSQL, mensageria (RabbitMQ/Kafka), boas práticas de segurança em fintech.',
       'REMOTO', 'Curitiba, PR', 'R$ 9.000 – R$ 13.000', 'ABERTA'
FROM usuarios WHERE email='bruno.rh@finovapay.com';

INSERT IGNORE INTO vagas (recrutador_id, titulo, departamento, descricao, requisitos, modalidade, localizacao, faixa_salarial, status)
SELECT id,
       'Product Designer (UX/UI)',
       'Produto',
       'Desenhar e validar fluxos de pagamento e onboarding de novos clientes PJ. Trabalhar lado a lado com pesquisa e produto.',
       'Figma, prototipação, pesquisa com usuários, design system. Portfólio será solicitado.',
       'HIBRIDO', 'Curitiba, PR', 'R$ 8.000 – R$ 11.000', 'ABERTA'
FROM usuarios WHERE email='bruno.rh@finovapay.com';

-- HealthLab: 1 vaga
INSERT IGNORE INTO vagas (recrutador_id, titulo, departamento, descricao, requisitos, modalidade, localizacao, faixa_salarial, status)
SELECT id,
       'Analista de Marketing Digital',
       'Marketing',
       'Conduzir campanhas pagas e gestão de conteúdo para a vertical de telemedicina da HealthLab.',
       'Google Ads, Meta Ads, SEO, analytics. Experiência com produto digital de saúde é diferencial.',
       'PRESENCIAL', 'Belo Horizonte, MG', 'R$ 5.500 – R$ 7.500', 'ABERTA'
FROM usuarios WHERE email='camila.talent@healthlab.com';


-- ── 3. CANDIDATOS ────────────────────────────────────────────────────────────
INSERT IGNORE INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES
  ('Lucas Almeida',     'lucas.almeida@exemplo.com',     '$2b$12$jaDJv3BSZ7POXRARNkPycOnJydVjt2OI/XsfZqPvR7iicbe9jVBFG', 'CANDIDATO'),
  ('Mariana Pereira',   'mariana.pereira@exemplo.com',   '$2b$12$jaDJv3BSZ7POXRARNkPycOnJydVjt2OI/XsfZqPvR7iicbe9jVBFG', 'CANDIDATO'),
  ('Rafael Costa',      'rafael.costa@exemplo.com',      '$2b$12$jaDJv3BSZ7POXRARNkPycOnJydVjt2OI/XsfZqPvR7iicbe9jVBFG', 'CANDIDATO'),
  ('Juliana Ribeiro',   'juliana.ribeiro@exemplo.com',   '$2b$12$jaDJv3BSZ7POXRARNkPycOnJydVjt2OI/XsfZqPvR7iicbe9jVBFG', 'CANDIDATO'),
  ('Pedro Henrique',    'pedro.henrique@exemplo.com',    '$2b$12$jaDJv3BSZ7POXRARNkPycOnJydVjt2OI/XsfZqPvR7iicbe9jVBFG', 'CANDIDATO'),
  ('Beatriz Lima',      'beatriz.lima@exemplo.com',      '$2b$12$jaDJv3BSZ7POXRARNkPycOnJydVjt2OI/XsfZqPvR7iicbe9jVBFG', 'CANDIDATO'),
  ('Thiago Martins',    'thiago.martins@exemplo.com',    '$2b$12$jaDJv3BSZ7POXRARNkPycOnJydVjt2OI/XsfZqPvR7iicbe9jVBFG', 'CANDIDATO'),
  ('Larissa Oliveira',  'larissa.oliveira@exemplo.com',  '$2b$12$jaDJv3BSZ7POXRARNkPycOnJydVjt2OI/XsfZqPvR7iicbe9jVBFG', 'CANDIDATO');


-- ── 4. PERFIS DOS CANDIDATOS ─────────────────────────────────────────────────
INSERT IGNORE INTO perfis_candidatos (usuario_id, telefone, genero, idade, estado, cidade, cep, linkedin, github, portfolio, sobre_mim)
SELECT id, '(11) 99100-1001', 'Masculino', '28', 'SP', 'São Paulo',  '01310-100', 'linkedin.com/in/lucas-almeida',   'github.com/lucasalmeida', 'lucasdev.com',
       'Desenvolvedor front-end apaixonado por construir interfaces acessíveis e performáticas. 4 anos de experiência em React e TypeScript.'
FROM usuarios WHERE email='lucas.almeida@exemplo.com'
UNION ALL
SELECT id, '(11) 99100-1002', 'Feminino', '31', 'SP', 'São Paulo',  '04543-000', 'linkedin.com/in/mariana-pereira', 'github.com/marianap',      'marianapereira.design',
       'Product Designer com foco em fintechs. Experiência com pesquisa qualitativa e design system escalável.'
FROM usuarios WHERE email='mariana.pereira@exemplo.com'
UNION ALL
SELECT id, '(41) 99100-1003', 'Masculino', '26', 'PR', 'Curitiba',  '80010-100', 'linkedin.com/in/rafael-costa',    'github.com/rafa-costa',    NULL,
       'Engenheiro de software back-end. Forte em Node.js, arquitetura orientada a eventos e observabilidade.'
FROM usuarios WHERE email='rafael.costa@exemplo.com'
UNION ALL
SELECT id, '(31) 99100-1004', 'Feminino', '29', 'MG', 'Belo Horizonte', '30130-001', 'linkedin.com/in/juliana-ribeiro', NULL, NULL,
       'Analista de marketing digital com track record de campanhas para saúde e bem-estar. Apaixonada por dados.'
FROM usuarios WHERE email='juliana.ribeiro@exemplo.com'
UNION ALL
SELECT id, '(21) 99100-1005', 'Masculino', '33', 'RJ', 'Rio de Janeiro', '22021-001', 'linkedin.com/in/pedro-henrique',  'github.com/phenrique',     NULL,
       'Engenheiro de dados sênior. Migrei pipelines on-prem para AWS em duas empresas. Forte em Spark e Airflow.'
FROM usuarios WHERE email='pedro.henrique@exemplo.com'
UNION ALL
SELECT id, '(11) 99100-1006', 'Feminino', '24', 'SP', 'Campinas',   '13010-100', 'linkedin.com/in/beatriz-lima',    'github.com/beatrizlima',   'biahub.dev',
       'Desenvolvedora full-stack júnior em transição de carreira. Bootcamp + projetos pessoais publicados.'
FROM usuarios WHERE email='beatriz.lima@exemplo.com'
UNION ALL
SELECT id, '(41) 99100-1007', 'Masculino', '35', 'PR', 'Curitiba',  '80060-000', 'linkedin.com/in/thiago-martins',  'github.com/tmartins',      NULL,
       'Tech Lead com 10 anos de mercado. Já liderei times de 8 pessoas em produtos de pagamentos.'
FROM usuarios WHERE email='thiago.martins@exemplo.com'
UNION ALL
SELECT id, '(11) 99100-1008', 'Feminino', '27', 'SP', 'São Paulo',  '05407-002', 'linkedin.com/in/larissa-oliveira', NULL, 'larissaoliveira.com',
       'UX Researcher com foco em pesquisa quali e usabilidade. Mestrado em Design pela USP.'
FROM usuarios WHERE email='larissa.oliveira@exemplo.com';


-- ── 5. FORMAÇÕES ─────────────────────────────────────────────────────────────
INSERT INTO formacoes (usuario_id, curso, instituicao, grau, ano_inicio, ano_fim)
SELECT id, 'Ciência da Computação', 'USP',  'Bacharelado', '2014', '2018' FROM usuarios WHERE email='lucas.almeida@exemplo.com'
UNION ALL
SELECT id, 'Design Gráfico',        'ESPM', 'Bacharelado', '2012', '2016' FROM usuarios WHERE email='mariana.pereira@exemplo.com'
UNION ALL
SELECT id, 'Engenharia de Software','PUCPR','Bacharelado', '2016', '2020' FROM usuarios WHERE email='rafael.costa@exemplo.com'
UNION ALL
SELECT id, 'Publicidade e Propaganda','UFMG','Bacharelado','2014','2018' FROM usuarios WHERE email='juliana.ribeiro@exemplo.com'
UNION ALL
SELECT id, 'Sistemas de Informação','UFRJ','Bacharelado', '2010','2014' FROM usuarios WHERE email='pedro.henrique@exemplo.com'
UNION ALL
SELECT id, 'ADS',                    'Senac','Tecnólogo',  '2020','2023' FROM usuarios WHERE email='beatriz.lima@exemplo.com'
UNION ALL
SELECT id, 'Ciência da Computação', 'UFPR', 'Bacharelado', '2008','2013' FROM usuarios WHERE email='thiago.martins@exemplo.com'
UNION ALL
SELECT id, 'Design',                 'USP', 'Mestrado',    '2019','2022' FROM usuarios WHERE email='larissa.oliveira@exemplo.com';


-- ── 6. EXPERIÊNCIAS ──────────────────────────────────────────────────────────
INSERT INTO experiencias (usuario_id, empresa, cargo, mes_inicio, ano_inicio, mes_fim, ano_fim, atual, descricao)
SELECT id, 'StartupX', 'Desenvolvedor Front-end Pleno', '03', '2021', NULL, NULL, TRUE,
       'Liderança técnica do app web em React + Next.js. Implementei o design system interno.'
FROM usuarios WHERE email='lucas.almeida@exemplo.com'
UNION ALL
SELECT id, 'BankPay', 'Product Designer', '06', '2020', NULL, NULL, TRUE,
       'Responsável pelos fluxos de onboarding PJ. Conduzi 30+ entrevistas de pesquisa.'
FROM usuarios WHERE email='mariana.pereira@exemplo.com'
UNION ALL
SELECT id, 'Cloudify', 'Engenheiro Back-end', '01', '2022', NULL, NULL, TRUE,
       'APIs em Node.js processando 5M de requisições/dia. Migração de monolito para microsserviços.'
FROM usuarios WHERE email='rafael.costa@exemplo.com'
UNION ALL
SELECT id, 'HealthBR', 'Analista de Marketing Pleno', '02', '2020', NULL, NULL, TRUE,
       'Cresci a base de leads em 220% via campanhas pagas e SEO de conteúdo.'
FROM usuarios WHERE email='juliana.ribeiro@exemplo.com'
UNION ALL
SELECT id, 'DataCorp', 'Engenheiro de Dados Sênior', '08', '2019', NULL, NULL, TRUE,
       'Construí o data lake da empresa do zero. Pipelines em Airflow + Spark processando 2TB/dia.'
FROM usuarios WHERE email='pedro.henrique@exemplo.com'
UNION ALL
SELECT id, 'Freelancer', 'Desenvolvedora Full-stack', '01', '2024', NULL, NULL, TRUE,
       'Projetos freelance em React + Node para pequenos comércios.'
FROM usuarios WHERE email='beatriz.lima@exemplo.com'
UNION ALL
SELECT id, 'PagSeguro', 'Tech Lead', '05', '2018', NULL, NULL, TRUE,
       'Lidero squad de 8 pessoas no time de pagamentos por cartão. Foco em escalabilidade.'
FROM usuarios WHERE email='thiago.martins@exemplo.com'
UNION ALL
SELECT id, 'Stone', 'UX Researcher', '03', '2022', NULL, NULL, TRUE,
       'Pesquisas com PMEs sobre adoção de maquininhas. Conduzi testes de usabilidade quinzenais.'
FROM usuarios WHERE email='larissa.oliveira@exemplo.com';


-- ── 7. HARD SKILLS ───────────────────────────────────────────────────────────
INSERT INTO hard_skills (usuario_id, nome)
SELECT id, s FROM usuarios CROSS JOIN (
  SELECT 'React' AS s UNION SELECT 'TypeScript' UNION SELECT 'Next.js' UNION SELECT 'Tailwind' UNION SELECT 'Jest'
) skills WHERE email='lucas.almeida@exemplo.com';

INSERT INTO hard_skills (usuario_id, nome)
SELECT id, s FROM usuarios CROSS JOIN (
  SELECT 'Figma' AS s UNION SELECT 'Design System' UNION SELECT 'Prototipação' UNION SELECT 'Pesquisa UX'
) skills WHERE email='mariana.pereira@exemplo.com';

INSERT INTO hard_skills (usuario_id, nome)
SELECT id, s FROM usuarios CROSS JOIN (
  SELECT 'Node.js' AS s UNION SELECT 'PostgreSQL' UNION SELECT 'Kafka' UNION SELECT 'Docker' UNION SELECT 'AWS'
) skills WHERE email='rafael.costa@exemplo.com';

INSERT INTO hard_skills (usuario_id, nome)
SELECT id, s FROM usuarios CROSS JOIN (
  SELECT 'Google Ads' AS s UNION SELECT 'Meta Ads' UNION SELECT 'SEO' UNION SELECT 'Analytics' UNION SELECT 'GA4'
) skills WHERE email='juliana.ribeiro@exemplo.com';

INSERT INTO hard_skills (usuario_id, nome)
SELECT id, s FROM usuarios CROSS JOIN (
  SELECT 'Python' AS s UNION SELECT 'Spark' UNION SELECT 'Airflow' UNION SELECT 'SQL' UNION SELECT 'AWS'
) skills WHERE email='pedro.henrique@exemplo.com';

INSERT INTO hard_skills (usuario_id, nome)
SELECT id, s FROM usuarios CROSS JOIN (
  SELECT 'JavaScript' AS s UNION SELECT 'React' UNION SELECT 'Node.js' UNION SELECT 'MongoDB'
) skills WHERE email='beatriz.lima@exemplo.com';

INSERT INTO hard_skills (usuario_id, nome)
SELECT id, s FROM usuarios CROSS JOIN (
  SELECT 'Java' AS s UNION SELECT 'Kotlin' UNION SELECT 'Microsserviços' UNION SELECT 'Liderança Técnica' UNION SELECT 'AWS'
) skills WHERE email='thiago.martins@exemplo.com';

INSERT INTO hard_skills (usuario_id, nome)
SELECT id, s FROM usuarios CROSS JOIN (
  SELECT 'Pesquisa Qualitativa' AS s UNION SELECT 'Teste de Usabilidade' UNION SELECT 'Figma' UNION SELECT 'Miro'
) skills WHERE email='larissa.oliveira@exemplo.com';


-- ── 8. SOFT SKILLS ───────────────────────────────────────────────────────────
INSERT INTO soft_skills (usuario_id, nome)
SELECT id, s FROM usuarios CROSS JOIN (
  SELECT 'Comunicação' AS s UNION SELECT 'Trabalho em Equipe' UNION SELECT 'Proatividade'
) skills WHERE email IN (
  'lucas.almeida@exemplo.com','mariana.pereira@exemplo.com','rafael.costa@exemplo.com',
  'juliana.ribeiro@exemplo.com','pedro.henrique@exemplo.com','beatriz.lima@exemplo.com',
  'thiago.martins@exemplo.com','larissa.oliveira@exemplo.com'
);


-- ── 9. CANDIDATURAS DE EXEMPLO ───────────────────────────────────────────────
-- Lucas → Front-end Sênior (Tech Solutions)
INSERT IGNORE INTO candidaturas (vaga_id, candidato_id, status)
SELECT v.id, u.id, 'EM_ANALISE'
FROM vagas v
JOIN usuarios r ON r.id = v.recrutador_id AND r.email='ana.recrutadora@techsolutions.com'
JOIN usuarios u ON u.email='lucas.almeida@exemplo.com'
WHERE v.titulo='Desenvolvedor(a) Front-end Sênior';

-- Beatriz → Front-end Sênior (também)
INSERT IGNORE INTO candidaturas (vaga_id, candidato_id, status)
SELECT v.id, u.id, 'ENVIADO'
FROM vagas v
JOIN usuarios r ON r.id = v.recrutador_id AND r.email='ana.recrutadora@techsolutions.com'
JOIN usuarios u ON u.email='beatriz.lima@exemplo.com'
WHERE v.titulo='Desenvolvedor(a) Front-end Sênior';

-- Pedro Henrique → Engenheiro de Dados
INSERT IGNORE INTO candidaturas (vaga_id, candidato_id, status)
SELECT v.id, u.id, 'ENTREVISTA'
FROM vagas v
JOIN usuarios r ON r.id = v.recrutador_id AND r.email='ana.recrutadora@techsolutions.com'
JOIN usuarios u ON u.email='pedro.henrique@exemplo.com'
WHERE v.titulo='Engenheiro(a) de Dados';

-- Rafael → Back-end Pleno (FinovaPay)
INSERT IGNORE INTO candidaturas (vaga_id, candidato_id, status)
SELECT v.id, u.id, 'EM_ANALISE'
FROM vagas v
JOIN usuarios r ON r.id = v.recrutador_id AND r.email='bruno.rh@finovapay.com'
JOIN usuarios u ON u.email='rafael.costa@exemplo.com'
WHERE v.titulo='Desenvolvedor(a) Back-end Pleno';

-- Thiago → Back-end Pleno (também)
INSERT IGNORE INTO candidaturas (vaga_id, candidato_id, status)
SELECT v.id, u.id, 'ENTREVISTA'
FROM vagas v
JOIN usuarios r ON r.id = v.recrutador_id AND r.email='bruno.rh@finovapay.com'
JOIN usuarios u ON u.email='thiago.martins@exemplo.com'
WHERE v.titulo='Desenvolvedor(a) Back-end Pleno';

-- Mariana → Product Designer (FinovaPay)
INSERT IGNORE INTO candidaturas (vaga_id, candidato_id, status)
SELECT v.id, u.id, 'ENVIADO'
FROM vagas v
JOIN usuarios r ON r.id = v.recrutador_id AND r.email='bruno.rh@finovapay.com'
JOIN usuarios u ON u.email='mariana.pereira@exemplo.com'
WHERE v.titulo='Product Designer (UX/UI)';

-- Larissa → Product Designer (também)
INSERT IGNORE INTO candidaturas (vaga_id, candidato_id, status)
SELECT v.id, u.id, 'EM_ANALISE'
FROM vagas v
JOIN usuarios r ON r.id = v.recrutador_id AND r.email='bruno.rh@finovapay.com'
JOIN usuarios u ON u.email='larissa.oliveira@exemplo.com'
WHERE v.titulo='Product Designer (UX/UI)';

-- Juliana → Marketing Digital (HealthLab)
INSERT IGNORE INTO candidaturas (vaga_id, candidato_id, status)
SELECT v.id, u.id, 'APROVADO'
FROM vagas v
JOIN usuarios r ON r.id = v.recrutador_id AND r.email='camila.talent@healthlab.com'
JOIN usuarios u ON u.email='juliana.ribeiro@exemplo.com'
WHERE v.titulo='Analista de Marketing Digital';


-- ── 10. VAGAS SALVAS DE EXEMPLO ──────────────────────────────────────────────
-- Lucas salvou a vaga de Engenheiro de Dados
INSERT IGNORE INTO vagas_salvas (usuario_id, vaga_id)
SELECT u.id, v.id FROM usuarios u, vagas v
WHERE u.email='lucas.almeida@exemplo.com' AND v.titulo='Engenheiro(a) de Dados';

-- Beatriz salvou a vaga de Product Designer (interesse em transição)
INSERT IGNORE INTO vagas_salvas (usuario_id, vaga_id)
SELECT u.id, v.id FROM usuarios u, vagas v
WHERE u.email='beatriz.lima@exemplo.com' AND v.titulo='Product Designer (UX/UI)';
