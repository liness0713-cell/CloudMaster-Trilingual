import React, { useEffect, useState } from 'react';
import { AwsExam, ExamDomain, StudyModule, LanguageMode } from '../types';
import { generateStudyMaterial } from '../services/geminiService';
import RubyText from './RubyText';

interface StudyViewProps {
  exam: AwsExam;
  domain: ExamDomain;
  onBack: () => void;
}

const StudyView: React.FC<StudyViewProps> = ({ exam, domain, onBack }) => {
  const [module, setModule] = useState<StudyModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [languageMode, setLanguageMode] = useState<LanguageMode>(LanguageMode.ALL);

  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      try {
        setLoading(true);
        const data = await generateStudyMaterial(exam.name, domain.title);
        if (isMounted) setModule(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadContent();
    return () => { isMounted = false; };
  }, [exam.name, domain.title]);

  const LanguageSelector = () => (
    <div className="flex bg-slate-100 p-1 rounded-lg self-start">
      {[
        { mode: LanguageMode.ALL, label: 'All' },
        { mode: LanguageMode.EN, label: 'EN' },
        { mode: LanguageMode.ZH, label: '中' },
        { mode: LanguageMode.JP_RUBY, label: '日(Ruby)' }
      ].map((opt) => (
        <button
          key={opt.mode}
          onClick={() => setLanguageMode(opt.mode)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
            languageMode === opt.mode 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  if (loading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <h2 className="text-xl font-medium text-slate-700">Generating Study Material for {domain.title}...</h2>
      </div>
    );
  }

  if (!module) return <div className="p-10 text-center">Failed to load content.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center font-medium">
          ← Back to Syllabus
        </button>
        <LanguageSelector />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white">
          <div className="text-indigo-100 text-sm font-semibold uppercase tracking-wider mb-2">
            Study Module
          </div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            {module.title.en}
          </h1>
          {(languageMode === LanguageMode.ALL || languageMode === LanguageMode.JP_RUBY) && (
             <div className="mt-2 text-indigo-100 text-lg" dangerouslySetInnerHTML={{__html: module.title.jp_ruby}} />
          )}
        </div>

        <div className="p-8">
          <div className="mb-10">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Overview</h2>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
               <RubyText content={module.description} mode={languageMode} className="leading-7" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-6 border-b pb-2">Key Concepts</h2>
            <div className="grid gap-6">
              {module.keyPoints.map((point, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-grow pt-1">
                    <RubyText content={point} mode={languageMode} className="text-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyView;