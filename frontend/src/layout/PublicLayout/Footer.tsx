import { Briefcase, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-900 dark:text-white">Talent Bridge</span>
            </div>
            <p className="text-sm text-blue-800 dark:text-gray-400 leading-relaxed">
              Conectando empresas aos melhores talentos através de tecnologia e inteligência artificial.
            </p>
          </div>

          <div>
            <h3 className="text-blue-900 dark:text-white font-semibold mb-4">Para Candidatos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                  Encontrar Vagas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                  Coach de IA
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                  Preparação para Entrevistas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                  Dicas de Carreira
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-blue-900 dark:text-white font-semibold mb-4">Para Empresas</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                  Publicar Vagas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                  ATS Inteligente
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                  Planos e Preços
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                  Cases de Sucesso
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-blue-900 dark:text-white font-semibold mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>suporte.talentbridge@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>(61) 99999-9999</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Faculdade Senac, Brasília, DF</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-blue-800 dark:text-gray-400">
              © 2024 Talent Bridge. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                Termos de Uso
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
