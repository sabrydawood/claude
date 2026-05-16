'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import CodePlayground from '@/components/ui/code-playground';

interface Block {
  type: 'html' | 'code';
  content: string;
  language?: 'javascript' | 'python';
}

// Simple markdown to HTML converter — handles headings, bold, blockquote, lists, paragraphs
function markdownToHtml(markdown: string): string {
  return markdown
    .trim()
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li><span class="bullet">•</span><span>$1</span></li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/^(\d+)\. (.+)$/gm, '<li><span class="num">$1.</span><span>$2</span></li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|u|b|l|p])(.+)$/gm, '<p>$1</p>');
}

function parseToBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const codeBlockRegex = /```(javascript|python|js|py)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    // Text before the code block
    if (match.index > lastIndex) {
      const text = markdown.slice(lastIndex, match.index).trim();
      if (text) blocks.push({ type: 'html', content: markdownToHtml(text) });
    }

    // The code block
    const lang = match[1];
    const code = match[2].trim();
    const language: 'javascript' | 'python' =
      lang === 'python' || lang === 'py' ? 'python' : 'javascript';

    blocks.push({ type: 'code', content: code, language });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text after the last code block
  if (lastIndex < markdown.length) {
    const text = markdown.slice(lastIndex).trim();
    if (text) blocks.push({ type: 'html', content: markdownToHtml(text) });
  }

  return blocks.length > 0
    ? blocks
    : [{ type: 'html', content: markdownToHtml(markdown) }];
}

interface LessonContentProps {
  content: string;
  direction: 'rtl' | 'ltr';
}

export default function LessonContent({ content, direction }: LessonContentProps) {
  const t = useTranslations('lessons');
  const blocks = useMemo(() => parseToBlocks(content), [content]);

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if (block.type === 'html') {
          return (
            <div
              key={i}
              className="prose prose-lg max-w-none lesson-content"
              style={{ direction }}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        }

        // Code block — render as runnable playground
        return (
          <div key={i} className="my-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] bg-[var(--zkawi-purple)]/10 text-[var(--zkawi-purple)] px-2 py-0.5 rounded-full font-bold">
                {t('activity.tryIt')}
              </span>
            </div>
            <CodePlayground
              starterCode={block.content}
              language={block.language ?? 'javascript'}
            />
          </div>
        );
      })}
    </div>
  );
}
