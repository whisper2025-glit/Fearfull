import React from 'react';
interface MessageFormatterProps {
  content: string;
  className?: string;
  enforceComplexActions?: boolean; // Kept for compatibility but defaults to false
}

/**
 * Consistently renders asterisk actions without altering user content.
 * - *text* becomes <span class="action-text">text</span>
 * - Escaped asterisks (\*) render as literal *
 * - Markdown images ![alt](url) are preserved
 */
export const MessageFormatter: React.FC<MessageFormatterProps> = ({
  content,
  className = '',
  enforceComplexActions = false
}) => {
  const decodeEscapes = (s: string) => s.replace(/\\\*/g, '*');

  const formatMessage = (text: string) => {
    const processedText = text; // do not mutate content
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let partIndex = 0;

    // Match markdown images or unescaped *...*
    const combinedRegex = /!\[([^\]]*?)\]\(([^)]+?)\)|(?<!\\)\*([^*]+?)(?<!\\)\*/g;
    let match: RegExpExecArray | null;

    while ((match = combinedRegex.exec(processedText)) !== null) {
      if (match.index > currentIndex) {
        const beforeText = decodeEscapes(processedText.slice(currentIndex, match.index));
        if (beforeText) parts.push(<React.Fragment key={`text-${partIndex++}`}>{beforeText}</React.Fragment>);
      }

      if (match[0].startsWith('![')) {
        const altText = match[1] || '';
        const imageUrl = match[2];
        if (imageUrl.trim()) {
          parts.push(
            <div key={`image-container-${partIndex++}`} className="my-2">
              <img
                src={imageUrl}
                alt={altText}
                className="max-w-full h-auto rounded-lg shadow-md border border-border/30 hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                style={{ maxHeight: '400px' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const container = target.parentElement;
                  if (container) container.innerHTML = `<span class="image-fallback">[Image: ${altText || 'Failed to load image'}]</span>`;
                }}
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.opacity = '0';
                  target.style.transform = 'scale(0.95)';
                  requestAnimationFrame(() => {
                    target.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    target.style.opacity = '1';
                    target.style.transform = 'scale(1)';
                  });
                }}
              />
            </div>
          );
        }
      } else if (match[0].startsWith('*')) {
        const actionText = match[3];
        if (actionText.trim()) {
          parts.push(
            <span key={`action-${partIndex++}`} className="action-text">
              {decodeEscapes(actionText)}
            </span>
          );
        }
      }

      currentIndex = match.index + match[0].length;
    }

    if (currentIndex < processedText.length) {
      const remainingText = decodeEscapes(processedText.slice(currentIndex));
      if (remainingText) parts.push(<React.Fragment key={`text-${partIndex++}`}>{remainingText}</React.Fragment>);
    }

    return parts.length > 0 ? parts : [decodeEscapes(processedText)];
  };

  const formattedContent = formatMessage(content);

  return (
    <div role="article" className={`text-foreground whitespace-pre-wrap ${className}`}>
      {formattedContent.map((part, index) => (
        <React.Fragment key={index}>{part}</React.Fragment>
      ))}
    </div>
  );
};

export default MessageFormatter;
