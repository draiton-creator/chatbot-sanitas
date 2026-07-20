import React, { useState } from 'react';
import { X, Lock, ArrowRight } from 'lucide-react';
import { googleSignIn } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await googleSignIn();
      onClose();
    } catch (err: any) {
      setError('Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-deep-navy text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-lg">Mi Sanitas</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-blue-50/50 rounded-xl p-8 border-l-4 border-l-sanitas-blue flex flex-col items-center">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="w-5 h-5 text-sanitas-blue" />
                  <h3 className="text-sm font-bold text-sanitas-blue uppercase tracking-wider">Acceso Seguro a tus Datos</h3>
                </div>
                
                <p className="text-sm text-center text-gray-600 mb-6">
                  Inicia sesión con tu cuenta de Google para acceder a tus calendarios, documentos y hojas de cálculo directamente desde Sanitos.
                </p>

                {error && <p className="text-red-500 text-xs mb-4 text-center">{error}</p>}

                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="gsi-material-button w-full max-w-[280px] bg-white border border-gray-300 rounded overflow-hidden shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-70 h-10 flex items-center px-2 relative"
                >
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0">
                    <div className="gsi-material-button-state"></div>
                  </div>
                  <div className="flex items-center justify-center w-full h-full relative">
                    <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5" style={{ display: 'block' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="font-sans font-medium text-[14px] text-gray-600 tracking-wide">
                      {loading ? 'Accediendo...' : 'Sign in with Google'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
