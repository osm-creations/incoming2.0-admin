import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Layout() {
  const auth = useAuth();
  const navigate = useNavigate();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">↘</div>
          <div><strong>Incoming 2.0</strong><span>Admin Console</span></div>
        </div>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/audit">Audit</NavLink>
        </nav>
        <div className="sidebar-foot">
          <small>{auth.user?.email}</small>
          <button className="ghost" onClick={async () => { await auth.logout(); navigate('/login'); }}>Log out</button>
        </div>
      </aside>
      <main className="content"><Outlet /></main>
    </div>
  );
}
