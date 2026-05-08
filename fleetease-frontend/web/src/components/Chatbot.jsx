import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Only show chatbot if logged in
  if (!token || !user) return null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ sender: 'bot', text: `Hi ${user.name}! I am Fleetease Assistant. How can I help you today?` }]);
    }
  }, [isOpen, messages.length, user.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const res = await api.post('/chatbot/message', { message: userMsg.text });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to server. Please try again later.' }]);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1050 }}>
      {isOpen ? (
        <div className="glass-card d-flex flex-column" style={{ width: '350px', height: '450px', padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Fleetease Support</h5>
            <button className="btn-close btn-close-white" onClick={() => setIsOpen(false)}></button>
          </div>
          
          {/* Messages Area */}
          <div className="p-3 flex-grow-1" style={{ overflowY: 'auto', background: 'rgba(15, 23, 42, 0.4)' }}>
            {messages.map((m, i) => (
              <div key={i} className={`d-flex mb-3 ${m.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                <div 
                  style={{
                    maxWidth: '80%',
                    padding: '10px 15px',
                    borderRadius: '15px',
                    background: m.sender === 'user' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    borderBottomRightRadius: m.sender === 'user' ? '0' : '15px',
                    borderBottomLeftRadius: m.sender === 'bot' ? '0' : '15px'
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-3" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <div className="input-group">
              <input 
                type="text" 
                className="form-control bg-light text-dark border-0" 
                placeholder="Ask me anything..." 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Send</button>
            </div>
          </form>
        </div>
      ) : (
        <button 
          className="btn btn-primary rounded-circle shadow-lg d-flex justify-content-center align-items-center" 
          style={{ width: '60px', height: '60px', fontSize: '24px' }}
          onClick={() => setIsOpen(true)}
        >
          💬
        </button>
      )}
    </div>
  );
}
