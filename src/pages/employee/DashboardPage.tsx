import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { DocumentItem } from '../../types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentItem[]>([]);

  useEffect(() => {
    fetch('/api/documents', { credentials: 'include' }).then((r) => r.json()).then((d) => setDocs(d.documents || []));
  }, []);

  return <div className="max-w-7xl mx-auto px-4 py-12">
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 mb-10 shadow-xl">
      <h1 className="text-3xl font-black">Bienvenue, {user?.profile.firstName}</h1>
      <p className="mt-2 opacity-90">Votre espace employé PSG est prêt. Retrouvez vos documents et informations importantes.</p>
    </div>
    <h2 className="text-2xl font-bold mb-4">Documents internes</h2>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {docs.map((d) => <a key={d.id} href={d.url} target="_blank" rel="noreferrer" className="border rounded-xl p-4 bg-white hover:shadow-md transition">
        <p className="text-xs text-blue-600 font-semibold">{d.category}</p>
        <h3 className="font-bold text-gray-900">{d.title}</h3>
        <p className="text-sm text-gray-500">{d.description}</p>
      </a>)}
    </div>
  </div>;
}
