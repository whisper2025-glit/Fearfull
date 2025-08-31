import React from 'react';

interface MessageFormatterProps {
  content: string;
  className?: string;
}

/**
 * Component that formats message content by parsing asterisks (*text*) 
 * and converting them to italicized, darker text for actions/descriptions
 */
export const MessageFormatter: React.FC<MessageFormatterProps> = ({ 
  content, 
  className = '' 
}) => {
  const formatMessage = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    // Regular expression to match text between asterisks
    const asteriskRegex = /\*([^*]+)\*/g;
    let match;

    while ((match = asteriskRegex.exec(text)) !== null) {
      // Add text before the asterisk match
      if (match.index > currentIndex) {
        const beforeText = text.slice(currentIndex, match.index);
        parts.push(beforeText);
      }

      // Add the asterisk content as italicized action text
      const actionText = match[1];
      parts.push(
        <span
          key={`action-${match.index}`}
          className="action-text"
        >
          {actionText}
        </span>
      );

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text after the last match
    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex));
    }

    return parts.length > 0 ? parts : [text];
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
