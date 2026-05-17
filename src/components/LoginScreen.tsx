import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface LoginProps {
  externalError?: string | null;
}

export const LoginScreen = ({ externalError }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (externalError) {
      setError(externalError);
      setLoading(false);
      setPassword(''); 
    }
  }, [externalError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') setError('Correo o contraseña incorrectos.');
      else setError('Error de acceso. Verifique sus datos.');
      
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row h-[600px]">
        
        <div className="md:w-1/2 bg-green-900 relative flex flex-col justify-center items-center p-10 text-white">
          <div className="absolute inset-0 bg-green-800/50 backdrop-blur-sm"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-extrabold mb-4 tracking-tight">JOSS LIFE</h1>
            <p className="text-green-100 text-lg">Panel Administrativo</p>
            <div className="mt-8 w-40 h-40 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md mx-auto">
              <span className="text-6xl">🌿</span>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido</h2>
          <p className="text-gray-500 mb-8">Ingresa tus credenciales.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-xl text-center border border-red-100 animate-pulse flex items-center justify-center gap-2">
                ⚠️ {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
