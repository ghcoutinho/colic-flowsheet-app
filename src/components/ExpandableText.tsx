import { useState } from 'react';

export default function ExpandableText({ text, maxLength = 80 }: { text: string, maxLength?: number }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!text || text.length <= maxLength) return <span>{text}</span>;
  
  return (
    <div>
      {expanded ? text : `${text.substring(0, maxLength)}... `}
      <button 
        onClick={() => setExpanded(!expanded)} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--primary-color)', 
          cursor: 'pointer', 
          padding: 0, 
          fontSize: '0.85em', 
          textDecoration: 'underline',
          fontWeight: 600,
          marginLeft: '4px'
        }}>
        {expanded ? 'Show less' : 'Read more'}
      </button>
    </div>
  );
}
