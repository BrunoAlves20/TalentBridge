import { useState } from 'react';
import { Mic, CheckCircle, Sparkles } from 'lucide-react';
import { aiInterviewQuestion, mockAIFeedback } from '../data/mockData';

export default function AICoachTeaser() {
  const [isRecording, setIsRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleMicClick = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setShowFeedback(true);
    }, 2000);
  };

  const resetDemo = () => {
    setShowFeedback(false);
    setIsRecording(false);
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 
            bg-green-100 dark:bg-green-900/40 
            text-green-700 dark:text-green-300 
            px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Para Candidatos</span>
          </div>

          <h2 className="text-4xl font-bold 
            text-gray-900 dark:text-white 
            mb-4">
            Prepare-se com Inteligência Artificial
          </h2>

          <p className="text-xl 
            text-gray-600 dark:text-gray-300 
            max-w-3xl mx-auto">
            Nosso Coach de IA treina você para entrevistas reais.
            Pratique respostas, receba feedback instantâneo e chegue confiante na entrevista.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br 
            from-blue-50 to-indigo-50 
            dark:from-gray-800 dark:to-gray-900 
            rounded-2xl p-8 shadow-xl 
            border border-blue-100 dark:border-gray-700">

            {!showFeedback ? (
              <div className="space-y-6">
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="bg-blue-600 rounded-lg p-2">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                        Pergunta do Coach de IA
                      </div>

                      <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                        {aiInterviewQuestion}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <button
                    onClick={handleMicClick}
                    disabled={isRecording}
                    className={`group relative ${
                      isRecording
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-full p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 disabled:hover:translate-y-0`}
                  >
                    <Mic className="w-12 h-12" />
                  </button>

                  <div className="text-center">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {isRecording ? 'Gravando sua resposta...' : 'Clique para responder'}
                    </p>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {isRecording ? 'Fale naturalmente' : 'Use o microfone para praticar'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                  <div className="flex items-center space-x-3 mb-6">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Análise Completa
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {mockAIFeedback.map((feedback, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {feedback.category}
                          </span>

                          <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                            {feedback.score}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                            style={{ width: `${feedback.score}%` }}
                          />
                        </div>

                        <span className="inline-block 
                          bg-green-100 dark:bg-green-900/40 
                          text-green-700 dark:text-green-300 
                          text-xs font-semibold px-3 py-1 rounded-full">
                          {feedback.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={resetDemo}
                    className="text-blue-600 dark:text-blue-400 hover:opacity-80 font-medium transition-colors duration-200"
                  >
                    Tentar Outra Pergunta →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              Começar Treino Gratuito
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}