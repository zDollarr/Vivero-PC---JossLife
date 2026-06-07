import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

type Vista = 'inventario' | 'movimientos' | 'reporte' | 'usuarios';

interface SidebarProps {
  onReport?: () => void;
  isOnline: boolean;
  userName?: string;
  activeView: Vista;
  onNavigate: (view: Vista) => void;
}

export const Sidebar = ({
  onReport,
  isOnline,
  userName = 'Admin',
  activeView,
  onNavigate,
}: SidebarProps) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutConfirm = async () => {
    await signOut(auth);
  };

  return (
    <>
      <aside className="w-72 bg-gradient-to-b from-green-900 to-green-950 text-white flex flex-col shadow-2xl z-10 relative h-screen">
        <div className="p-8 border-b border-green-800/50">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">🌿</span>
            <h1 className="text-3xl font-bold tracking-wide text-white">JOSS LIFE</h1>
          </div>
          <p className="text-green-400 text-xs font-medium uppercase tracking-widest ml-1">
            Panel de control - Admin
          </p>
        </div>

        <nav className="flex-1 p-6 space-y-3">
          <button
            onClick={() => onNavigate('inventario')}
            className={`block w-full py-4 px-6 rounded-2xl font-bold tracking-[0.15em] text-left transition-all border ${
              activeView === 'inventario'
                ? 'bg-green-800/60 text-white shadow-lg border-green-700/30'
                : 'bg-green-900/20 text-green-100/70 border-transparent hover:bg-green-800/40 hover:text-white'
            }`}
          >
            INVENTARIO
          </button>

          <button
            onClick={() => onNavigate('movimientos')}
            className={`block w-full py-4 px-6 rounded-2xl font-bold tracking-[0.15em] text-left transition-all border ${
              activeView === 'movimientos'
                ? 'bg-green-800/60 text-white shadow-lg border-green-700/30'
                : 'bg-green-900/20 text-green-100/70 border-transparent hover:bg-green-800/40 hover:text-white'
            }`}
          >
            MOVIMIENTOS
          </button>

          <button
            onClick={() => {
              onNavigate('reporte');
              onReport?.();
            }}
            className={`block w-full py-4 px-6 rounded-2xl font-bold tracking-[0.15em] text-left transition-all border ${
              activeView === 'reporte'
                ? 'bg-green-800/60 text-white shadow-lg border-green-700/30'
                : 'bg-green-900/20 text-green-100/70 border-transparent hover:bg-green-800/40 hover:text-white'
            }`}
          >
            REPORTE
          </button>

          <button
            onClick={() => onNavigate('usuarios')}
            className={`block w-full py-4 px-6 rounded-2xl font-bold tracking-[0.15em] text-left transition-all border ${
              activeView === 'usuarios'
                ? 'bg-green-800/60 text-white shadow-lg border-green-700/30'
                : 'bg-green-900/20 text-green-100/70 border-transparent hover:bg-green-800/40 hover:text-white'
            }`}
          >
            USUARIOS
          </button>
        </nav>

        <div className="p-6 border-t border-green-800/50 bg-green-950/30">
          <div className="flex items-center justify-between bg-green-900/30 p-2 rounded-2xl border border-green-800/30">
            <div className="flex items-center gap-3 p-2 rounded-xl flex-1 cursor-default">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div className="flex-col">
                <p className="text-sm font-bold text-white leading-tight capitalize">
                  {userName}
                </p>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-green-400 animate-pulse' : 'bg-orange-500'
                    }`}
                  ></span>
                  <p
                    className={`text-[10px] font-medium ${
                      isOnline ? 'text-green-300' : 'text-orange-300'
                    }`}
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              title="Cerrar sesión"
              className="p-3 rounded-xl text-green-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all ml-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          ></div>

          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-[160] text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Cerrar sesión?</h3>
            <p className="text-gray-500 mb-6 text-sm">Tendrás que ingresar tus datos nuevamente.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};