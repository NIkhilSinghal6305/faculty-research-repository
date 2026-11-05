import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import ResearchTable from '../components/ResearchTable.jsx';

function FacultyDashboard() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const res = await api('/research/mine');
      setRecords(res.data);
      setStats(res.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete "${record.title}"? This cannot be undone.`)) return;
    setError('');
    setMessage('');
    try {
      await api(`/research/${record._id}`, { method: 'DELETE' });
      setMessage('Research deleted.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1>My Dashboard</h1>
        <Link className="btn btn-primary" to="/research/new">+ Add Research</Link>
      </div>

      <div className="stats">
        <div className="stat"><span>{stats.total}</span>Total</div>
        <div className="stat"><span>{stats.published}</span>Published</div>
        <div className="stat"><span>{stats.draft}</span>Drafts</div>
      </div>

      {message && <p className="alert alert-success">{message}</p>}
      {error && <p className="alert alert-error">{error}</p>}
      {loading ? <p className="state">Loading...</p> : <ResearchTable records={records} onDelete={handleDelete} />}
    </div>
  );
}

export default FacultyDashboard;
