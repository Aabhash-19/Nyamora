'use client';

import React from 'react';

interface NyanMessageTextProps {
  text: string;
  isUser?: boolean;
}

export function NyanMessageText({ text, isUser = false }: NyanMessageTextProps) {
  if (isUser) {
    return <p className="whitespace-pre-wrap">{text}</p>;
  }

  const lines = (text || '').split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-xs">
      {lines.map((rawLine, lineIdx) => {
        let line = rawLine;
        if (!line.trim()) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Check if line is a bullet item (* or - or •)
        let isBullet = false;
        if (/^\s*[*•-]\s+/.test(line)) {
          isBullet = true;
          line = line.replace(/^\s*[*•-]\s+/, '');
        }

        // Check if line is a numbered item (1. , 2. )
        const numberMatch = line.match(/^(\d+\.)\s+(.*)/);
        let prefix = '';
        if (numberMatch) {
          prefix = numberMatch[1] + ' ';
          line = numberMatch[2];
        }

        const parts: React.ReactNode[] = [];
        // Group 1,2: ***Bold & Italic Title***
        // Group 3,4: **Bold Text**
        // Group 5,6: *Roleplay Action / Narration*
        const regex = /(\*\*\*([^*]+)\*\*\*)|(\*\*([^*]+)\*\*)|((?<!\*)\*([^*]+)\*(?!\*))/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            // Clean any stray asterisks in plain text
            const rawText = line.substring(lastIndex, match.index).replace(/\*\*/g, '');
            if (rawText) parts.push(rawText);
          }

          if (match[1]) {
            // Group 1: ***Title / Highlight*** (Bold + Italic in soft purple/white, zero asterisks)
            parts.push(
              <strong
                key={`${lineIdx}-${match.index}`}
                className="font-bold text-purple-300 dark:text-purple-200 underline decoration-purple-500/40"
              >
                {match[2]}
              </strong>
            );
          } else if (match[3]) {
            // Group 3: **Bold text** (Clean bold, zero asterisks)
            parts.push(
              <strong
                key={`${lineIdx}-${match.index}`}
                className="font-bold text-slate-900 dark:text-white"
              >
                {match[4]}
              </strong>
            );
          } else if (match[5]) {
            // Group 5: *Action / Narration* (Vivid violet color, italicized)
            parts.push(
              <span
                key={`${lineIdx}-${match.index}`}
                className="text-purple-600 dark:text-purple-400 font-semibold italic inline-block px-0.5"
              >
                *{match[6]}*
              </span>
            );
          }
          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < line.length) {
          const tailText = line.substring(lastIndex).replace(/\*\*/g, '');
          if (tailText) parts.push(tailText);
        }

        return (
          <div
            key={lineIdx}
            className={`flex items-start gap-1.5 ${isBullet ? 'pl-2' : ''}`}
          >
            {isBullet && (
              <span className="text-purple-500 font-bold select-none">•</span>
            )}
            {prefix && (
              <span className="font-semibold text-purple-400 select-none">{prefix}</span>
            )}
            <div className="flex-1 min-w-0 text-slate-800 dark:text-slate-200">
              {parts}
            </div>
          </div>
        );
      })}
    </div>
  );
}
