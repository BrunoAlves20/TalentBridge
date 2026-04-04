CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('CANDIDATO', 'RECRUTADOR') NOT NULL DEFAULT 'CANDIDATO',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1. Tabela do Perfil Principal
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

-- 2. Tabela de Formações Acadêmicas
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

-- 3. Tabela de Experiências Profissionais
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

-- 4. Tabelas de Habilidades (Hard e Soft Skills separadas)
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

-- ==========================================
-- REDEFINIÇÃO DE SENHA
-- ==========================================

-- Tabela para armazenar códigos de verificação de redefinição de senha
CREATE TABLE IF NOT EXISTS codigos_redefinicao_senha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    expira_em TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ==========================================
-- ÁREA DO RECRUTADOR E VAGAS
-- ==========================================

-- 5. Tabela de Perfil do Recrutador
CREATE TABLE IF NOT EXISTS perfis_recrutadores (
    usuario_id INT PRIMARY KEY,
    empresa VARCHAR(255) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    site_empresa VARCHAR(255),
    foto_perfil LONGTEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 6. Tabela de Vagas
CREATE TABLE IF NOT EXISTS vagas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recrutador_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
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

-- 7. Tabela de Candidaturas (A ponte entre Candidato e Vaga)
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