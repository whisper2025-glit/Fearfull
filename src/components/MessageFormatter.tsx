import React from 'react';
import { enhanceSimpleActions } from '@/lib/actionValidator';

interface MessageFormatterProps {
  content: string;
  className?: string;
  enforceComplexActions?: boolean; // Option to enhance/filter simple actions
}

/**
 * Component that formats message content by parsing asterisks (*text*) 
 * and converting them to italicized, darker text for actions/descriptions
 */
export const MessageFormatter: React.FC<MessageFormatterProps> = ({
  content,
  className = '',
  enforceComplexActions = true // Default to enforcing complex actions
}) => {
  const formatMessage = (text: string) => {
    // Enhance simple actions if enforcement is enabled
    const processedText = enforceComplexActions ? enhanceSimpleActions(text) : text;
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let partIndex = 0;

    // Combined regex to match both markdown images and asterisk actions
    // Markdown image syntax: ![alt text](image_url)
    // Asterisk syntax: *action text*
    const combinedRegex = /!\[([^\]]*?)\]\(([^)]+?)\)|\*([^*]+?)\*/g;
    let match;

    while ((match = combinedRegex.exec(processedText)) !== null) {
      // Add text before the current match
      if (match.index > currentIndex) {
        const beforeText = processedText.slice(currentIndex, match.index);
        if (beforeText) {
          parts.push(
            <React.Fragment key={`text-${partIndex++}`}>
              {beforeText}
            </React.Fragment>
          );
        }
      }

      // Check if this is a markdown image match
      if (match[0].startsWith('![')) {
        const altText = match[1] || '';
        const imageUrl = match[2];

        if (imageUrl.trim()) {
          parts.push(
            <img
              key={`image-${partIndex++}`}
              src={imageUrl}
              alt={altText}
              className="max-w-full h-auto rounded-lg my-2 shadow-md"
              style={{ maxHeight: '400px' }}
              onError={(e) => {
                // Handle broken images gracefully
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Add fallback text
                const fallback = document.createElement('span');
                fallback.textContent = `[Image: ${altText || 'Broken image'}]`;
                fallback.className = 'text-muted-foreground italic';
                target.parentNode?.insertBefore(fallback, target);
              }}
            />
          );
        }
      }
      // Check if this is an asterisk action match
      else if (match[0].startsWith('*')) {
        const actionText = match[3];
        if (actionText.trim()) {
          parts.push(
            <span
              key={`action-${partIndex++}`}
              className="action-text"
            >
              {actionText}
            </span>
          );
        }
      }

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text after the last match
    if (currentIndex < processedText.length) {
      const remainingText = processedText.slice(currentIndex);
      if (remainingText) {
        parts.push(
          <React.Fragment key={`text-${partIndex++}`}>
            {remainingText}
          </React.Fragment>
        );
      }
    }

    return parts.length > 0 ? parts : [processedText];
  };

  const formattedContent = formatMessage(content);

  return (
    <p className={`text-foreground whitespace-pre-wrap ${className}`}>
      {formattedContent.map((part, index) => (
        <React.Fragment key={index}>{part}</React.Fragment>
      ))}
    </p>
  );
};

export default MessageFormatter;
