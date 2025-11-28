import React from 'react';
import { AWS_EXAMS } from '../constants';
import { AwsExam } from '../types';

interface ExamSelectorProps {
  onSelect: (exam: AwsExam) => void;
}

const ExamSelector: React.FC<ExamSelectorProps> = ({ onSelect }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Select Your Certification</h1>
        <p className="text-lg text-slate-600">Choose an AWS exam to generate a personalized trilingual study plan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AWS_EXAMS.map((exam) => (
          <button
            key={exam.code}
            onClick={() => onSelect(exam)}
            className="group relative flex flex-col items-start text-left bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-2 h-full ${exam.color} transition-all group-hover:w-full opacity-100 group-hover:opacity-5`}></div>
            
            <div className="p-6 w-full relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 text-xs font-semibold uppercase tracking-wide rounded ${exam.color.replace('bg-', 'text-').replace('600', '700')} bg-slate-100`}>
                  {exam.level}
                </span>
                <span className="text-slate-400 font-mono text-sm">{exam.code}</span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                {exam.name}
              </h3>
              
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                {exam.description}
              </p>
              
              <div className="mt-auto flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                Start Preparation <span className="ml-1">→</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExamSelector;