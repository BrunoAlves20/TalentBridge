"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Upload, Loader2, Edit3, Lock } from "lucide-react";

export function CurriculoFormView() {
    const [usuarioId, setUsuarioId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
    
    // --- NOVO: Controle de Edição ---
    const [isEditing, setIsEditing] = useState(true); 

    // --- NOVO: Data Máxima (Hoje) ---
    // Pega a data atual do navegador e formata para YYYY-MM-DD
    const hoje = new Date().toISOString().split("T")[0];

    // --- ESTADOS DO FORMULÁRIO ---
    const [telefone, setTelefone] = useState("");
    const [sobreVoce, setSobreVoce] = useState("");
    const [habilidades, setHabilidades] = useState<string[]>([]);
    const [novaHabilidade, setNovaHabilidade] = useState("");
    const [experiencias, setExperiencias] = useState([{ empresa: "", cargo: "", data_inicio: "", data_fim: "", descricao: "" }]);
    const [formacoes, setFormacoes] = useState([{ instituicao: "", curso: "", tipo: "Bacharelado", data_inicio: "", data_fim: "" }]);
    const [cursos, setCursos] = useState([{ nome: "", instituicao: "" }]);
    const [idiomas, setIdiomas] = useState([{ idioma: "", nivel: "Básico" }]);
    const [curriculoPdf, setCurriculoPdf] = useState<File | null>(null);

    useEffect(() => {
        const id = localStorage.getItem("usuario_id");
        if (id) setUsuarioId(Number(id));
    }, []);

    const adicionarHabilidade = () => {
        if (novaHabilidade.trim() !== "" && habilidades.length < 2) {
            setHabilidades([...habilidades, novaHabilidade.trim()]);
            setNovaHabilidade("");
        } else if (habilidades.length >= 2) {
            alert("Você só pode adicionar 2 habilidades por enquanto.");
        }
    };

    const removerHabilidade = (index: number) => {
        setHabilidades(habilidades.filter((_, i) => i !== index));
    };

    // --- NOVO: Bloquear o envio pelo Enter ---
    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        // Se a tecla for Enter e o usuário NÃO estiver dentro do <textarea> (resumo)
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault(); // Impede que o formulário seja enviado
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usuarioId) return alert("Erro: ID do usuário não encontrado. Faça login novamente.");
        
        setIsLoading(true);
        setMensagem({ texto: "", tipo: "" });

        try {
            const payloadJSON = {
                usuario_id: usuarioId,
                telefone: telefone || "Não informado",
                sobre_voce: sobreVoce,
                habilidades: habilidades,
                experiencias: experiencias.filter(exp => exp.empresa !== ""),
                formacoes: formacoes.filter(form => form.instituicao !== ""),
                cursos: cursos.filter(curso => curso.nome !== ""),
                idiomas: idiomas.filter(id => id.idioma !== "")
            };

            const formData = new FormData();
            formData.append("dados_json", JSON.stringify(payloadJSON));
            
            if (curriculoPdf) {
                formData.append("curriculo", curriculoPdf);
            }

            const response = await fetch("http://127.0.0.1:8000/candidatos/area", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setMensagem({ texto: "Currículo salvo com sucesso!", tipo: "sucesso" });
                setIsEditing(false); // Bloqueia a edição automaticamente após salvar com sucesso!
            } else {
                setMensagem({ texto: "Erro: " + data.detail, tipo: "erro" });
            }
        } catch (error) {
            console.error(error);
            setMensagem({ texto: "Erro ao conectar com o servidor.", tipo: "erro" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl bg-card border border-border rounded-xl shadow-sm p-6">
            
            {/* CABEÇALHO COM BOTÃO DE EDIÇÃO */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Seus Dados Profissionais</h2>
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
                <div className={`p-4 mb-6 rounded-md font-medium ${mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    {mensagem.texto}
                </div>
            )}

            {/* ADICIONADO onKeyDown AQUI */}
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">
                
                {/* O FIELDSET BLOQUEIA TUDO QUE ESTÁ DENTRO SE isEditing FOR FALSE */}
                <fieldset disabled={!isEditing} className="space-y-8 disabled:opacity-70 transition-opacity">
                    
                    {/* SEÇÃO 1: SOBRE VOCÊ */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">1. Sobre Você</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Telefone (Obrigatório para o Currículo)</label>
                            <input type="text" className="w-full p-2 rounded-md border border-input bg-background" value={telefone} onChange={e => setTelefone(e.target.value)} required placeholder="(11) 99999-9999" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Resumo Profissional</label>
                            <textarea className="w-full p-2 rounded-md border border-input bg-background min-h-[100px]" value={sobreVoce} onChange={e => setSobreVoce(e.target.value)} placeholder="Fale um pouco sobre sua trajetória..." required />
                        </div>
                    </section>

                    {/* SEÇÃO 2: HABILIDADES */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">2. Habilidades (Máx: 2)</h3>
                        <div className="flex gap-2">
                            <input type="text" className="flex-1 p-2 rounded-md border border-input bg-background" value={novaHabilidade} onChange={e => setNovaHabilidade(e.target.value)} placeholder="Ex: Python, React, Gestão de Projetos" />
                            <button type="button" onClick={adicionarHabilidade} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 flex items-center gap-1 disabled:opacity-50">
                                <Plus className="w-4 h-4" /> Adicionar
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {habilidades.map((hab, index) => (
                                <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-primary/20">
                                    {hab}
                                    {/* Esconde o botão de remover se não estiver editando */}
                                    {isEditing && (
                                        <button type="button" onClick={() => removerHabilidade(index)} className="text-primary hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    )}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* SEÇÃO 3: EXPERIÊNCIA */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">3. Última Experiência</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" className="p-2 rounded-md border border-input" placeholder="Empresa" value={experiencias[0].empresa} onChange={e => setExperiencias([{...experiencias[0], empresa: e.target.value}])} />
                            <input type="text" className="p-2 rounded-md border border-input" placeholder="Cargo" value={experiencias[0].cargo} onChange={e => setExperiencias([{...experiencias[0], cargo: e.target.value}])} />
                            
                            {/* NOVO: max={hoje} adicionado */}
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Data Início</label>
                                <input type="date" max={hoje} className="w-full p-2 rounded-md border border-input" value={experiencias[0].data_inicio} onChange={e => setExperiencias([{...experiencias[0], data_inicio: e.target.value}])} />
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Data Fim</label>
                                <input type="date" max={hoje} className="w-full p-2 rounded-md border border-input" value={experiencias[0].data_fim} onChange={e => setExperiencias([{...experiencias[0], data_fim: e.target.value}])} />
                            </div>
                        </div>
                    </section>

                    {/* SEÇÃO 4: FORMAÇÃO ACADÊMICA */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">4. Formação Acadêmica</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" className="p-2 rounded-md border border-input" placeholder="Instituição" value={formacoes[0].instituicao} onChange={e => setFormacoes([{...formacoes[0], instituicao: e.target.value}])} />
                            <input type="text" className="p-2 rounded-md border border-input" placeholder="Curso" value={formacoes[0].curso} onChange={e => setFormacoes([{...formacoes[0], curso: e.target.value}])} />
                            
                            {/* NOVO: max={hoje} adicionado */}
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Data Início</label>
                                <input type="date" max={hoje} className="w-full p-2 rounded-md border border-input" value={formacoes[0].data_inicio} onChange={e => setFormacoes([{...formacoes[0], data_inicio: e.target.value}])} />
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Data Conclusão</label>
                                <input type="date" max={hoje} className="w-full p-2 rounded-md border border-input" value={formacoes[0].data_fim} onChange={e => setFormacoes([{...formacoes[0], data_fim: e.target.value}])} />
                            </div>
                        </div>
                    </section>

                    {/* SEÇÃO 5: UPLOAD DE CURRÍCULO */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">5. Anexar PDF Original</h3>
                        <div className="flex items-center gap-4">
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-md ${isEditing ? 'cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
                                <Upload className="w-4 h-4" /> {curriculoPdf ? "Trocar Arquivo" : "Escolher PDF"}
                                <input type="file" accept=".pdf" disabled={!isEditing} className="hidden" onChange={e => e.target.files && setCurriculoPdf(e.target.files[0])} />
                            </label>
                            <span className="text-sm text-muted-foreground">
                                {curriculoPdf ? curriculoPdf.name : "Nenhum arquivo selecionado"}
                            </span>
                        </div>
                    </section>
                </fieldset>

                {/* BOTÃO SALVAR (Só aparece se o modo de edição estiver ATIVADO) */}
                {isEditing && (
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-all">
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Salvar Currículo Completo"}
                    </button>
                )}

            </form>
        </div>
    );
}