import { FormEvent, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setMessage('Les mots de passe ne correspondent pas.');
    const token = params.get('token');
    const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
    if (!res.ok) return setMessage('Lien invalide ou expiré.');
    setMessage('Mot de passe mis à jour. Redirection...');
    setTimeout(() => navigate('/employee/login'), 1000);
  };

  return <div className="max-w-md mx-auto my-16 bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
    <h1 className="text-2xl font-black mb-4">Nouveau mot de passe</h1>
    <form onSubmit={submit} className="space-y-4">
      <input type="password" className="w-full rounded-lg border p-3" placeholder="Nouveau mot de passe (10 caractères min)" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input type="password" className="w-full rounded-lg border p-3" placeholder="Confirmer le mot de passe" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <button className="w-full bg-blue-600 text-white rounded-lg p-3 font-bold">Mettre à jour</button>
    </form>
    {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
  </div>;
}
