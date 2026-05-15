import { FormEvent, useEffect, useState } from 'react';
import type { DocumentItem, EmployeeProfile, User } from '../../types';

const emptyProfile: EmployeeProfile = {
  employeeId: '', firstName: '', lastName: '', personalEmail: '', phone: '', emergencyContactName: '', emergencyContactPhone: '', jobTitle: '', department: '', manager: '', contractType: '', hireDate: '', status: 'active'
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [profile, setProfile] = useState<EmployeeProfile>(emptyProfile);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const load = () => {
    fetch('/api/admin/users', { credentials: 'include' }).then(r => r.json()).then(d => setUsers(d.users || []));
    fetch('/api/admin/documents', { credentials: 'include' }).then(r => r.json()).then(d => setDocuments(d.documents || []));
  };
  useEffect(load, []);

  const createUser = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/users', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, role: 'employee', profile }) });
    setProfile(emptyProfile); setEmail(''); setPassword(''); load();
  };

  return <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
    <h1 className="text-3xl font-black">Administration RH</h1>
    <section className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-bold mb-4">Créer un employé</h2>
      <form onSubmit={createUser} className="grid md:grid-cols-2 gap-3">
        <input className="border rounded p-2" placeholder="Email pro" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="border rounded p-2" placeholder="Mot de passe temporaire" value={password} onChange={(e)=>setPassword(e.target.value)} />
        {Object.keys(emptyProfile).map((k) => <input key={k} className="border rounded p-2" placeholder={k} value={(profile as any)[k]} onChange={(e)=>setProfile({ ...profile, [k]: e.target.value })} />)}
        <button className="bg-blue-600 text-white rounded p-3 font-bold md:col-span-2">Créer le compte</button>
      </form>
    </section>
    <section className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-bold mb-4">Employés ({users.length})</h2>
      <div className="space-y-2">{users.map(u => <div key={u.id} className="p-3 border rounded flex justify-between"><span>{u.profile.firstName} {u.profile.lastName}</span><span className="text-sm text-gray-500">{u.email} - {u.role}</span></div>)}</div>
    </section>
    <section className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-bold mb-4">Documents ({documents.length})</h2>
      <div className="space-y-2">{documents.map(d => <div className="p-3 border rounded" key={d.id}>{d.title} · {d.category}</div>)}</div>
    </section>
  </div>;
}
