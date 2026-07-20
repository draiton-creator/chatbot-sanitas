import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { ChatMessage } from '../types';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface ChatCanvasProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  token?: string | null;
}

export function ChatCanvas({ messages, onSendMessage, isLoading, token }: ChatCanvasProps) {
  const [input, setInput] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleLocalUploadClick = () => {
    setShowAttachmentMenu(false);
    fileInputRef.current?.click();
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendMessage(`He adjuntado el archivo: "${file.name}"`);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const launchGooglePicker = () => {
    if (!token) {
        alert("Por favor, inicia sesión con Google primero para acceder a Drive.");
        return;
    }
    
    const gapi = (window as any).gapi;
    if (!gapi) {
        alert("La API de Google no se ha cargado todavía. Inténtalo de nuevo.");
        return;
    }

    gapi.load('picker', () => {
        const pickerOrigin = window.location.protocol + '//' + window.location.host;
        const picker = new (window as any).google.picker.PickerBuilder()
          .addView((window as any).google.picker.ViewId.DOCS)
          .setOAuthToken(token)
          .setCallback(pickerCallback)
          .setOrigin(pickerOrigin)
          .build();
        picker.setVisible(true);
    });
  };

  const handleDriveUploadClick = () => {
    setShowAttachmentMenu(false);
    launchGooglePicker();
  };

  const pickerCallback = (data: any) => {
    if (data.action === (window as any).google.picker.Action.PICKED) {
      const file = data.docs[0];
      onSendMessage(`He adjuntado el archivo de Drive: "${file.name}" (Enlace: ${file.url})`);
    }
  };

  return (
    <main className="flex-1 flex flex-col relative bg-surface-gray h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-8 space-y-6">
        
        {messages.length === 0 && (
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-end gap-2">
              <div className="w-10 h-10 rounded-full bg-white flex-shrink-0 flex items-center justify-center shadow-sm border border-border-subtle">
                <span className="material-symbols-outlined text-sanitas-blue" style={{ fontVariationSettings: "'FILL' 1" }}>robot_2</span>
              </div>
              <div className="max-w-[85%] bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-border-subtle">
                <p className="text-gray-800 text-sm md:text-base leading-relaxed">
                  ¡Hola! Soy Sanitos, tu asistente virtual. ¿En qué puedo ayudarte hoy? He visto que tienes acceso a varios servicios de salud digitales.
                </p>
              </div>
            </div>
            
            {/* Quick action chips */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ml-12">
              <button 
                onClick={() => onSendMessage("Quiero pedir una cita médica")}
                className="flex flex-col items-start p-4 bg-white border border-border-subtle rounded-2xl shadow-sm active:scale-95 transition-transform text-left hover:border-sanitas-blue">
                <span className="material-symbols-outlined text-sanitas-blue mb-2">calendar_today</span>
                <span className="text-sm font-semibold text-gray-800">Pedir cita</span>
              </button>
              <button 
                onClick={() => onSendMessage("Necesito una videoconsulta")}
                className="flex flex-col items-start p-4 bg-white border border-border-subtle rounded-2xl shadow-sm active:scale-95 transition-transform text-left hover:border-sanitas-blue">
                <span className="material-symbols-outlined text-sanitas-blue mb-2">videocam</span>
                <span className="text-sm font-semibold text-gray-800">Videoconsulta</span>
              </button>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-end gap-2'}`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex-shrink-0 flex items-center justify-center shadow-sm border border-border-subtle">
                   <span className="material-symbols-outlined text-sanitas-blue" style={{ fontVariationSettings: "'FILL' 1" }}>robot_2</span>
                </div>
              )}
              
              <div className={`max-w-[85%] md:max-w-[70%] ${
                  msg.role === 'user' 
                    ? 'bg-sanitas-blue text-white px-5 py-3 rounded-2xl chat-bubble-user shadow-sm' 
                    : 'bg-white text-gray-800 px-5 py-4 rounded-2xl chat-bubble-ai shadow-sm border border-border-subtle'
                }`}
              >
                {msg.role === 'model' ? (
                  <div className="prose prose-sm md:prose-base prose-p:leading-relaxed max-w-none text-gray-800 prose-a:text-sanitas-blue">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                ) : (
                  <p className="text-sm md:text-base">{msg.text}</p>
                )}
                <span className={`block text-[10px] mt-1 italic ${msg.role === 'user' ? 'text-white/70 text-right' : 'text-gray-400'}`}>
                  {format(msg.timestamp, 'HH:mm')}
                </span>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-end gap-2"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex-shrink-0 flex items-center justify-center shadow-sm border border-border-subtle">
                   <span className="material-symbols-outlined text-sanitas-blue" style={{ fontVariationSettings: "'FILL' 1" }}>robot_2</span>
              </div>
              <div className="bg-white px-5 py-4 rounded-2xl chat-bubble-ai shadow-sm border border-border-subtle">
                <div className="flex gap-1 items-center h-5">
                  <div className="w-2 h-2 bg-sanitas-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-sanitas-blue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-sanitas-blue rounded-full animate-bounce"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <footer className="p-4 md:px-12 bg-white/80 backdrop-blur-md border-t border-border-subtle shrink-0">
        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence>
            {showAttachmentMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-16 left-0 bg-white border border-border-subtle shadow-lg rounded-xl overflow-hidden flex flex-col min-w-[200px] z-50"
              >
                <button 
                  type="button"
                  onClick={handleLocalUploadClick}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm text-gray-700 transition-colors border-b border-gray-100"
                >
                  <span className="material-symbols-outlined text-sanitas-blue">upload_file</span>
                  Subir desde mi PC/Móvil
                </button>
                <button 
                  type="button"
                  onClick={handleDriveUploadClick}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm text-gray-700 transition-colors"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Google Drive" className="w-5 h-5" />
                  Subir de Google Drive
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLocalFileChange} 
            className="hidden" 
          />

          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-sanitas-blue bg-blue-50 rounded-full active:scale-90 transition-transform">
              <PlusIcon />
            </button>
            
            <div className="flex-grow relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setShowAttachmentMenu(false)}
                className="w-full py-3 px-5 bg-gray-50 border border-gray-200 rounded-full text-sm md:text-base focus:ring-2 focus:ring-sanitas-blue focus:border-transparent outline-none transition-all" 
                placeholder="Escribe tu mensaje..." 
                type="text"
              />
            </div>
            
            <button 
              disabled={!input.trim() || isLoading}
              type="submit"
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-sanitas-blue text-white rounded-full shadow-md active:scale-90 transition-transform disabled:opacity-50 disabled:active:scale-100">
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
        <p className="text-center mt-3 text-xs text-gray-400">
          Al usar Sanitos, aceptas nuestra <a className="underline hover:text-sanitas-blue" href="#">Política de Privacidad</a>
        </p>
      </footer>
    </main>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
