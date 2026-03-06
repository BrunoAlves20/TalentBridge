// export function CVSetupView() {
//     return (
//         <div className="container max-w-2xl p-6 space-y-6 mx-auto mt-10">
//             <div className="text-center">
//                 <h1 className="text-3xl font-bold tracking-tight">Configure seu Currículo</h1>
//                 <p className="text-muted-foreground mt-2">Faça upload de um PDF ou construa seu perfil passo a passo.</p>
//             </div>
//             <div className="grid gap-6 pt-8 md:grid-cols-2">
//                 {/* Opções de Inserção de Dados */}
//                 <div className="border rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition-colors">
//                     <h3 className="font-semibold text-lg mb-2">Upload de PDF</h3>
//                     <p className="text-sm text-muted-foreground">Deixe a IA extrair seus dados automaticamente.</p>
//                 </div>
//                 <div className="border rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition-colors">
//                     <h3 className="font-semibold text-lg mb-2">Preenchimento Manual</h3>
//                     <p className="text-sm text-muted-foreground">Preencha seus dados etapa por etapa.</p>
//                 </div>
//             </div>
//         </div>
//     );
// }

"use client";

import { useState, useEffect } from "react";
import { Loader2, Edit3, Lock } from "lucide-react";

export function AreaCandidatoView() {
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  
  // Controle de edição e carregamento
  const [isEditing, setIsEditing] = useState(false); 
  const [isLoadingFetch, setIsLoadingFetch] = useState(true);

  const [perfil, setPerfil] = useState({
    nome: "",
    sobrenome: "",
    telefone: "",
    email_contato: "",
    situacao_empregaticia: "Trabalhando",
    estado: "",
    cidade: ""
  });

  // 1. Pega o ID e busca os dados no Banco quando a tela abre
  useEffect(() => {
    const id = localStorage.getItem("usuario_id");
    if (id) {
      setUsuarioId(Number(id));
      buscarDadosDoPerfil(Number(id));
    }
  }, []);

  // 2. Função que busca os dados na nova rota do FastAPI
  const buscarDadosDoPerfil = async (id: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/candidatos/perfil-pessoal/${id}`);
      if (response.ok) {
        const data = await response.json();
        // Se o banco retornar dados, preenche o formulário
        setPerfil({
          nome: data.nome || "",
          sobrenome: data.sobrenome || "",
          telefone: data.telefone || "",
          email_contato: data.email_contato || "",
          situacao_empregaticia: data.situacao_empregaticia || "Trabalhando",
          estado: data.estado || "",
          cidade: data.cidade || ""
        });
        
        // Se já tem sobrenome cadastrado, significa que não é o primeiro acesso, então bloqueia a edição
        if (data.sobrenome) {
          setIsEditing(false);
        } else {
          setIsEditing(true); // Se for o primeiro acesso, deixa aberto para ele preencher
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados", error);
    } finally {
      setIsLoadingFetch(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioId) return alert("Erro: ID do usuário não encontrado!");

    setMensagem({ texto: "", tipo: "" });

    try {
      const payload = {
        usuario_id: usuarioId,
        nome: perfil.nome,
        sobrenome: perfil.sobrenome,
        telefone: perfil.telefone,
        email_contato: perfil.email_contato,
        situacao_empregaticia: perfil.situacao_empregaticia,
        estado: perfil.estado,
        cidade: perfil.cidade,
        redes_sociais: [] 
      };

      const response = await fetch("http://127.0.0.1:8000/candidatos/perfil-pessoal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMensagem({ texto: "Perfil salvo com sucesso no Banco de Dados!", tipo: "sucesso" });
        setIsEditing(false); // Trava a tela após salvar
      } else {
        const err = await response.json();
        setMensagem({ texto: "Erro: " + err.detail, tipo: "erro" });
      }
    } catch (error) {
      console.error(error);
      setMensagem({ texto: "Erro de conexão com a API.", tipo: "erro" });
    }
  };

  if (isLoadingFetch) {
    return <div className="flex items-center justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl bg-card border border-border rounded-xl shadow-sm p-6">
      
      {/* CABEÇALHO E BOTÃO DE EDIÇÃO */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Perfil Pessoal</h2>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            isEditing 
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isEditing ? <><Lock className="w-4 h-4"/> Bloquear Edição</> : <><Edit3 className="w-4 h-4"/> Editar Dados</>}
        </button>
      </div>

      {mensagem.texto && (
        <div className={`p-4 mb-6 rounded-md font-medium ${mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {mensagem.texto}
        </div>
      )}
      
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
        
        {/* FIELDSET CONTROLA O BLOQUEIO DA TELA */}
        <fieldset disabled={!isEditing} className="space-y-4 disabled:opacity-70 transition-opacity">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input className="w-full p-2 rounded-md border border-input bg-background" placeholder="Nome" value={perfil.nome} onChange={e => setPerfil({...perfil, nome: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sobrenome</label>
              <input className="w-full p-2 rounded-md border border-input bg-background" placeholder="Sobrenome" value={perfil.sobrenome} onChange={e => setPerfil({...perfil, sobrenome: e.target.value})} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input className="w-full p-2 rounded-md border border-input bg-background" placeholder="Telefone" value={perfil.telefone} onChange={e => setPerfil({...perfil, telefone: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-mail de Contato</label>
              <input className="w-full p-2 rounded-md border border-input bg-background" type="email" placeholder="E-mail" value={perfil.email_contato} onChange={e => setPerfil({...perfil, email_contato: e.target.value})} required />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Situação Empregatícia</label>
            <select className="w-full p-2 rounded-md border border-input bg-background" value={perfil.situacao_empregaticia} onChange={e => setPerfil({...perfil, situacao_empregaticia: e.target.value})}>
              <option value="Estudante">Estudante</option>
              <option value="Estágio">Estágio</option>
              <option value="Trabalhando">Trabalhando</option>
              <option value="Desempregado">Desempregado</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estado (Ex: DF, SP)</label>
              <input className="w-full p-2 rounded-md border border-input bg-background" placeholder="Estado" value={perfil.estado} onChange={e => setPerfil({...perfil, estado: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <input className="w-full p-2 rounded-md border border-input bg-background" placeholder="Cidade" value={perfil.cidade} onChange={e => setPerfil({...perfil, cidade: e.target.value})} required />
            </div>
          </div>
        </fieldset>

        {isEditing && (
          <button type="submit" className="w-full padding-10 bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-all font-medium">
            Salvar Alterações
          </button>
        )}
      </form>
    </div>
  );
}