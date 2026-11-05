import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api.js';

function ResearchDetails() {
  const { id } = useParams();
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api(`/research/${id}`)
      .then((res) => setResearch(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="state">Loading...</p>;
  if (error) return (
    <div>
      <p className="alert alert-error">{error}</p>
      <Link to="/">Back to explorer</Link>
    </div>
  );

  const link = research.doiOrUrl
    ? research.doiOrUrl.startsWith('http') ? research.doiOrUrl : `https://doi.org/${research.doiOrUrl}`
    : '';

  return (
    <article className="detail">
      <Link to="/">← Back to explorer</Link>
      <h1>{research.title}</h1>
      {research.status === 'Draft' && <p className="alert">This record is a private draft.</p>}
      <p className="meta">
        {research.author ? `${research.author.name} (${research.author.email})` : 'Unknown author'}
      </p>
      <p>
        <span className="badge">{research.domain}</span>
        <span className="tag">{research.publicationYear}</span>
        <span className="tag">{research.journal}</span>
      </p>
      <h3>Abstract</h3>
      <p className="abstract">{research.abstract}</p>
      {research.keywords.length > 0 && (
        <p><strong>Keywords: </strong>{research.keywords.map((k) => <span className="tag" key={k}>{k}</span>)}</p>
      )}
      {link && <p><strong>DOI / URL: </strong><a href={link} target="_blank" rel="noreferrer">{research.doiOrUrl}</a></p>}
      <p className="muted">Last updated: {new Date(research.updatedAt).toLocaleDateString()}</p>
    </article>
  );
}

export default ResearchDetails;
