import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CodeBlockProps {
  children: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className }) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const language = className?.replace('language-', '') || '';

  return (
    <div className="relative glass-card rounded-xl overflow-hidden border border-[var(--border)] backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--background)] bg-opacity-50">
        <span className="text-sm text-[var(--text-secondary)] font-medium">{language}</span>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-all duration-300 ease-in-out"
          aria-label={isMinimized ? "Expand code" : "Minimize code"}
        >
          {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>
      <div className={`transition-all duration-300 ease-in-out ${isMinimized ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'}`}>
        <pre className="p-4 m-0 overflow-auto custom-scrollbar">
          <code className={`${className} font-mono text-sm`}>{children}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
