import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ResearchForm from '../components/ResearchForm.jsx';

function EditResearch() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/research/${id}`)
      .then((res) => setResearch(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data) => {
    await api(`/research/${id}`, { method: 'PUT', body: data });
    navigate(user.role === 'admin' ? '/admin' : '/dashboard');
  };

  if (loading) return <p className="state">Loading...</p>;
  if (error) return <p className="alert alert-error">{error}</p>;

  return (
    <div className="narrow">
      <h1>Edit Research</h1>
      <ResearchForm initial={research} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </div>
  );
}

export default EditResearch;
