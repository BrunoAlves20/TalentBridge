"use client";

import { useEffect, useState } from "react";
import { Award, CheckCircle2, Circle } from "lucide-react";

interface ProfileStrengthProps {
  usuarioId?: string | null;
}

interface StrengthItem {
  label: string;
  done: boolean;
}

function calcularForca(items: StrengthItem[]): number {
  const feitos = items.filter((i) => i.done).length;
  return Math.round((feitos / items.length) * 100);
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-rose-500 dark:text-rose-400";
}

function barColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-rose-400";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Perfil Forte";
  if (score >= 50) return "Perfil em Construção";
  return "Perfil Incompleto";
}

export function ProfileStrength({ usuarioId }: ProfileStrengthProps) {
  const [items, setItems] = useState<StrengthItem[]>([
    { label: "Foto de perfil", done: false },
    { label: "Dados pessoais completos", done: false },
    { label: "Ao menos 1 experiência profissional", done: false },
    { label: "Formação acadêmica cadastrada", done: false },
    { label: "Ao menos 3 stacks técnicas", done: false },
    { label: "Soft skills definidas", done: false },
    { label: "LinkedIn ou portfólio informado", done: false },
    { label: "Resumo (Sobre mim) preenchido", done: false },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!usuarioId) {
      setIsLoading(false);
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

    fetch(`${API_URL}/candidatos/perfil-completo/${usuarioId}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data?.personal ?? {};
        setItems([
          { label: "Foto de perfil", done: !!p.profilePicture },
          {
            label: "Dados pessoais completos",
            done: !!(p.fullName && p.email && p.phone && p.city),
          },
          {
            label: "Ao menos 1 experiência profissional",
            done: Array.isArray(data?.experience) && data.experience.length > 0,
          },
          {
            label: "Formação acadêmica cadastrada",
            done: Array.isArray(data?.education) && data.education.length > 0,
          },
          {
            label: "Ao menos 3 stacks técnicas",
            done: Array.isArray(data?.stacks) && data.stacks.length >= 3,
          },
          {
            label: "Soft skills definidas",
            done: Array.isArray(data?.softSkills) && data.softSkills.length > 0,
          },
          {
            label: "LinkedIn ou portfólio informado",
            done: !!(p.linkedin || p.portfolio),
          },
          { label: "Resumo (Sobre mim) preenchido", done: !!p.about },
        ]);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [usuarioId]);

  const score = calcularForca(items);

  return (
    <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white">Força do Perfil</p>
            <p className={`text-xs font-bold ${scoreColor(score)}`}>{scoreLabel(score)}</p>
          </div>
        </div>
        <span className={`text-3xl font-black ${scoreColor(score)}`}>
          {isLoading ? "–" : `${score}%`}
        </span>
      </div>

      {/* Barra */}
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-5">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor(score)}`}
          style={{ width: isLoading ? "0%" : `${score}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            {item.done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
            )}
            <span
              className={`text-sm font-medium ${
                item.done
                  ? "text-slate-700 dark:text-slate-300"
                  : "text-slate-400 dark:text-slate-600"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}