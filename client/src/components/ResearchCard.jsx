import { Link } from 'react-router-dom';

function ResearchCard({ research }) {
  const shortAbstract =
    research.abstract.length > 180 ? research.abstract.slice(0, 180) + '...' : research.abstract;

  return (
    <div className="card">
      <h3><Link to={`/research/${research._id}`}>{research.title}</Link></h3>
      <p className="meta">
        {research.author ? research.author.name : 'Unknown author'} · {research.journal} · {research.publicationYear}
      </p>
      <p>{shortAbstract}</p>
      <p>
        <span className="badge">{research.domain}</span>
        {research.keywords.map((k) => (
          <span className="tag" key={k}>{k}</span>
        ))}
      </p>
    </div>
  );
}

export default ResearchCard;
