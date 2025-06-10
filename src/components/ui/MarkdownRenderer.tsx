"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !props.inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Кастомные стили для других элементов
          h1: (props) => <h1 className="text-2xl font-bold my-4" {...props} />,
          h2: (props) => <h2 className="text-xl font-bold my-3" {...props} />,
          h3: (props) => <h3 className="text-lg font-bold my-2" {...props} />,
          p: (props) => <p className="my-2" {...props} />,
          ul: (props) => <ul className="list-disc pl-5 my-2" {...props} />,
          ol: (props) => <ol className="list-decimal pl-5 my-2" {...props} />,
          li: (props) => <li className="my-1" {...props} />,
          a: (props) => (
            <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          blockquote: (props) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />
          ),
          img: (props) => <img alt={props.alt || "image"} className="max-w-full h-auto my-2" {...props} />,
          table: (props) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full divide-y divide-gray-200" {...props} />
            </div>
          ),
          thead: (props) => <thead className="bg-gray-50" {...props} />,
          tbody: (props) => <tbody className="divide-y divide-gray-200" {...props} />,
          tr: (props) => <tr {...props} />,
          th: (props) => (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
          ),
          td: (props) => <td className="px-6 py-4 whitespace-nowrap" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 