import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// 간단한 Markdown → HTML 변환 (외부 라이브러리 없이)
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const renderMarkdown = (text: string): string => {
    return text
      // 제목
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // 볼드 + 이탤릭
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      // 목록
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal">$1</li>')
      .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc">$1</li>')
      // 인용구
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">$1</blockquote>')
      // 코드
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      // 줄바꿈
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div
      className={`prose prose-gray max-w-none leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{
        __html: `<p class="mb-4">${renderMarkdown(content)}</p>`,
      }}
    />
  );
};

export default MarkdownRenderer;
