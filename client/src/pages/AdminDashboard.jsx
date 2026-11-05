import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ResearchTable from '../components/ResearchTable.jsx';

function AdminDashboard() {
  const { user: me } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const [s, u, r] = await Promise.all([api('/admin/stats'), api('/admin/users'), api('/admin/research')]);
      setStats(s.data);
      setUsers(u.data);
      setResearch(r.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const run = async (action, successText) => {
    setError('');
    setMessage('');
    try {
      await action();
      setMessage(successText);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const changeRole = (u, role) =>
    run(() => api(`/admin/users/${u._id}/role`, { method: 'PUT', body: { role } }), `${u.name} is now ${role}.`);

  const deleteUser = (u) => {
    if (!window.confirm(`Delete user "${u.name}" and all their research?`)) return;
    run(() => api(`/admin/users/${u._id}`, { method: 'DELETE' }), 'User deleted.');
  };

  const deleteResearch = (r) => {
    if (!window.confirm(`Delete "${r.title}"?`)) return;
    run(() => api(`/research/${r._id}`, { method: 'DELETE' }), 'Research deleted.');
  };

  if (loading) return <p className="state">Loading...</p>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {message && <p className="alert alert-success">{message}</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {stats && (
        <div className="stats">
          <div className="stat"><span>{stats.totalUsers}</span>Users</div>
          <div className="stat"><span>{stats.totalResearch}</span>Research records</div>
          <div className="stat"><span>{stats.published}</span>Published</div>
          <div className="stat"><span>{stats.draft}</span>Drafts</div>
        </div>
      )}

      <h2>Users</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  {u.role === 'admin' || u._id === me.id ? (
                    <span className="badge">{u.role}</span>
                  ) : (
                    <select value={u.role} onChange={(e) => changeRole(u, e.target.value)}>
                      <option value="student">student</option>
                      <option value="faculty">faculty</option>
                    </select>
                  )}
                </td>
                <td className="actions">
                  {u.role !== 'admin' && (
                    <button className="btn btn-small btn-danger" onClick={() => deleteUser(u)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>All Research</h2>
      <ResearchTable records={research} onDelete={deleteResearch} showAuthor />
    </div>
  );
}

export default AdminDashboard;
