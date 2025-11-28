import React, { useEffect, useState, useRef } from 'react';
import { AwsExam, QuizQuestion, LanguageMode } from '../types';
import { generateMockQuestion } from '../services/geminiService';
import RubyText from './RubyText';

interface SimulationViewProps {
  exam: AwsExam;
  onBack: () => void;
}

const QUESTIONS_COUNT = 10;
const PASSING_PERCENTAGE = 72; // Standard AWS passing score approx 720/1000

const SimulationView: React.FC<SimulationViewProps> = ({ exam, onBack }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [languageMode, setLanguageMode] = useState<LanguageMode>(LanguageMode.ALL);
  const [timeLeft, setTimeLeft] = useState(QUESTIONS_COUNT * 2 * 60); // 2 mins per question

  const fetchedCountRef = useRef(0);

  // Fetch questions one by one to ensure responsiveness, but act like a linear exam
  const fetchNextQuestion = async () => {
    if (fetchedCountRef.current >= QUESTIONS_COUNT) return;
    
    try {
      setLoading(true);
      const q = await generateMockQuestion(exam.name);
      setQuestions(prev => [...prev, q]);
      fetchedCountRef.current += 1;
    } catch (e) {
      console.error("Failed to fetch mock question", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNextQuestion();
    
    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOptionSelect = (optionId: number) => {
    if (isFinished) return;
    setUserAnswers(prev => ({ ...prev, [currentIndex]: optionId }));
  };

  const handleNext = async () => {
    if (currentIndex < QUESTIONS_COUNT - 1) {
      const nextIdx = currentIndex + 1;
      if (!questions[nextIdx]) {
        await fetchNextQuestion();
      }
      setCurrentIndex(nextIdx);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const finishExam = () => {
    setIsFinished(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctId) correct++;
    });
    return Math.round((correct / questions.length) * 100);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const LanguageToggle = () => (
    <div className="flex bg-slate-100 rounded-lg p-1">
      {[
        { m: LanguageMode.ALL, l: 'Mix' },
        { m: LanguageMode.EN, l: 'EN' },
        { m: LanguageMode.ZH, l: '中' },
        { m: LanguageMode.JP_RUBY, l: '日' },
      ].map(opt => (
        <button
          key={opt.m}
          onClick={() => setLanguageMode(opt.m)}
          className={`px-3 py-1 text-xs font-bold rounded ${languageMode === opt.m ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
        >
          {opt.l}
        </button>
      ))}
    </div>
  );

  // --- RESULTS VIEW ---
  if (isFinished) {
    const score = calculateScore();
    const passed = score >= PASSING_PERCENTAGE;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-slate-200">
          <div className={`p-8 text-center ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Exam Results: {exam.code}</h2>
            <div className="text-6xl font-black mb-4">
              <span className={passed ? 'text-green-600' : 'text-red-600'}>{score}%</span>
            </div>
            <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${passed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
              {passed ? 'Passed' : 'Failed'}
            </div>
            <p className="mt-4 text-slate-600">
              You answered {questions.filter((_, i) => userAnswers[i] === questions[i].correctId).length} out of {questions.length} questions correctly.
            </p>
          </div>
          
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <span className="text-slate-500 text-sm">Review your answers below</span>
            <button onClick={onBack} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700">
              Back to Syllabus
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const isCorrect = userAnswers[idx] === q.correctId;
            const userAnswerId = userAnswers[idx];
            
            return (
              <div key={idx} className={`bg-white rounded-xl shadow-sm border-l-4 p-6 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <div className="flex justify-between mb-4">
                  <span className="text-sm font-bold text-slate-400">Question {idx + 1}</span>
                  {isCorrect ? (
                    <span className="text-green-600 font-bold text-sm">Correct</span>
                  ) : (
                    <span className="text-red-600 font-bold text-sm">Incorrect (Your Answer: {String.fromCharCode(65 + (userAnswerId ?? -1))})</span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  <RubyText content={q.question} mode={languageMode} />
                </h3>

                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 mb-4">
                  <strong className="block mb-1 text-slate-900">Correct Answer:</strong>
                  <div className="flex gap-2">
                    <span className="font-bold text-green-600">{String.fromCharCode(65 + q.correctId)}.</span>
                    <RubyText content={q.options.find(o => o.id === q.correctId)?.text || {en:'',zh:'',jp:'',jp_ruby:''}} mode={languageMode} />
                  </div>
                </div>

                <div className="text-sm text-slate-600 bg-blue-50 p-4 rounded-lg">
                  <strong className="block mb-1 text-blue-900">Explanation:</strong>
                  <RubyText content={q.explanation} mode={languageMode} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- EXAM VIEW ---
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-600">Mock Exam</span> {exam.code}
          </h1>
          <p className="text-slate-500 text-sm">Question {currentIndex + 1} of {QUESTIONS_COUNT}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`font-mono text-xl font-bold px-4 py-2 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-slate-800 text-white'}`}>
            {formatTime(timeLeft)}
          </div>
          <LanguageToggle />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${((currentIndex + 1) / QUESTIONS_COUNT) * 100}%` }}
        ></div>
      </div>

      {/* Loading State */}
      {loading && !questions[currentIndex] ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-slate-500">Retrieving question from certification database...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden min-h-[400px] flex flex-col">
          {/* Question Content */}
          <div className="p-6 md:p-8 flex-grow">
             {questions[currentIndex]?.context && (
               <div className="bg-slate-50 p-4 rounded-lg mb-6 border-l-4 border-blue-200 text-sm italic text-slate-700">
                  <RubyText content={questions[currentIndex].context!} mode={languageMode} />
               </div>
             )}
             
             <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">
                  <RubyText content={questions[currentIndex]?.question} mode={languageMode} />
                </h2>
             </div>

             <div className="space-y-3">
               {questions[currentIndex]?.options.map((opt) => (
                 <button
                   key={opt.id}
                   onClick={() => handleOptionSelect(opt.id)}
                   className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                     userAnswers[currentIndex] === opt.id 
                       ? 'border-blue-600 bg-blue-50 shadow-md' 
                       : 'border-slate-100 hover:border-blue-300 hover:bg-slate-50'
                   }`}
                 >
                   <div className="flex gap-3">
                     <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold mt-0.5 ${
                        userAnswers[currentIndex] === opt.id ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-400'
                     }`}>
                       {String.fromCharCode(65 + opt.id)}
                     </div>
                     <RubyText content={opt.text} mode={languageMode} />
                   </div>
                 </button>
               ))}
             </div>
          </div>

          {/* Controls */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button 
              onClick={handlePrev} 
              disabled={currentIndex === 0}
              className="px-6 py-2 text-slate-600 font-medium hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentIndex === QUESTIONS_COUNT - 1 ? (
              <button 
                onClick={finishExam}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md transform hover:-translate-y-0.5 transition-all"
              >
                Submit Exam
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transform hover:-translate-y-0.5 transition-all"
              >
                Next Question →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationView;