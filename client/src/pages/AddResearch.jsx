import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import ResearchForm from '../components/ResearchForm.jsx';

function AddResearch() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await api('/research', { method: 'POST', body: data });
    navigate('/dashboard');
  };

  return (
    <div className="narrow">
      <h1>Add Research</h1>
      <ResearchForm onSubmit={handleSubmit} submitLabel="Create Research" />
    </div>
  );
}

export default AddResearch;
