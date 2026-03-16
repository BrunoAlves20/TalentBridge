# TalentBridge

O **TalentBridge** é uma plataforma inovadora desenvolvida para solucionar as dores do mercado relacionadas ao recrutamento lento. Através do uso de Inteligência Artificial e automação inteligente, o sistema conecta empresas e candidatos de forma ágil, modernizando o fluxo de triagem, extração de dados e até mesmo a condução de simulações de entrevistas.

---

## 🚀 Tecnologias Utilizadas

A stack tecnológica do projeto foi dividida estrategicamente para garantir performance na interface e robustez no processamento de IA:

* **Frontend (Interface):** Desenvolvido utilizando a biblioteca **React** combinada ao framework **Next.js** e tipagem estática com **TypeScript**. Essa união foi escolhida para a criação de componentes de interface dinâmicos, seguros e de alta fidelidade, como a Dashboard do Candidato com filtros de busca avançados e a complexa renderização da sala de entrevista da IA, que simula ondas de áudio em tempo real.
* **Backend & Processamento:** Construído em **Python**. A linguagem fornece a base estrutural para o servidor, sendo diretamente responsável pelo recebimento, tratamento de upload de arquivos PDF e extração de dados de currículos. 
* **Inteligência Artificial:** Para garantir automação de ponta, o sistema integra tecnologias avançadas de **OCR** (Reconhecimento Ótico de Caracteres) e **LLMs** (Modelos de Linguagem Grande) para a leitura, extração e preenchimento automático inteligente das informações dos candidatos.

---

## 🗄️ Arquitetura do Banco de Dados

O armazenamento e relacionamento das informações da plataforma são garantidos por uma estrutura relacional forte:

* **SGBD**: O sistema utiliza o banco de dados **MySQL**.
* **Modelagem (DER)**: A modelagem foi desenhada através de um Diagrama de Entidade-Relacionamento, com foco principal nas tabelas estruturais de Usuários e Vagas.
* **Relacionamentos**: A arquitetura suporta estruturas de alta complexidade, contendo mapeamentos de relações muitos-para-muitos, como as interações e cruzamentos de dados entre as tabelas de Habilidades e Candidatos.

---

## ✨ Funcionalidades Principais

O sistema conta com um backlog priorizado para atender as principais necessidades de recrutadores e candidatos:

* **Login e Perfis**: Sistema de cadastro seguro com fluxos separados para perfis de Candidatos e Recrutadores.
* **Extração Inteligente de CV**: Upload de currículos em formato PDF com extração automática de dados (Dados Pessoais, Experiências, Habilidades) impulsionada por IA.
* **Motor de Ranking (Triagem)**: Algoritmo interno que avalia e pontua candidatos com base no "match" entre o perfil do usuário e os requisitos específicos das vagas cadastradas.
* **Simulador de Entrevista com IA**: Ambiente de chat e áudio para a realização de perguntas técnicas e comportamentais em tempo real.
* **Dashboard do Recrutador**: Interface consolidada que permite a visão de vagas ativas e gestão completa do pipeline de candidatos.
* **Relatório Pós-Entrevista e Feedback**: Análise gerada por Inteligência Artificial indicando clareza e confiança, além de apontar pontos fortes e de melhoria após as simulações.

---
