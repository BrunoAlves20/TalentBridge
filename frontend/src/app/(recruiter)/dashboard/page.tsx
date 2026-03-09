import {
  Briefcase,
  Users,
  UserCheck,
  Calendar,
  Award,
  TrendingUp
} from "lucide-react";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function RecruiterDashboard() {

  const stats = [
    {
      title: "Vagas Abertas",
      value: "12",
      icon: Briefcase
    },
    {
      title: "Total de Candidatos",
      value: "348",
      icon: Users
    },
    {
      title: "Candidatos em Processo",
      value: "74",
      icon: UserCheck
    },
    {
      title: "Entrevistas Agendadas",
      value: "19",
      icon: Calendar
    },
    {
      title: "Contratações no Mês",
      value: "6",
      icon: Award
    },
    {
      title: "Taxa de Conversão",
      value: "8.3%",
      icon: TrendingUp
    }
  ];

  const candidates = [
    {
      id: 1,
      name: "Lucas Mendes",
      role: "Frontend Developer",
      match: "92%",
      status: "Entrevista"
    },
    {
      id: 2,
      name: "Ana Costa",
      role: "React Developer",
      match: "88%",
      status: "Triagem"
    },
    {
      id: 3,
      name: "Pedro Alves",
      role: "Full Stack Developer",
      match: "84%",
      status: "Teste Técnico"
    }
  ];

  const getStatusColor = (status: string) => {

    if (status === "Entrevista")
      return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400";

    if (status === "Triagem")
      return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400";

    return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Título */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard do Recrutador
          </h1>

          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Gerencie vagas, candidatos e acompanhe o progresso do recrutamento.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {stats.map((stat, index) => {

            const Icon = stat.icon;

            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >

                <div className="flex items-center justify-between mb-4">

                  <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>

                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {stat.title}
                </p>

                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {stat.value}
                </p>

              </div>
            );

          })}
        </div>


        {/* Candidatos */}
        <div className="mt-12">

          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Candidatos Recentes
          </h2>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">

            <table className="w-full">

              <thead className="bg-slate-50 dark:bg-slate-800 text-left">

                <tr className="text-sm text-slate-600 dark:text-slate-300">

                  <th className="px-6 py-4">Candidato</th>
                  <th className="px-6 py-4">Cargo</th>
                  <th className="px-6 py-4">Match</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">

                {candidates.map((candidate) => (

                  <tr key={candidate.id}>

                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {candidate.name}
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {candidate.role}
                    </td>

                    <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-semibold">
                      {candidate.match}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`text-xs px-3 py-1 rounded-full ${getStatusColor(candidate.status)}`}
                      >
                        {candidate.status}
                      </span>

                    </td>

                    <td className="px-6 py-4 text-right">

                      <Link
                        href={`/recruiter/candidate/${candidate.id}`}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                      >
                        Ver Perfil
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>
  );
}