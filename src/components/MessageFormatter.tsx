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

    // Enhanced regular expression to match text between asterisks
    // Matches *text* where text can contain any characters except asterisks
    const asteriskRegex = /\*([^*]+?)\*/g;
    let match;

    while ((match = asteriskRegex.exec(processedText)) !== null) {
      // Add text before the asterisk match
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

      // Add the asterisk content as italicized action text
      const actionText = match[1];
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
