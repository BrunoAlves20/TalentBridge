import { Briefcase } from "lucide-react";
import { Sun, Moon } from "lucide-react";

type NavbarProps = {
  theme: string;
  toggleTheme: () => void;
};

export default function Navbar({ theme, toggleTheme }: NavbarProps) {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Talent Bridge
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#vagas" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors duration-200 font-medium">
              Vagas
            </a>
            <a href="#empresas" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors duration-200 font-medium">
              Empresas
            </a>
            <a href="#entrevistas" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors duration-200 font-medium">
              Entrevistas
            </a>
          </div>

          <div className="flex items-center space-x-4">

            <button
              onClick={toggleTheme}
              className="relative w-14 h-8 flex items-center 
              bg-gray-300 dark:bg-gray-700 
              rounded-full p-1 transition-colors duration-300 mr-2"
              aria-label="Alternar tema"
            >
              <div
                className={`absolute left-1 top-1 w-6 h-6 rounded-full 
                bg-white dark:bg-gray-900 
                shadow-md transform transition-transform duration-300
                ${theme === "dark" ? "translate-x-6" : "translate-x-0"}`}
              />
              <Sun className="w-4 h-4 text-yellow-500 ml-1 z-10" />
              <Moon className="w-4 h-4 text-blue-400 ml-auto mr-1 z-10" />
            </button>

            <div className="hidden md:flex items-center space-x-3 border-l border-gray-200 dark:border-gray-700 pl-6">
              <a href="#login" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Entrar
              </a>
              <a href="#cadastro" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                Criar Conta
              </a>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}