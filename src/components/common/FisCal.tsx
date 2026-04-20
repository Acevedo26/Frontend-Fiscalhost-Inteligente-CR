/* ============================================
   COMPONENTE: FisCal (Asistente Virtual)
   Descripción: Asistente contextual flotante
   ============================================ */

import React, { useState } from 'react';
import './FisCal.css';

interface FisCalMessage {
  id: string;
  type: 'bienvenida' | 'sugerencia' | 'alerta' | 'educativo';
  message: string;
}

const defaultMessages: FisCalMessage[] = [
  { id: '1', type: 'bienvenida', message: '¡Hola! Soy FisCal, tu asistente fiscal. Estoy aquí para ayudarte a no perder ni un colón en multas.' },
  { id: '2', type: 'sugerencia', message: 'Veo que tienes ingresos sin clasificar. ¿Te ayudo a revisarlos?' },
];

export const FisCal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState<FisCalMessage[]>(defaultMessages);
  const [inputMessage, setInputMessage] = useState('');

  const getIcon = () => {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <circle cx="12" cy="10" r="3" fill="var(--color-surface)" />
        <path d="M8 14c1-2 5-2 6 0" stroke="var(--color-surface)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 17l1.5 3M17 17l-1.5 3" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'educativo',
      message: inputMessage,
    }]);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'sugerencia',
        message: 'Gracias por tu mensaje. Estoy analizando tu consulta para darte la mejor información.',
      }]);
    }, 500);
    
    setInputMessage('');
  };

  return (
    <div className={`fiscal ${isOpen ? 'fiscal-open' : ''}`}>
      {isOpen && (
        <div className="fiscal-window">
          <div className="fiscal-header">
            <div className="fiscal-avatar">
              {getIcon()}
            </div>
            <div className="fiscal-title">
              <span>FisCal</span>
              <span className="fiscal-status">En línea</span>
            </div>
            <button className="fiscal-minimize" onClick={() => setIsMinimized(!isMinimized)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={isMinimized ? "M12 19V5M5 12l7-7 7 7" : "M5 12h14"} />
              </svg>
            </button>
          </div>
          
          {!isMinimized && (
            <>
              <div className="fiscal-messages">
                {messages.map(msg => (
                  <div key={msg.id} className={`fiscal-msg fiscal-msg-${msg.type}`}>
                    {msg.type === 'bienvenida' && (
                      <div className="msg-icon">🦉</div>
                    )}
                    <p>{msg.message}</p>
                  </div>
                ))}
              </div>
              
              <div className="fiscal-input">
                <input 
                  type="text" 
                  placeholder="Pregunta a FisCal..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} disabled={!inputMessage.trim()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
      
      <button 
        className={`fiscal-trigger ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <div className="trigger-icon">
          {getIcon()}
        </div>
        <span className="trigger-tooltip">¿Necesitas ayuda?</span>
      </button>
      
      {!isOpen && (
        <button className="fiscal-close-btn" onClick={() => setIsOpen(true)}>
          {getIcon()}
        </button>
      )}
    </div>
  );
};

export default FisCal;