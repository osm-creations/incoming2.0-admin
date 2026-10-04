import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Badge } from './DashboardPage';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const q = useQuery({ queryKey: ['users', search], queryFn: () => api.users(search) });
  return <>
    <header className="page-head"><div><span className="eyebrow">Accounts</span><h1>Users</h1></div><button className="primary compact" onClick={() => setShowCreate(true)}>Create user</button></header>
    <section className="panel">
      <div className="toolbar"><input className="search" placeholder="Search user ID or email" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {q.error ? <div className="error">{q.error.message}</div> : <div className="table-wrap"><table><thead><tr><th>User ID</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th></tr></thead><tbody>
        {q.data?.users.map((u: any) => <tr key={u.id}><td><Link to={`/users/${u.id}`}>{u.public_user_id}</Link></td><td>{u.email}</td><td>{u.role}</td><td><Badge value={u.status}/></td><td>{new Date(u.created_at).toLocaleDateString()}</td></tr>)}
      </tbody></table></div>}
    </section>
    {showCreate && <CreateUser onClose={() => setShowCreate(false)} />}
  </>;
}

function CreateUser({ onClose }: { onClose(): void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ publicUserId: '', email: '', password: '', role: 'MAGICIAN' });
  const mutation = useMutation({ mutationFn: () => api.createUser({ ...form, publicUserId: form.publicUserId || undefined }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); onClose(); } });
  function submit(e: FormEvent) { e.preventDefault(); mutation.mutate(); }
  return <div className="modal-backdrop" onMouseDown={e => { if (e.currentTarget === e.target) onClose(); }}><form className="modal" onSubmit={submit}>
    <div className="panel-title"><h2>Create user</h2><button type="button" className="icon-btn" onClick={onClose}>×</button></div>
    <label>Public User ID <input value={form.publicUserId} onChange={e => setForm(v => ({...v, publicUserId:e.target.value}))} placeholder="optional – generated if blank" /></label>
    <label>Email <input type="email" value={form.email} onChange={e => setForm(v => ({...v, email:e.target.value}))} required /></label>
    <label>Temporary password <input type="password" minLength={10} value={form.password} onChange={e => setForm(v => ({...v, password:e.target.value}))} required /></label>
    <label>Role <select value={form.role} onChange={e => setForm(v => ({...v, role:e.target.value}))}><option>MAGICIAN</option><option>ADMIN</option></select></label>
    {mutation.error && <div className="error">{mutation.error.message}</div>}
    <div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>Cancel</button><button className="primary" disabled={mutation.isPending}>Create</button></div>
  </form></div>;
}
