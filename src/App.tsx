import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatCanvas } from './components/ChatCanvas';
import { LoginModal } from './components/LoginModal';
import { ChatMessage } from './types';
import { initAuth, logout } from './lib/firebase';
import { User } from 'firebase/auth';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (text: string) => {
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      role: 'user',
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Build history
      const history = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          message: text,
          history
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const newModelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.text,
        role: 'model',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, newModelMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.",
        role: 'model',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="bg-surface-gray text-on-surface antialiased overflow-hidden h-screen flex flex-col">
      {/* Top Header Mobile / Compact */}
      <header className="bg-deep-navy text-white shadow-md flex justify-between items-center px-4 py-3 w-full z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="md:hidden w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-white/20">
            <span className="material-symbols-outlined text-sanitas-blue" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
          </div>
          <div className="hidden md:block">
            <span className="material-symbols-outlined text-white">menu</span>
          </div>
          <span className="text-xl font-bold">Sanitos</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 items-center">
            <span className="text-sm font-semibold cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors">Videoconsulta</span>
            <span className="text-sm font-semibold text-white/70 cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors">Citas</span>
            <span 
              onClick={() => user ? handleLogout() : setIsLoginModalOpen(true)}
              className="text-sm font-semibold text-white/70 cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors">
              {user ? 'Cerrar Sesión' : 'Mi Sanitas'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined cursor-pointer hover:bg-white/10 p-2 rounded-full transition-colors">minimize</span>
            <span className="material-symbols-outlined cursor-pointer hover:bg-white/10 p-2 rounded-full transition-colors">close</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          user={user} 
          onLoginClick={() => setIsLoginModalOpen(true)} 
          onLogoutClick={handleLogout}
          onNewChat={handleNewChat}
        />
        <ChatCanvas 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
          token={token}
        />
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white flex justify-around items-center py-2 px-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
        <button className="flex flex-col items-center gap-1 text-sanitas-blue font-bold">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
          <span className="text-[10px]">Chat</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-sanitas-blue transition-colors">
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="text-[10px]">Citas</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-sanitas-blue transition-colors">
          <span className="material-symbols-outlined">folder_shared</span>
          <span className="text-[10px]">Carpeta</span>
        </button>
        <button 
          onClick={() => user ? handleLogout() : setIsLoginModalOpen(true)}
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-sanitas-blue transition-colors">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px]">{user ? 'Salir' : 'Perfil'}</span>
        </button>
      </nav>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
}
