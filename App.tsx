import React, { useState } from 'react';
import ExamSelector from './components/ExamSelector';
import SyllabusView from './components/SyllabusView';
import StudyView from './components/StudyView';
import QuizView from './components/QuizView';
import SimulationView from './components/SimulationView';
import { AwsExam, ExamDomain, ViewState } from './types';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('HOME');
  const [selectedExam, setSelectedExam] = useState<AwsExam | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<ExamDomain | null>(null);

  const handleExamSelect = (exam: AwsExam) => {
    setSelectedExam(exam);
    setViewState('SYLLABUS');
  };

  const handleDomainSelect = (domain: ExamDomain, mode: 'STUDY' | 'QUIZ') => {
    setSelectedDomain(domain);
    setViewState(mode === 'STUDY' ? 'STUDY' : 'QUIZ');
  };

  const handleStartSimulation = () => {
    setViewState('SIMULATION');
  }

  const handleBackToSyllabus = () => {
    setViewState('SYLLABUS');
    setSelectedDomain(null);
  };

  const handleBackToHome = () => {
    setViewState('HOME');
    setSelectedExam(null);
    setSelectedDomain(null);
  };

  // Simple Header
  const Header = () => (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          onClick={handleBackToHome}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
            C
          </div>
          <span className="font-bold text-slate-800 tracking-tight text-xl">Cloud<span className="text-blue-600">Master</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Documentation</a>
          <div className="w-px h-4 bg-slate-300"></div>
          <div className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded border border-slate-200">
             Trilingual Edition
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {viewState === 'HOME' && (
          <ExamSelector onSelect={handleExamSelect} />
        )}

        {viewState === 'SYLLABUS' && selectedExam && (
          <SyllabusView 
            exam={selectedExam} 
            onSelectDomain={handleDomainSelect}
            onStartSimulation={handleStartSimulation}
            onBack={handleBackToHome}
          />
        )}

        {viewState === 'STUDY' && selectedExam && selectedDomain && (
          <StudyView 
            exam={selectedExam}
            domain={selectedDomain}
            onBack={handleBackToSyllabus}
          />
        )}

        {viewState === 'QUIZ' && selectedExam && selectedDomain && (
          <QuizView 
            exam={selectedExam}
            domain={selectedDomain}
            onBack={handleBackToSyllabus}
          />
        )}

        {viewState === 'SIMULATION' && selectedExam && (
          <SimulationView
            exam={selectedExam}
            onBack={handleBackToSyllabus}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm mb-3">
            Powered by Google Gemini • Built for AWS Professionals
          </p>
          <div className="flex justify-center items-center gap-2">
             <span className="text-xs text-slate-300">Friend Link:</span>
             <a 
               href="https://my-portfolio-beige-five-56.vercel.app/" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="text-xs text-slate-400 hover:text-blue-600 transition-colors font-medium inline-block"
             >
               千葉２狗 🐶
             </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;