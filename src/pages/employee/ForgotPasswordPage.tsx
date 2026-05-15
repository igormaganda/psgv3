import { FormEvent, useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.message || data.resetLink || 'Si ce compte existe, un email sera envoyé.');
  };

  return <div className="max-w-md mx-auto my-16 bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
    <h1 className="text-2xl font-black mb-3">Réinitialiser le mot de passe</h1>
    <form onSubmit={submit} className="space-y-4">
      <input className="w-full rounded-lg border p-3" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
      <button className="w-full bg-blue-600 text-white rounded-lg p-3 font-bold">Envoyer le lien</button>
    </form>
    {message && <p className="mt-4 text-sm text-gray-700 break-all">{message}</p>}
  </div>;
}
