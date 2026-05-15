import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/employee" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/employee');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return <div className="max-w-md mx-auto my-16 bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
    <h1 className="text-2xl font-black text-gray-900 mb-2">Employee Portal</h1>
    <p className="text-gray-500 mb-6">Accédez à votre espace employé.</p>
    <form onSubmit={submit} className="space-y-4">
      <input className="w-full rounded-lg border p-3" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
      <input className="w-full rounded-lg border p-3" type="password" placeholder="Mot de passe" value={password} onChange={(e)=>setPassword(e.target.value)} />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button disabled={loading} className="w-full bg-blue-600 text-white rounded-lg p-3 font-bold hover:bg-blue-700">{loading ? 'Connexion...' : 'Se connecter'}</button>
    </form>
    <Link className="text-blue-600 text-sm mt-4 inline-block" to="/employee/forgot-password">Mot de passe oublié ?</Link>
  </div>;
}
