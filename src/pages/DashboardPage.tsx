import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function DashboardPage() {
  const q = useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard });
  if (q.isLoading) return <div className="loading">Loading…</div>;
  if (q.error) return <div className="error">{q.error.message}</div>;
  const d = q.data!;
  return <>
    <header className="page-head"><div><span className="eyebrow">Overview</span><h1>Dashboard</h1></div></header>
    <div className="stat-grid">
      <Stat label="Total users" value={d.counts.total} />
      <Stat label="Active" value={d.counts.active} />
      <Stat label="Disabled" value={d.counts.disabled} />
    </div>
    <section className="panel">
      <div className="panel-title"><h2>Recent accounts</h2></div>
      <div className="table-wrap"><table><thead><tr><th>User ID</th><th>Email</th><th>Role</th><th>Status</th><th>Last login</th></tr></thead>
        <tbody>{d.recent.map((u: any) => <tr key={u.id}><td>{u.public_user_id}</td><td>{u.email}</td><td>{u.role}</td><td><Badge value={u.status}/></td><td>{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never'}</td></tr>)}</tbody></table></div>
    </section>
  </>;
}
function Stat({ label, value }: { label: string; value: number }) { return <div className="stat"><span>{label}</span><strong>{value}</strong></div>; }
export function Badge({ value }: { value: string }) { return <span className={`badge ${value.toLowerCase()}`}>{value}</span>; }
