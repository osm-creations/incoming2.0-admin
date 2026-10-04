import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
export default function AuditPage() {
  const q = useQuery({ queryKey: ['audit'], queryFn: api.audit });
  return <><header className="page-head"><div><span className="eyebrow">Security</span><h1>Audit log</h1></div></header><section className="panel">
    {q.error ? <div className="error">{q.error.message}</div> : <div className="table-wrap"><table><thead><tr><th>Time</th><th>Action</th><th>Actor</th><th>Target</th><th>Request</th></tr></thead><tbody>
      {q.data?.audit.map((r: any) => <tr key={r.id}><td>{new Date(r.created_at).toLocaleString()}</td><td>{r.action}</td><td className="mono">{r.actor_user_id ?? 'system'}</td><td className="mono">{r.target_id ?? '—'}</td><td className="mono">{r.request_id ?? '—'}</td></tr>)}
    </tbody></table></div>}
  </section></>;
}
