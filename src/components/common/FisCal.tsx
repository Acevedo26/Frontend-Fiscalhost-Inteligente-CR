/* ============================================
   COMPONENTE: FisCal (Asistente Virtual)
   Descripción: Asistente contextual flotante con IA (Groq)
   FiscalHost Inteligente CR
   ============================================ */

import { useState, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import './FisCal.css';
import { consultarGroq, type GroqMessage } from '../../features/soporte/services/GroqService';

interface FisCalMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  type: 'bienvenida' | 'sugerencia' | 'alerta' | 'educativo' | 'fuera-de-propósito';
  message: string;
  loading?: boolean;
}

const defaultMessages: FisCalMessage[] = [
  {
    id: '1',
    role: 'assistant',
    type: 'bienvenida',
    message: '¡Hola! Soy FisCal, tu asistente fiscal de FiscalHost Costa Rica. Pregúntame sobre IVA, renta, facturación electrónica, sanciones o cómo usar la plataforma.',
  },
];

export const FisCal: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState<FisCalMessage[]>(defaultMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getIcon = () => {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        <circle cx="12" cy="9" r="2" />
      </svg>
    );
  };

  const handleSend = useCallback(async () => {
    if (!inputMessage.trim()) return;

    const userMessage: FisCalMessage = {
      id: Date.now().toString(),
      role: 'user',
      type: 'educativo',
      message: inputMessage.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInputMessage('');

    try {
      const historial: GroqMessage[] = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.message }));

      const { content, isOutOfScope } = await consultarGroq(inputMessage.trim(), historial);

      const assistantMessage: FisCalMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: isOutOfScope ? 'fuera-de-propósito' : 'educativo',
        message: content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado al consultar al asistente.';
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          type: 'alerta',
          message: `Lo siento, ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, messages]);

  // Reiniciar a mensajes por defecto cuando se cierra el chat
  useEffect(() => {
    if (!isOpen) {
      setMessages(defaultMessages);
      setIsLoading(false);
      setInputMessage('');
    }
  }, [isOpen]);

  return (
    <div className={`fiscal ${isOpen ? 'fiscal-open' : ''}`}>
      {isOpen && (
        <div className="fiscal-window">
          <div className="fiscal-header">
            <div className="fiscal-avatar">{getIcon()}</div>
            <div className="fiscal-title">
              <span>FisCal</span>
              <span className="fiscal-status">{isLoading ? 'Escribiendo...' : 'En línea'}</span>
            </div>
            <button
              className="fiscal-minimize"
              onClick={() => setIsMinimized(!isMinimized)}
              type="button"
              aria-label="Minimizar ventana"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={isMinimized ? "M12 19V5M5 12l7-7 7 7" : "M5 12h14"} />
              </svg>
            </button>
          </div>

          {!isMinimized && (
            <>
              <div className="fiscal-messages">
                {messages.map((msg) => {
                  const esUsuario = msg.role === 'user';
                  const esFuera = msg.type === 'fuera-de-propósito';
                  return (
                    <div
                      key={msg.id}
                      className={`fiscal-msg fiscal-msg-${msg.type} ${esUsuario ? 'fiscal-msg-usuario' : ''} ${esFuera ? 'fiscal-msg-fuera' : ''}`}
                    >
                      {!esUsuario && msg.type === 'alerta' && <div className="msg-icon">⚠️</div>}
                      {!esUsuario && msg.type === 'fuera-de-propósito' && <div className="msg-icon">ℹ️</div>}
                      <p>{msg.message}</p>
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="fiscal-msg-escribiendo">
                    <span>Escribiendo</span>
                  </div>
                )}
              </div>

              <div className="fiscal-input">
                <input
                  type="text"
                  placeholder="Pregunta a FisCal..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputMessage.trim() || isLoading}
                  type="button"
                  aria-label="Enviar mensaje"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Círculo pequeño siempre visible: abre/cierra el asistente */}
      <button
        className="fiscal-circle"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-label="Abrir asistente FisCal"
      >
        <div className="circle-icon">{getIcon()}</div>
      </button>

      {/* Trigger con tooltip: aparece al hacer hover cuando está cerrado */}
      {!isOpen && (
        <button
          className="fiscal-trigger"
          onClick={() => setIsOpen(true)}
          type="button"
          aria-label="Abrir asistente FisCal"
        >
          <div className="trigger-icon">{getIcon()}</div>
          <span className="trigger-tooltip">¿Necesitas ayuda?</span>
        </button>
      )}
    </div>
  );
};

export default FisCal;
