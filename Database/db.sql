-- =============================================================================
-- TalentBridge — Banco de Dados Completo (Versão Final Corrigida)
-- Inclui: Estrutura Base, Migração Parte 2 e Dados de Teste
-- Compatibilidade: MySQL 5.7+ e 8.0+
-- =============================================================================

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('CANDIDATO', 'RECRUTADOR') NOT NULL DEFAULT 'CANDIDATO',
    preferencias JSON NULL COMMENT 'Toggles de notificação: {"email_candidatura": true, "email_status": true, "email_novidades": false}',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela do Perfil Principal do Candidato
CREATE TABLE IF NOT EXISTS perfis_candidatos (
    usuario_id INT PRIMARY KEY,
    telefone VARCHAR(20),
    genero VARCHAR(50),
    idade VARCHAR(10),
    estado VARCHAR(50),
    cidade VARCHAR(100),
    cep VARCHAR(20),
    linkedin VARCHAR(255),
    github VARCHAR(255),
    portfolio VARCHAR(255),
    sobre_mim TEXT,
    foto_perfil LONGTEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 3. Tabela de Formações Acadêmicas
CREATE TABLE IF NOT EXISTS formacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    curso VARCHAR(255),
    instituicao VARCHAR(255),
    grau VARCHAR(100),
    ano_inicio VARCHAR(10),
    ano_fim VARCHAR(10),
    horas VARCHAR(50),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 4. Tabela de Experiências Profissionais
CREATE TABLE IF NOT EXISTS experiencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    empresa VARCHAR(255),
    cargo VARCHAR(255),
    mes_inicio VARCHAR(10),
    ano_inicio VARCHAR(10),
    mes_fim VARCHAR(10),
    ano_fim VARCHAR(10),
    atual BOOLEAN DEFAULT FALSE,
    descricao TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 5. Tabelas de Habilidades (Hard e Soft Skills)
CREATE TABLE IF NOT EXISTS hard_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(100),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS soft_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(100),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 6. Redefinição de Senha
CREATE TABLE IF NOT EXISTS codigos_redefinicao_senha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    expira_em TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 7. Tabela de Perfil do Recrutador
CREATE TABLE IF NOT EXISTS perfis_recrutadores (
    usuario_id INT PRIMARY KEY,
    empresa VARCHAR(255) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    site_empresa VARCHAR(255),
    foto_perfil LONGTEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 8. Tabela de Vagas
CREATE TABLE IF NOT EXISTS vagas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recrutador_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    departamento VARCHAR(255),
    descricao TEXT NOT NULL,
    requisitos TEXT,
    modalidade ENUM('PRESENCIAL', 'HIBRIDO', 'REMOTO') NOT NULL DEFAULT 'PRESENCIAL',
    localizacao VARCHAR(255),
    faixa_salarial VARCHAR(100),
    status ENUM('ABERTA', 'PAUSADA', 'ENCERRADA') NOT NULL DEFAULT 'ABERTA',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recrutador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 9. Tabela de Candidaturas
CREATE TABLE IF NOT EXISTS candidaturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vaga_id INT NOT NULL,
    candidato_id INT NOT NULL,
    status ENUM('ENVIADO', 'EM_ANALISE', 'ENTREVISTA', 'APROVADO', 'REJEITADO') NOT NULL DEFAULT 'ENVIADO',
    data_candidatura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vaga_id) REFERENCES vagas(id) ON DELETE CASCADE,
    FOREIGN KEY (candidato_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unica_candidatura (vaga_id, candidato_id)
);

-- 10. Tabela de Vagas Salvas (Migração Parte 2)
CREATE TABLE IF NOT EXISTS vagas_salvas (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id       INT NOT NULL,
    vaga_id          INT NOT NULL,
    data_salvamento  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (vaga_id)    REFERENCES vagas(id)    ON DELETE CASCADE,
    UNIQUE KEY uq_usuario_vaga (usuario_id, vaga_id)
);

-- 11. Tabela de Códigos de Verificação para Cadastros Pendentes e Alterações
CREATE TABLE IF NOT EXISTS codigos_verificacao (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    ref_id           VARCHAR(255) NOT NULL COMMENT 'usuario_id (int) ou email (string) para cadastros pendentes',
    codigo           VARCHAR(6)   NOT NULL,
    tipo             ENUM('cadastro', 'recuperacao', 'alteracao_email') NOT NULL,
    expira_em        TIMESTAMP    NOT NULL,
    usado            BOOLEAN      NOT NULL DEFAULT FALSE,
    dados_pendentes  JSON         NULL     COMMENT 'Dados pendentes serializados — gravados no banco só após validação',
    criado_em        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. Índices Adicionais para Otimização (Seguros para MySQL < 8.0.12)

-- Índice em candidaturas(candidato_id)
SET @idx1 = (SELECT COUNT(1) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'candidaturas' AND INDEX_NAME = 'idx_candidaturas_candidato');
SET @sql1 = IF(@idx1 = 0, 'CREATE INDEX idx_candidaturas_candidato ON candidaturas (candidato_id)', 'SELECT "Índice idx_candidaturas_candidato já existe"');
PREPARE stmt1 FROM @sql1; EXECUTE stmt1; DEALLOCATE PREPARE stmt1;

-- Índice em candidaturas(vaga_id)
SET @idx2 = (SELECT COUNT(1) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'candidaturas' AND INDEX_NAME = 'idx_candidaturas_vaga');
SET @sql2 = IF(@idx2 = 0, 'CREATE INDEX idx_candidaturas_vaga ON candidaturas (vaga_id)', 'SELECT "Índice idx_candidaturas_vaga já existe"');
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- Índice em vagas_salvas(usuario_id)
SET @idx3 = (SELECT COUNT(1) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vagas_salvas' AND INDEX_NAME = 'idx_vagas_salvas_usuario');
SET @sql3 = IF(@idx3 = 0, 'CREATE INDEX idx_vagas_salvas_usuario ON vagas_salvas (usuario_id)', 'SELECT "Índice idx_vagas_salvas_usuario já existe"');
PREPARE stmt3 FROM @sql3; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

-- Índice para as buscas do endpoint /auth/verify-code
SET @idx4 = (SELECT COUNT(1) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'codigos_verificacao' AND INDEX_NAME = 'idx_cv_ref_tipo_usado');
SET @sql4 = IF(@idx4 = 0, 'CREATE INDEX idx_cv_ref_tipo_usado ON codigos_verificacao (ref_id, tipo, usado)', 'SELECT "Índice idx_cv_ref_tipo_usado já existe"');
PREPARE stmt4 FROM @sql4; EXECUTE stmt4; DEALLOCATE PREPARE stmt4;

-- Índice para o cooldown (busca por criado_em do último código)
SET @idx5 = (SELECT COUNT(1) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'codigos_verificacao' AND INDEX_NAME = 'idx_cv_criado');
SET @sql5 = IF(@idx5 = 0, 'CREATE INDEX idx_cv_criado ON codigos_verificacao (ref_id, tipo, criado_em)', 'SELECT "Índice idx_cv_criado já existe"');
PREPARE stmt5 FROM @sql5; EXECUTE stmt5; DEALLOCATE PREPARE stmt5;