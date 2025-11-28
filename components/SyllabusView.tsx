import React, { useEffect, useState } from 'react';
import { AwsExam, ExamDomain } from '../types';
import { generateSyllabus } from '../services/geminiService';
import RubyText from './RubyText';
import { LanguageMode } from '../types';

interface SyllabusViewProps {
  exam: AwsExam;
  onSelectDomain: (domain: ExamDomain, mode: 'STUDY' | 'QUIZ') => void;
  onStartSimulation: () => void;
  onBack: () => void;
}

const SyllabusView: React.FC<SyllabusViewProps> = ({ exam, onSelectDomain, onStartSimulation, onBack }) => {
  const [domains, setDomains] = useState<ExamDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDomains = async () => {
      try {
        setLoading(true);
        const data = await generateSyllabus(exam.name);
        if (isMounted) setDomains(data);
      } catch (err) {
        if (isMounted) setError("Failed to generate syllabus. Please check your API key or try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDomains();
    return () => { isMounted = false; };
  }, [exam.name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-6"></div>
        <h2 className="text-2xl font-bold text-slate-800 animate-pulse">Designing your Learning Path...</h2>
        <p className="text-slate-500 mt-2">AI is analyzing the official {exam.code} exam guide to structure your modules.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-red-500 mb-4 text-6xl">⚠️</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Generation Failed</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <button onClick={onBack} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={onBack} className="mb-6 text-slate-500 hover:text-slate-800 flex items-center font-medium">
        ← Change Exam
      </button>

      <div className="mb-10 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
           <span className={`px-3 py-1 text-sm font-bold text-white rounded-full ${exam.color}`}>
              {exam.code}
           </span>
           <span className="text-slate-500 font-medium">{exam.level}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{exam.name} Syllabus</h1>
      </div>

      {/* Mock Exam Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 mb-12 text-white shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
           <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Ready to test your knowledge?</h2>
          <p className="text-slate-300 mb-6 max-w-xl">
            Take a simulated mock exam with 10 randomly selected questions covering all domains. 
            Includes a timer and detailed score report.
          </p>
          <button 
            onClick={onStartSimulation}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow transition-transform transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            Start Mock Exam
            <span className="bg-blue-700 px-2 py-0.5 rounded text-xs">Beta</span>
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-6 border-l-4 border-blue-600 pl-4">Focus by Domain</h2>
      
      <div className="grid gap-6">
        {domains.map((domain, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
            <div className="flex-shrink-0 flex flex-col items-center justify-center md:w-24 border-r border-slate-100 pr-6 md:border-none md:pr-0">
               <span className="text-3xl font-black text-blue-600">{domain.percentage}%</span>
               <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Weight</span>
            </div>

            <div className="flex-grow">
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                Domain {index + 1}: {domain.title}
              </h3>
              
              <div className="grid grid-cols-1 gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg mb-4">
                <RubyText content={domain.description} mode={LanguageMode.ALL} />
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => onSelectDomain(domain, 'STUDY')}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Study Guide
                </button>
                <button
                  onClick={() => onSelectDomain(domain, 'QUIZ')}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-blue-200 text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Quick Quiz
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyllabusView;