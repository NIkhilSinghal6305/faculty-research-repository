import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { DOMAINS } from '../services/constants.js';
import ResearchCard from '../components/ResearchCard.jsx';

function Home() {
  const [filters, setFilters] = useState({ q: '', domain: '', year: '' });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (f) => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => v.trim() && params.append(k, v.trim()));
    try {
      const res = await api(`/research?${params.toString()}`);
      setRecords(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filters);
    // load once on page open; later searches use the Search button
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = (e) => {
    e.preventDefault();
    load(filters);
  };

  const handleReset = () => {
    const empty = { q: '', domain: '', year: '' };
    setFilters(empty);
    load(empty);
  };

  return (
    <div>
      <h1>Research Explorer</h1>
      <p className="muted">Browse published research by our faculty.</p>

      <form className="filters" onSubmit={handleSearch}>
        <input name="q" placeholder="Search title, author or keyword" value={filters.q} onChange={handleChange} />
        <select name="domain" value={filters.domain} onChange={handleChange}>
          <option value="">All domains</option>
          {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <input name="year" type="number" placeholder="Year" value={filters.year} onChange={handleChange} />
        <button className="btn btn-primary">Search</button>
        <button type="button" className="btn" onClick={handleReset}>Reset</button>
      </form>

      {loading && <p className="state">Loading research...</p>}
      {error && <p className="alert alert-error">{error}</p>}
      {!loading && !error && records.length === 0 && <p className="state">No research found. Try a different search.</p>}
      {!loading && !error && records.length > 0 && <p className="muted">{records.length} result(s)</p>}

      <div className="grid">
        {!loading && records.map((r) => <ResearchCard key={r._id} research={r} />)}
      </div>
    </div>
  );
}

export default Home;
