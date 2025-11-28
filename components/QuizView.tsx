import React, { useEffect, useState } from 'react';
import { AwsExam, ExamDomain, QuizQuestion, LanguageMode } from '../types';
import { generateQuizQuestion } from '../services/geminiService';
import RubyText from './RubyText';

interface QuizViewProps {
  exam: AwsExam;
  domain: ExamDomain;
  onBack: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ exam, domain, onBack }) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [languageMode, setLanguageMode] = useState<LanguageMode>(LanguageMode.ALL);
  const [streak, setStreak] = useState(0);

  const loadNewQuestion = async () => {
    setLoading(true);
    setShowResult(false);
    setSelectedOption(null);
    setQuestion(null);
    try {
      const data = await generateQuizQuestion(exam.name, domain.title);
      setQuestion(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewQuestion();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam.name, domain.title]);

  const handleOptionSelect = (id: number) => {
    if (showResult) return;
    setSelectedOption(id);
  };

  const checkAnswer = () => {
    if (selectedOption === null) return;
    setShowResult(true);
    if (selectedOption === question?.correctId) {
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const LanguageToggle = () => (
    <div className="flex space-x-2">
      <button 
        onClick={() => setLanguageMode(LanguageMode.ALL)} 
        className={`text-xs px-2 py-1 rounded ${languageMode === LanguageMode.ALL ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
      >
        Trilingual
      </button>
      <button 
        onClick={() => setLanguageMode(LanguageMode.EN)} 
        className={`text-xs px-2 py-1 rounded ${languageMode === LanguageMode.EN ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
      >
        EN
      </button>
      <button 
        onClick={() => setLanguageMode(LanguageMode.JP_RUBY)} 
        className={`text-xs px-2 py-1 rounded ${languageMode === LanguageMode.JP_RUBY ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
      >
        JP
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-6"></div>
        <p className="text-slate-600 font-medium animate-pulse">Consulting the cloud...</p>
      </div>
    );
  }

  if (!question) return <div className="text-center p-10">Error loading question. <button onClick={loadNewQuestion}>Retry</button></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-sm font-medium">
          ← Exit Quiz
        </button>
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-orange-500">Streak: {streak} 🔥</div>
          <LanguageToggle />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        
        {/* Scenario/Context */}
        {question.context && (
          <div className="bg-slate-50 p-6 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Scenario</h3>
            <RubyText content={question.context} mode={languageMode} className="text-slate-700 italic" />
          </div>
        )}

        {/* Question Text */}
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            <RubyText content={question.question} mode={languageMode} />
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((opt) => {
              let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ";
              
              if (showResult) {
                if (opt.id === question.correctId) {
                  btnClass += "border-green-500 bg-green-50 text-green-900";
                } else if (opt.id === selectedOption) {
                  btnClass += "border-red-500 bg-red-50 text-red-900";
                } else {
                  btnClass += "border-slate-100 opacity-50";
                }
              } else {
                if (selectedOption === opt.id) {
                  btnClass += "border-blue-500 bg-blue-50 text-blue-900 shadow-md transform scale-[1.01]";
                } else {
                  btnClass += "border-slate-100 hover:border-blue-200 hover:bg-slate-50";
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionSelect(opt.id)}
                  disabled={showResult}
                  className={btnClass}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold mt-0.5 ${
                        showResult && opt.id === question.correctId ? 'bg-green-500 border-green-500 text-white' :
                        selectedOption === opt.id ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + opt.id)}
                    </div>
                    <RubyText content={opt.text} mode={languageMode} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer / Results */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          {!showResult ? (
            <div className="w-full flex justify-end">
              <button
                onClick={checkAnswer}
                disabled={selectedOption === null}
                className={`px-8 py-3 rounded-lg font-bold text-white shadow-md transition-all ${
                  selectedOption === null 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5'
                }`}
              >
                Check Answer
              </button>
            </div>
          ) : (
            <div className="w-full animate-fadeIn">
               <div className={`p-4 rounded-lg mb-4 text-sm border ${
                 selectedOption === question.correctId ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'
               }`}>
                 <strong className="block mb-1">{selectedOption === question.correctId ? 'Correct! 🎉' : 'Incorrect'}</strong>
                 <RubyText content={question.explanation} mode={languageMode} />
               </div>
               <div className="flex justify-end">
                 <button
                   onClick={loadNewQuestion}
                   className="px-8 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 shadow-lg transition-transform transform hover:-translate-y-0.5"
                 >
                   Next Question →
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizView;