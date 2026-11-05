import { Link } from 'react-router-dom';

// Table of research records with View / Edit / Delete buttons.
// showAuthor is used on the admin page.
function ResearchTable({ records, onDelete, showAuthor = false }) {
  if (records.length === 0) return <p className="state">No research records yet.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            {showAuthor && <th>Author</th>}
            <th>Domain</th>
            <th>Year</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              <td>{r.title}</td>
              {showAuthor && <td>{r.author ? r.author.name : 'Deleted user'}</td>}
              <td>{r.domain}</td>
              <td>{r.publicationYear}</td>
              <td><span className={r.status === 'Published' ? 'badge badge-green' : 'badge badge-grey'}>{r.status}</span></td>
              <td className="actions">
                <Link className="btn btn-small" to={`/research/${r._id}`}>View</Link>
                <Link className="btn btn-small" to={`/research/${r._id}/edit`}>Edit</Link>
                <button className="btn btn-small btn-danger" onClick={() => onDelete(r)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResearchTable;
