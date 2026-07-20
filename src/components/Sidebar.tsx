import React from 'react';
import { LogIn, Calendar, Video, Receipt, MessageCircle, Plus, LogOut } from 'lucide-react';

interface SidebarProps {
  user: any;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onNewChat: () => void;
}

export function Sidebar({ user, onLoginClick, onLogoutClick, onNewChat }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col h-full py-4 px-2 bg-white border-r border-border-subtle w-64 shadow-sm z-40">
      <div className="flex items-center gap-3 mb-8 px-4">
        <div className="w-10 h-10 rounded-full bg-sanitas-blue flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
        </div>
        <div>
          <h2 className="text-[18px] font-semibold leading-tight text-sanitas-blue">Asistente Sanitos</h2>
          <p className="text-[12px] text-gray-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            En línea para ayudarte
          </p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
          <Calendar className="w-5 h-5" />
          Pedir cita
        </button>
        
        {user ? (
            <button 
                onClick={onLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                <LogOut className="w-5 h-5" />
                Cerrar sesión
            </button>
        ) : (
            <button 
                onClick={onLoginClick}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-sanitas-blue rounded-lg text-sm font-bold transition-colors hover:bg-blue-100">
                <LogIn className="w-5 h-5" />
                Mi Sanitas
            </button>
        )}

        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
          <Video className="w-5 h-5" />
          Videoconsulta
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
          <Receipt className="w-5 h-5" />
          Reembolsos
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
          <MessageCircle className="w-5 h-5" />
          Contacto
        </button>
      </nav>
      
      <button 
        onClick={onNewChat}
        className="mt-auto mx-2 bg-sanitas-blue text-white py-3 rounded-xl text-sm font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" />
        Nueva consulta
      </button>
    </aside>
  );
}
