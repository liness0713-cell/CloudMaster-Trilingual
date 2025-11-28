import React from 'react';
import { ContentText, LanguageMode } from '../types';

interface RubyTextProps {
  content: ContentText;
  mode: LanguageMode;
  className?: string;
}

const RubyText: React.FC<RubyTextProps> = ({ content, mode, className = "" }) => {
  // Simple rendering for single language modes
  if (mode === LanguageMode.EN) return <div className={`font-medium ${className}`}>{content.en}</div>;
  if (mode === LanguageMode.ZH) return <div className={`font-medium ${className}`}>{content.zh}</div>;
  if (mode === LanguageMode.JP) return <div className={`font-medium ${className}`}>{content.jp}</div>;
  
  if (mode === LanguageMode.JP_RUBY) {
    return (
      <div 
        className={`font-medium ${className}`}
        dangerouslySetInnerHTML={{ __html: content.jp_ruby }} 
      />
    );
  }

  // ALL Mode: Stack them
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-slate-900">{content.en}</div>
      <div className="text-slate-700">{content.zh}</div>
      <div 
        className="text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content.jp_ruby }} 
      />
    </div>
  );
};

export default RubyText;