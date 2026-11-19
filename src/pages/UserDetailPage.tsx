import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { api } from '../lib/api';
import { Badge } from './DashboardPage';

export default function UserDetailPage() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['user', id], queryFn: () => api.user(id) });
  const [email, setEmail] = useState('');
  const [publicUserId, setPublicUserId] = useState('');
  useEffect(() => { if (q.data?.user) { setEmail(q.data.user.email); setPublicUserId(q.data.user.public_user_id); } }, [q.data]);
  const save = useMutation({ mutationFn: () => api.updateUser(id, { email, publicUserId }), onSuccess: () => qc.invalidateQueries({ queryKey: ['user', id] }) });
  const toggle = useMutation({ mutationFn: (enabled: boolean) => api.setEnabled(id, enabled), onSuccess: () => qc.invalidateQueries({ queryKey: ['user', id] }) });
  if (q.isLoading) return <div>Loading…</div>;
  if (q.error || !q.data) return <div className="error">{q.error?.message ?? 'Not found'}</div>;
  const u = q.data.user;
  function submit(e: FormEvent) { e.preventDefault(); save.mutate(); }
  return <>
    <header className="page-head"><div><Link className="back" to="/users">← Users</Link><h1>{u.public_user_id}</h1></div><Badge value={u.status}/></header>
    <div className="two-col">
      <form className="panel form-panel" onSubmit={submit}><h2>Account</h2>
        <label>Public User ID<input value={publicUserId} onChange={e => setPublicUserId(e.target.value)} /></label>
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Role<input value={u.role} disabled /></label>
        {save.error && <div className="error">{save.error.message}</div>}
        <button className="primary compact">Save changes</button>
      </form>
      <section className="panel"><h2>Security & status</h2><dl><div><dt>Created</dt><dd>{new Date(u.created_at).toLocaleString()}</dd></div><div><dt>Last login</dt><dd>{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never'}</dd></div><div><dt>Force password change</dt><dd>{u.force_password_change ? 'Yes' : 'No'}</dd></div></dl>
        <button className={u.status === 'ACTIVE' ? 'danger' : 'primary'} onClick={() => toggle.mutate(u.status !== 'ACTIVE')}>{u.status === 'ACTIVE' ? 'Disable user' : 'Enable user'}</button>
        <PasswordReset key={id} id={id} publicUserId={u.public_user_id} />
      </section>
    </div>
  </>;
}

function PasswordReset({ id, publicUserId }: { id: string; publicUserId: string }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  function close() {
    setOpen(false);
    setPassword('');
    setConfirmation('');
    setError('');
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    if (password !== confirmation) {
      setError('The passwords do not match.');
      return;
    }
    setError('');
    setPending(true);
    try {
      await api.resetPassword(id, password);
      close();
      if (auth.user?.id === id) {
        await auth.logout();
        qc.clear();
        navigate('/login', { replace: true });
      } else {
        setSuccess(true);
        void qc.invalidateQueries({ queryKey: ['user', id] });
        void qc.invalidateQueries({ queryKey: ['audit'] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return <div className="password-reset">
    {open ? <form className="form-panel" onSubmit={submit}>
      <h3>Reset password for {publicUserId}</h3>
      <label>New password
        <input type="password" autoFocus autoComplete="new-password" required minLength={12} maxLength={200}
          disabled={pending} value={password} onChange={e => setPassword(e.target.value)} />
        <small>Use 12–200 characters.</small>
      </label>
      <label>Confirm new password
        <input type="password" autoComplete="new-password" required minLength={12} maxLength={200}
          disabled={pending} value={confirmation} onChange={e => setConfirmation(e.target.value)} />
      </label>
      <small>{auth.user?.id === id ? 'You will need to sign in again.' : 'This signs the user out of their current sessions.'}</small>
      {error && <div className="error" role="alert">{error}</div>}
      <div className="modal-actions">
        <button type="button" className="ghost compact" disabled={pending} onClick={close}>Cancel</button>
        <button className="primary compact" disabled={pending}>{pending ? 'Resetting…' : 'Reset password'}</button>
      </div>
    </form> : <>
      {success && <p role="status">Password reset for {publicUserId}.</p>}
      <button type="button" className="ghost" onClick={() => { setSuccess(false); setOpen(true); }}>Reset password</button>
    </>}
  </div>;
}
