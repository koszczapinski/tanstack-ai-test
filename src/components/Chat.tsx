import { useChat, fetchHttpStream } from '@tanstack/ai-react';
import React, { useState } from 'react';

export function Chat() {
  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchHttpStream('/api/chat'),
  });

  const [input, setInput] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>TanStack AI Chat</h1>
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '20px', 
        height: '400px', 
        overflowY: 'auto', 
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#888' }}>Start a conversation...</p>
        )}
        {messages.map((m) => (
          <div key={m.id} style={{ 
            marginBottom: '15px', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' 
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '0.8rem', 
              marginBottom: '4px',
              color: '#555' 
            }}>
              {m.role === 'user' ? 'You' : 'AI'}
            </div>
            <div style={{ 
              backgroundColor: m.role === 'user' ? '#007bff' : '#e9ecef', 
              color: m.role === 'user' ? 'white' : 'black',
              padding: '8px 12px', 
              borderRadius: '12px',
              maxWidth: '80%',
              whiteSpace: 'pre-wrap' 
            }}>
              {m.parts.map((part, i) => {
                  if (part.type === 'text') return <span key={i}>{part.content}</span>;
                  return null; 
              })}
            </div>
          </div>
        ))}
        {isLoading && <div style={{ textAlign: 'left', fontStyle: 'italic', color: '#888' }}>AI is thinking...</div>}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: '6px', 
            border: '1px solid #ccc',
            fontSize: '16px' 
          }}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()} 
          style={{ 
            padding: '12px 24px', 
            borderRadius: '6px', 
            border: 'none', 
            backgroundColor: '#007bff', 
            color: 'white', 
            fontSize: '16px', 
            cursor: 'pointer',
            opacity: isLoading || !input.trim() ? 0.6 : 1
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
