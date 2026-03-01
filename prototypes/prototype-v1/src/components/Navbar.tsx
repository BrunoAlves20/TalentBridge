import { Briefcase } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Talent Bridge</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#vagas" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
              Vagas
            </a>
            <a href="#empresas" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
              Empresas
            </a>
            <a href="#entrevistas" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
              Entrevistas
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium px-4 py-2">
              Entrar
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
              Criar Conta
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
