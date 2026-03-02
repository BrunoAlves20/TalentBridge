
-- Configurações iniciais
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Criação do Banco de Dados
CREATE SCHEMA IF NOT EXISTS `talentbridge` DEFAULT CHARACTER SET utf8 ;
USE `talentbridge` ;

-- -----------------------------------------------------
-- RF01: Login/cadastro e Perfis
-- Tabela central para separar Candidatos e Recrutadores.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `talentbridge`.`usuarios` (
  `id` VARCHAR(36) NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `senha_hash` VARCHAR(255) NOT NULL,
  `tipo_usuario` VARCHAR(50) NULL DEFAULT NULL COMMENT 'CANDIDATO ou RECRUTADOR',
  `criado_em` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX (`email` ASC) VISIBLE);

-- -----------------------------------------------------
-- RF02: Cadastro de Currículo (Manual)
-- RF03: Extração de CV via IA (Campo url_curriculo_s3)
-- RF04: Revisão e Edição de Dados (Campos dados_brutos_ia e revisao_concluida)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `talentbridge`.`perfis_candidatos` (
  `id` VARCHAR(36) NOT NULL,
  `usuario_id` VARCHAR(36) NULL DEFAULT NULL,
  `telefone` VARCHAR(20) NULL DEFAULT NULL,
  `resumo_profissional` TEXT NULL DEFAULT NULL,
  `url_curriculo_s3` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Link do PDF na AWS',
  `dados_brutos_ia` TEXT NULL DEFAULT NULL COMMENT 'JSON com dados aguardando revisão',
  `revisao_concluida` TINYINT NULL DEFAULT FALSE,
  `atualizado_em` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX (`usuario_id` ASC) VISIBLE,
  FOREIGN KEY (`usuario_id`) REFERENCES `talentbridge`.`usuarios` (`id`));

-- -----------------------------------------------------
-- RF02 e RF04: Experiências do Candidato
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `talentbridge`.`experiencias` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` VARCHAR(36) NULL DEFAULT NULL,
  `empresa` VARCHAR(255) NULL DEFAULT NULL,
  `cargo` VARCHAR(255) NULL DEFAULT NULL,
  `data_inicio` DATE NULL DEFAULT NULL,
  `data_fim` DATE NULL DEFAULT NULL,
  `descricao` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX (`usuario_id` ASC) VISIBLE,
  FOREIGN KEY (`usuario_id`) REFERENCES `talentbridge`.`usuarios` (`id`));

-- -----------------------------------------------------
-- RF02 e RF04: Formações do Candidato
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `talentbridge`.`formacoes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` VARCHAR(36) NULL DEFAULT NULL,
  `instituicao` VARCHAR(255) NULL DEFAULT NULL,
  `curso` VARCHAR(255) NULL DEFAULT NULL,
  `tipo` VARCHAR(100) NULL DEFAULT NULL,
  `data_conclusao` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX (`usuario_id` ASC) VISIBLE,
  FOREIGN KEY (`usuario_id`) REFERENCES `talentbridge`.`usuarios` (`id`));

-- -----------------------------------------------------
-- RF02 e RF06: Dicionário de Habilidades
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `talentbridge`.`habilidades` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX (`nome` ASC) VISIBLE);

-- -----------------------------------------------------
-- RF02 e RF06: Vínculo entre Candidato e Habilidade (N:N)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `talentbridge`.`candidato_habilidades` (
  `usuario_id` VARCHAR(36) NOT NULL,
  `habilidade_id` INT NOT NULL,
  PRIMARY KEY (`usuario_id`, `habilidade_id`),
  INDEX (`habilidade_id` ASC) VISIBLE,
  FOREIGN KEY (`usuario_id`) REFERENCES `talentbridge`.`usuarios` (`id`),
  FOREIGN KEY (`habilidade_id`) REFERENCES `talentbridge`.`habilidades` (`id`));

-- -----------------------------------------------------
-- RF05: Dashboard do Recrutador (Gestão de Vagas)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `talentbridge`.`vagas` (
  `id` VARCHAR(36) NOT NULL,
  `recrutador_id` VARCHAR(36) NULL DEFAULT NULL,
  `titulo` VARCHAR(255) NULL DEFAULT NULL,
  `descricao` TEXT NULL DEFAULT NULL,
  `status` VARCHAR(50) NULL DEFAULT NULL,
  `criado_em` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`recrutador_id` ASC) VISIBLE,
  FOREIGN KEY (`recrutador_id`) REFERENCES `talentbridge`.`usuarios` (`id`));

-- -----------------------------------------------------
-- RF06: Motor de Ranking (Habilidades exigidas na vaga)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `talentbridge`.`vaga_habilidades` (
  `vaga_id` VARCHAR(36) NOT NULL,
  `habilidade_id` INT NOT NULL,
  `peso` INT NULL DEFAULT NULL COMMENT 'Importância da skill para a vaga',
  PRIMARY KEY (`vaga_id`, `habilidade_id`),
  INDEX (`habilidade_id` ASC) VISIBLE,
  FOREIGN KEY (`vaga_id`) REFERENCES `talentbridge`.`vagas` (`id`),
  FOREIGN KEY (`habilidade_id`) REFERENCES `talentbridge`.`habilidades` (`id`));

-- -----------------------------------------------------
-- RF05 e RF06: Pipeline e Triagem de Candidatos
-- O campo 'score_match' atende diretamente ao RF06.
-- O campo 'status_pipeline' atende ao RF05.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `talentbridge`.`candidaturas` (
  `id` VARCHAR(36) NULL DEFAULT NULL,
  `usuario_id` VARCHAR(36) NULL DEFAULT NULL,
  `vaga_id` VARCHAR(36) NULL DEFAULT NULL,
  `status_pipeline` VARCHAR(100) NULL DEFAULT NULL,
  `score_match` DECIMAL(5,2) NULL DEFAULT NULL,
  `data_candidatura` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`usuario_id` ASC) VISIBLE,
  INDEX (`vaga_id` ASC) VISIBLE,
  FOREIGN KEY (`usuario_id`) REFERENCES `mydb`.`usuarios` (`id`),
  FOREIGN KEY (`vaga_id`) REFERENCES `mydb`.`vagas` (`id`));
  
-- -----------------------------------------------------
-- RF07: Simulador de Entrevista
-- Interface de chat e áudio para perguntas em tempo real.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `talentbridge`.`entrevistas_ia` (
  `id` VARCHAR(36) NULL DEFAULT NULL,
  `candidatura_id` VARCHAR(36) NULL DEFAULT NULL,
  `status` VARCHAR(50) NULL DEFAULT NULL,
  `transcricao_chat` TEXT NULL DEFAULT NULL,
  `feedback_geral` TEXT NULL DEFAULT NULL,
  `pontuacao_final` DECIMAL(5,2) NULL DEFAULT NULL,
  `realizada_em` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX (`candidatura_id` ASC) VISIBLE,
  FOREIGN KEY (`candidatura_id`) REFERENCES `mydb`.`candidaturas` (`id`));


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;